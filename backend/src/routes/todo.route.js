const express = require("express");
const {
  getTodos,
  addTodo,
  updateTodo,
  getTodoById,
  deleteTodo,
  searchTodos,
} = require("../controllers/todo.controller");

const router = express.Router();

router.get("/get-todos", getTodos);
router.get("/search", searchTodos);
router.post("/save", addTodo);
router.put("/:id", updateTodo);
router.get("/:id", getTodoById);
router.delete("/:id", deleteTodo);

module.exports = router;
