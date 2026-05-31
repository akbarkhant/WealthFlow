const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2:1b';

async function streamToClient(prompt, options, res, next) {
  try {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await axios.post(
      OLLAMA_URL,
      {
        model: MODEL,
        prompt,
        stream: true,
        keep_alive: -1,
        options: {
          temperature: options.temperature || 0.4,
          num_predict: options.num_predict || 512,
          top_p: 0.9,
        },
      },
      { responseType: 'stream', timeout: 30000 }
    );

    // Add this variable outside the on('data') function
    let buffer = '';

    response.data.on('data', (chunk) => {
      // 1. Add new chunk to the existing buffer
      buffer += chunk.toString();

      // 2. Split by newline
      const lines = buffer.split('\n');

      // 3. Keep the last element (which might be an incomplete line) in the buffer
      // pop() removes and returns the last element, modifying the array in place
      buffer = lines.pop() || '';

      // 4. Process only the complete lines
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.response) {
            res.write(json.response);
          }
        } catch (e) {
          // If JSON is malformed, we just ignore it. 
          // Because we use a buffer, this catch block won't trigger 
          // on valid lines that were just split across packets.
        }
      }
    });

    response.data.on('end', () => res.end());

    response.data.on('error', (err) => {
      console.error('Stream error:', err);
      res.end();
    });

  } catch (err) {
    console.error('AI Engine Error:', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.write('AI is temporarily unavailable. Please try again in a moment.');
    res.end();
  }
}

module.exports = { streamToClient };