const prisma = require("../lib/prisma");

async function getDashboardSummary() {
  // const [userCount, completedTodos, incompleteTodos, users, byUser] =
  //   await Promise.all([
  //     prisma.user.count(),
  //     prisma.todo.count({ where: { is_completed: true } }),
  //     prisma.todo.count({ where: { is_completed: false } }),
  //     prisma.user.findMany({
  //       select: { id: true, name: true, email: true },
  //       orderBy: { id: "asc" },
  //     }),
  //     prisma.todo.groupBy({
  //       by: ["userId"],
  //       _count: { id: true },
  //     }),
  //   ]);

  const userCount = await prisma.user.count();
  const completedTodos = await prisma.todo.count({ where: { is_completed: true } });
  const incompleteTodos = await prisma.todo.count({ where: { is_completed: false } });
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { id: "asc" },
  });
  
  const byUser = await prisma.todo.groupBy({
    by: ["userId"],
    _count: { id: true },
  });

  const countByUserId = new Map(
    byUser.map((row) => [row.userId, row._count.id])
  );

  const tasksPerUser = users.map((u) => ({
    userId: u.id,
    name: u.name?.trim() ? u.name : u.email,
    email: u.email,
    taskCount: countByUserId.get(u.id) ?? 0,
  }));

  return {
    userCount,
    todosCompleted: completedTodos,
    todosIncomplete: incompleteTodos,
    tasksPerUser,
  };
}

module.exports = { getDashboardSummary };
