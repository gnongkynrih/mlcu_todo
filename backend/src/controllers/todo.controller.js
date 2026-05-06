const todoService = require("../services/todo.service");

const getTodos = async (req, res) => {
  try {
    const todos = await todoService.getAllTodos(req.userId);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

const addTodo = async (req, res) => {
  try {
    const todo = await todoService.createTodo(req.body, req.userId);
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
};

const updateTodo = async (req, res) => {
  try {
    const todo = await todoService.updateTodo(req.params.id, req.body, req.userId);
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update todo" });
  }
};

const getTodoById = async (req, res) => {
  try {
    const todo = await todoService.getTodoById(req.params.id, req.userId);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todo" });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const todo = await todoService.deleteTodo(req.params.id, req.userId);
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete todo" });
  }
};

const searchTodos = async (req, res) => {
  try {
    const task = req.query.task;
    const todos = await todoService.searchTodos(task, req.userId);
    res.json(todos);
  } catch (error) {
    console.error("Search controller error:", error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
};

module.exports = {
  getTodos,
  addTodo,
  updateTodo,
  getTodoById,
  deleteTodo,
  searchTodos,
};
