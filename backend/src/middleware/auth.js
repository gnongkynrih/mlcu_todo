const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-change-me";

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role || "user" }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = Number(payload.sub);
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

module.exports = {
  signToken,
  authMiddleware,
  requireAdmin,
  JWT_SECRET,
};
