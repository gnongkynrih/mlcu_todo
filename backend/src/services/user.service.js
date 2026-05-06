const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");

const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const createUser = async (data) => {
  // const { name, email, password, role } = data;
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "user",
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

//update user
const updateUser = async (id, data) => {
  try {
    const { name, email, password, role } = data;
    const updateData = {
      name,
      email,
      role: role ?? "user",
    };
    if (password != null && String(password).length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
    });

    return user;
  } catch (error) {
    throw new Error("Failed to update User");
  }
};

//get user by id
const getUserById = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user");
  }
};

const findByEmailWithPassword = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const verifyCredentials = async (email, password) => {
  const user = await findByEmailWithPassword(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return user;
};

//Delete a task
const deleteUser = async (id) => {
  try {
    const user = await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });
    return user;
  } catch (error) {
    throw new Error("Failed to delete user");
  }
};

const searchUsers = async (task) => {
  try {
    if (!task) {
      return getAllUsers();
    }
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: task,
        },
      },
    });
    return users;
  } catch (error) {
    console.error("Search error:", error);
    throw new Error("Failed to search users");
  }
};

const createFirstAdminIfEmpty = async (data) => {
  const count = await prisma.user.count();
  if (count > 0) {
    throw new Error("Users already exist");
  }
  return createUser({ ...data, role: "admin" });
};

const countUsers = async () => prisma.user.count();

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  searchUsers,
  verifyCredentials,
  createFirstAdminIfEmpty,
  countUsers,
};
