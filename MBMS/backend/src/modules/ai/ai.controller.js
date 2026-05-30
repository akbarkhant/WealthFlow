const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2:1b';

const SYSTEM_PROMPT = `You are WealthFlow AI, a personal financial assistant built into the WealthFlow app.

Your role:
- Help users understand their spending, budgets, and financial habits
- Analyze transaction data provided to you and give clear insights
- Suggest practical saving and budgeting tips based on real data
- Answer only finance-related questions — politely decline anything unrelated

Rules:
- NEVER make up transaction data. Only use what is explicitly provided
- If no transaction data is provided, answer from general financial knowledge
- Keep answers concise, friendly, and actionable
- Format amounts with the currency symbol when known
- If asked something unrelated to finance, say: "I am only able to help with financial questions inside WealthFlow."

Tone: Professional but approachable. Like a smart friend who happens to be a financial advisor.`;

function buildTransactionContext(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return '';

  const lines = transactions.map(t =>
    `- ${t.description ?? 'Unknown'} | ${t.type ?? ''} | ${t.currency ?? ''} ${t.amount ?? ''} | Date: ${t.date ?? 'N/A'} | Category: ${t.categoryName ?? 'Uncategorized'}`
  );

  return `\nRelevant transactions from the user's account:\n${lines.join('\n')}\n`;
}

// Generic helper function to handle the streaming response pipeline from Ollama to Express
async function streamOllamaResponse(prompt, numPredict, temperature, res, next) {
  try {
    // 1. Establish SSE Headers so the client knows a stream is arriving
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 2. Request stream data from Ollama
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt,
      stream: true, // ← Tells Ollama to emit token chunks
      keep_alive: -1, // ← Keeps model cached in memory to eliminate cold starts
      options: {
        temperature,
        top_p: 0.9,
        num_predict: numPredict,
      },
    }, { responseType: 'stream' }); // ← Configures Axios to process binary streams

    // 3. Handle chunk buffers coming from the running local process
    response.data.on('data', (chunk) => {
      const buffer = chunk.toString();
      try {
        // Ollama emits chunks separated by newlines
        const lines = buffer.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            // Write the raw token character directly back out to the frontend client
            res.write(parsed.response);
          }
        }
      } catch (e) {
        // Fail silently on incomplete buffer chunks to protect active connection pipelines
      }
    });

    // 4. Terminate connection cleanly when generation completes
    response.data.on('end', () => {
      res.end();
    });

  } catch (err) {
    if (!res.headersSent) {
      return next(err);
    }
    res.end();
  }
}

async function chat(req, res, next) {
  const { message, transactions } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const transactionContext = buildTransactionContext(transactions);
  const prompt = `${SYSTEM_PROMPT}\n${transactionContext}\nUser: ${message}\nWealthFlow AI:`;

  // Streams back immediately with focused creativity (0.4)
  await streamOllamaResponse(prompt, 512, 0.4, res, next);
}

async function analyze(req, res, next) {
  const { expenses } = req.body;

  if (!expenses) {
    return res.status(400).json({ success: false, message: 'Expenses data is required' });
  }

  const prompt = `${SYSTEM_PROMPT}

The user wants to analyze their expenses. Here is the data:
${JSON.stringify(expenses, null, 2)}

Provide:
1. Total spending summary with amounts
2. Top 3 spending categories
3. 3 specific, actionable saving tips based on this data
4. An overall financial health score out of 10 with a brief reason

WealthFlow AI:`;

  // Streams analysis with slightly higher analytical consistency (0.3)
  await streamOllamaResponse(prompt, 600, 0.3, res, next);
}

async function suggest(req, res, next) {
  const { income, expenses } = req.body;

  if (!income || !expenses) {
    return res.status(400).json({ success: false, message: 'Income and expenses are required' });
  }

  const savings = income - Object.values(expenses).reduce((a, b) => a + b, 0);
  const savingsRate = ((savings / income) * 100).toFixed(1);

  const prompt = `${SYSTEM_PROMPT}

The user wants a personalized savings plan.
Monthly Income: $${income}
Monthly Expenses: ${JSON.stringify(expenses, null, 2)}
Current Monthly Savings: $${savings} (${savingsRate}% savings rate)

Provide:
1. Assessment of their current financial situation
2. Which specific expenses to reduce and by how much
3. A realistic monthly savings target
4. 3 beginner-friendly investment suggestions for their savings
5. A simple 3-month action plan

WealthFlow AI:`;

  // Streams budget options with longer context tracking length allocation (700)
  await streamOllamaResponse(prompt, 700, 0.3, res, next);
}

module.exports = { chat, analyze, suggest };