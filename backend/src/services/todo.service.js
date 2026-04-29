const prisma = require("../lib/prisma");

const getAllTodos = async () => {
  return prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const createTodo = async (data) => {
  return prisma.todo.create({
    data: {
      title: data.title,
      description: data.description || null,
      is_completed: data.is_completed ?? false,
    },
  });
};

//update todo
const updateTodo = async (id, data) => {
  try {
    const { title, description, is_completed } = data;
    const todo = await prisma.todo.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title,
        description,
        is_completed,
      },
    });

    return todo;
  } catch (error) {
    throw new Error("Failed to update todo");
  }
};

//get todo by id
const getTodoById = async (id) => {
  try {
    const todo = await prisma.todo.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    return todo;
  } catch (error) {
    throw new Error("Failed to fetch todo");
  }
};

//Delete a task
const deleteTodo = async (id) => {
  try {
    const todo = await prisma.todo.delete({
      where: {
        id: parseInt(id),
      },
    });
    return todo;
  } catch (error) {
    throw new Error("Failed to delete todo");
  }
};

const searchTodos = async (task) => {
  try {
    if (!task) {
      return getAllTodos();
    }
    const todos = await prisma.todo.findMany({
      where: {
        title: {
          contains: task,
        },
      },
    });
    return todos;
  } catch (error) {
    console.error("Search error:", error);
    throw new Error("Failed to search todos");
  }
};

module.exports = {
  getAllTodos,
  createTodo,
  updateTodo,
  getTodoById,
  deleteTodo,
  searchTodos,
};
