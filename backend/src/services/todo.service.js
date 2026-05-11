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

const getTodosByDateRange = async (startDate, endDate) => {
  try {
    //select * from todos where createdAt between startdate and enddate
    const todos = await prisma.todo.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return todos;
  } catch (error) {
    console.error("Date range search error:", error);
    throw new Error("Failed to fetch todos by date range");
  }
};

const exportTodosToExcel = async (startDate, endDate) => {
  try {
    const ExcelJS = require("exceljs");
    const todos = await getTodosByDateRange(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Todos");

    // Add headers
    worksheet.columns = [
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Status", key: "is_completed", width: 15 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    // Add data rows
    todos.forEach((todo) => {
      worksheet.addRow({
        title: todo.title,
        description: todo.description || "",
        is_completed: todo.is_completed ? "Completed" : "Pending",
        createdAt: todo.createdAt.toISOString(),
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    return workbook;
  } catch (error) {
    console.error("Excel export error:", error);
    throw new Error("Failed to export todos to Excel");
  }
};

module.exports = {
  getAllTodos,
  createTodo,
  updateTodo,
  getTodoById,
  deleteTodo,
  searchTodos,
  getTodosByDateRange,
  exportTodosToExcel,
};
