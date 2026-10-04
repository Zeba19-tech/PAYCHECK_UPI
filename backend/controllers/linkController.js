const { analyzeLink } = require("../utils/riskEngine");

async function checkLink(req, res, next) {
  try {
    const url = req.body?.url || "";
    const data = analyzeLink(url);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { checkLink };
