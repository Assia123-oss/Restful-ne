const prisma = require('../lib/prisma');

const getLogs = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, search = '' } = req.query;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const offset = (page - 1) * limit;

  try {
    // Build filter for search - search inside 'action' or 'userId' as text
    const whereClause = {
      OR: [
        {
          action: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          // userId is Int, so we convert search string to number and check equality if possible
          // But since search can be anything, we check userId as string only if numeric:
          userId: isNaN(Number(search)) ? undefined : Number(search),
        },
      ],
    };

    // Remove undefined conditions (if search isn't numeric, remove userId condition)
    if (whereClause.OR[1].userId === undefined) {
      whereClause.OR.pop(); // remove the userId condition
    }

    const [logs, totalItems] = await Promise.all([
      prisma.logs.findMany({
        where: whereClause,
        skip: offset,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } }, // optional: fetch user info
      }),
      prisma.logs.count({ where: whereClause }),
    ]);

    await prisma.logs.create({
      data: {
        userId,
        action: 'Logs list viewed',
      },
    });

    res.json({
      data: logs,
      meta: {
        totalItems,
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { getLogs };
