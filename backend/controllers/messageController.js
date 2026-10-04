const { analyzeTextRisk } = require("../utils/riskEngine");

async function analyzeMessage(req, res, next) {
  try {
    const message = req.body?.message || "";
    const data = analyzeTextRisk(message);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { analyzeMessage };
