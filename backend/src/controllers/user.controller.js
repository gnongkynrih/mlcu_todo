const userService = require("../services/user.service");
const { signToken } = require("../middleware/auth");
//returns all the user object except the password
const dontReturnPassword = (user) => {
  if (!user) return null;
  const { password, ...withoutPassword } = user;
  return withoutPassword;
};

const bootstrapFirstAdmin = async (req, res) => {
  try {
    const user = await userService.createFirstAdminIfEmpty(req.body);
    const token = signToken(user);
    res
      .status(201)
      .json({ token, user: dontReturnPassword(user) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const setupStatus = async (req, res) => {
  try {
    const count = await userService.countUsers();
    res.json({ needsBootstrap: count === 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to check setup status" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const user = await userService.verifyCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken(user);
    res.json({ token, user: dontReturnPassword(user) });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users.map(dontReturnPassword));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const addUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(dontReturnPassword(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(dontReturnPassword(user));
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(dontReturnPassword(user));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    res.json(dontReturnPassword(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const task = req.query.task;
    const users = await userService.searchUsers(task);
    res.json(users.map(dontReturnPassword));
  } catch (error) {
    console.error("Search controller error:", error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
};

module.exports = {
  setupStatus,
  bootstrapFirstAdmin,
  login,
  getUsers,
  addUser,
  updateUser,
  getUserById,
  deleteUser,
  searchUsers,
};
