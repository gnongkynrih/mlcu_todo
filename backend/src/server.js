const express = require("express");
const cors = require("cors");
require("dotenv").config();
const todoRoutes = require("./routes/todo.route");
const userRoutes = require("./routes/user.route");
const dashboardRoutes = require("./routes/dashboard.route");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/todos", todoRoutes);
app.use("/users", userRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
