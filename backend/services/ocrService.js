const { createWorker } = require("tesseract.js");

async function extractTextFromImage(buffer) {
  const worker = await createWorker("eng");

  try {
    const result = await worker.recognize(buffer);
    const data = result.data || {};

    return {
      text: String(data.text || "").replace(/\s+/g, " ").trim(),
      confidence: Math.round(Number(data.confidence || 0))
    };
  } finally {
    await worker.terminate();
  }
}

module.exports = { extractTextFromImage };
