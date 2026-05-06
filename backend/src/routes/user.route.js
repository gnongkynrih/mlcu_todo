const express = require("express");
const {
  setupStatus,
  bootstrapFirstAdmin,
  login,
  getUsers,
  addUser,
  updateUser,
  getUserById,
  deleteUser,
  searchUsers,
} = require("../controllers/user.controller");
const { authMiddleware, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/setup-status", setupStatus);
router.post("/bootstrap-first-admin", bootstrapFirstAdmin);
router.post("/login", login);

router.use(authMiddleware);
router.use(requireAdmin);

router.get("/get-users", getUsers);
router.get("/search", searchUsers);
router.post("/save", addUser);
router.put("/edit/:id", updateUser);
router.get("/view/:id", getUserById);
router.delete("/delete/:id", deleteUser);

module.exports = router;
