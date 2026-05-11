const dashboardService = require("../services/dashboard.service");

const getSummary = async (req, res) => {
  try {
    const summary = await dashboardService.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
};

module.exports = { getSummary };
