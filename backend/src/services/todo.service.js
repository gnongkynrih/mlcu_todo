const prisma = require("../lib/prisma");

const getAllTodos = async (userId) => {
  return prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

const createTodo = async (data, userId) => {
  return prisma.todo.create({
    data: {
      title: data.title,
      description: data.description || null,
      is_completed: data.is_completed ?? false,
      userId,
    },
  });
};

const updateTodo = async (id, data, userId) => {
  try {
    const existing = await prisma.todo.findFirst({
      where: { id: parseInt(id), userId },
    });
    if (!existing) throw new Error("Todo not found");

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

const getTodoById = async (id, userId) => {
  try {
    const todo = await prisma.todo.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });
    return todo;
  } catch (error) {
    throw new Error("Failed to fetch todo");
  }
};

const deleteTodo = async (id, userId) => {
  try {
    const existing = await prisma.todo.findFirst({
      where: { id: parseInt(id), userId },
    });
    if (!existing) throw new Error("Todo not found");

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

const searchTodos = async (task, userId) => {
  try {
    if (!task) {
      return getAllTodos(userId);
    }
    const todos = await prisma.todo.findMany({
      where: {
        userId,
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
