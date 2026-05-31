// backend/src/modules/ai/ai.receipt.js
//
// Feature 11 — Receipt Scanner
// Pipeline: multer upload → Tesseract OCR → Ollama parse → structured transaction fields
//
const path       = require('path');
const fs         = require('fs');
const Tesseract  = require('tesseract.js');
const { generateOnce, parseJson } = require('./ai.engine');

/**
 * Step 1: Run Tesseract OCR on the uploaded image file.
 * Returns raw extracted text string.
 */
async function extractTextFromImage(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
    logger: () => {} // suppress progress logs
  });
  return text.trim();
}

/**
 * Step 2: Send OCR text to Ollama — extract structured receipt data.
 * Returns { merchant, total, date, items[], currency }
 */
async function parseReceiptText(rawOcrText) {
  const prompt = `
You are a receipt parsing engine for the WealthFlow finance app.
Extract structured data from the following OCR text of a receipt.

OCR Text:
"""
${rawOcrText}
"""

Reply with a raw JSON object ONLY — no markdown, no extra text:
{
  "merchant": "Store or restaurant name",
  "total": 0.00,
  "date": "YYYY-MM-DD or null if not found",
  "currency": "PKR or USD or detected currency symbol",
  "items": [
    { "name": "item name", "amount": 0.00 }
  ]
}

Rules:
- "total" must be a plain number (no currency symbols).
- "date" must be ISO format YYYY-MM-DD or null.
- "items" should list individual line items if visible; empty array if not.
- If merchant is unclear, use "Unknown Merchant".
- Never include markdown formatting or backticks.
`;

  const raw = await generateOnce(prompt, { temperature: 0.1, num_predict: 600 });

  try {
    return parseJson(raw);
  } catch {
    // Fallback: return a minimal object so the UI always gets something usable
    return {
      merchant: 'Unknown Merchant',
      total:    0,
      date:     null,
      currency: 'PKR',
      items:    [],
      parseError: true,
    };
  }
}

/**
 * Main export — called by ai.controller.js after multer saves the file.
 * Cleans up the temp file after processing.
 */
async function scanReceipt(filePath) {
  try {
    const ocrText = await extractTextFromImage(filePath);

    if (!ocrText || ocrText.length < 10) {
      return {
        success: false,
        error:   'Could not extract readable text from this image. Please upload a clearer photo.',
        raw:     ocrText,
      };
    }

    const parsed = await parseReceiptText(ocrText);

    return {
      success: true,
      raw:     ocrText,
      ...parsed,
    };

  } finally {
    // Always clean up the temp upload regardless of success/failure
    try {
      fs.unlinkSync(filePath);
    } catch (_) {}
  }
}

module.exports = { scanReceipt };