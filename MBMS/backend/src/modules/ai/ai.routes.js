const express = require("express");
const axios = require("axios");
const router = express.Router();

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "llama3.2:1b"; // change to mistral when you upgrade RAM

// 💬 General financial chatbot
router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt: `You are a smart financial assistant for the Wealth Flow app.
               Answer clearly and concisely.
               User: ${message}`,
      stream: false,
    });

    res.json({ reply: response.data.response });
  } catch (err) {
    res.status(500).json({ error: "AI service unavailable", detail: err.message });
  }
});

// 📊 Analyze expenses
router.post("/analyze", async (req, res) => {
  const { expenses } = req.body;

  if (!expenses) {
    return res.status(400).json({ error: "Expenses data is required" });
  }

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt: `You are a financial analyst. Analyze these expenses and give:
               1. Total spending summary
               2. Top spending categories
               3. 3 actionable saving tips
               
               Expenses: ${JSON.stringify(expenses)}`,
      stream: false,
    });

    res.json({ analysis: response.data.response });
  } catch (err) {
    res.status(500).json({ error: "AI service unavailable", detail: err.message });
  }
});

// 💡 Savings suggestions
router.post("/suggest", async (req, res) => {
  const { income, expenses } = req.body;

  if (!income || !expenses) {
    return res.status(400).json({ error: "Income and expenses are required" });
  }

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt: `You are a personal finance advisor.
               Monthly Income: $${income}
               Monthly Expenses: ${JSON.stringify(expenses)}
               
               Give a clear savings plan with:
               1. How much they can save per month
               2. Which expenses to cut
               3. Investment suggestions for beginners`,
      stream: false,
    });

    res.json({ suggestions: response.data.response });
  } catch (err) {
    res.status(500).json({ error: "AI service unavailable", detail: err.message });
  }
});

module.exports = router;