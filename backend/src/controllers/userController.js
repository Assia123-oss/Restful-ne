const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    await prisma.logs.create({
      data: {
        userId: userId,
        action: 'User profile viewed',
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, password } = req.body;

  try {
    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updatedData,
      select: { id: true, name: true, email: true, role: true },
    });

    await prisma.logs.create({
      data: {
        userId: userId,
        action: 'User profile updated',
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};


const getUsers = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  try {
    const [users, totalItems] = await Promise.all([
      prisma.users.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { id: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_verified: true,
        },
      }),
      prisma.users.count({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    await prisma.logs.create({
      data: {
        userId: req.user.id,
        action: 'Users list viewed',
      },
    });

    res.json({
      data: users,
      meta: {
        totalItems,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: 'Server error' });
  }
};


const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.users.delete({
      where: { id: parseInt(id) },
    });

    await prisma.logs.create({
      data: {
        userId: req.user.id,
        action: `User ${id} deleted`,
      },
    });

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { getProfile, updateProfile, getUsers, deleteUser };
