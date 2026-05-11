const express = require("express");
const { getSummary } = require("../controllers/dashboard.controller");
const { authMiddleware, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get("/summary", getSummary);

module.exports = router;
