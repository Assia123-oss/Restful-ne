const prisma = require('../lib/prisma');

const createVehicle = async (req, res) => {
  const userId = req.user.id;
  const { plate_number, vehicle_type, size, other_attributes } = req.body;
  try {
    const vehicle = await prisma.vehicles.create({
      data: {
        userId,
        plate_number,
        vehicle_type,
        size,
        other_attributes,
      },
    });

    await prisma.logs.create({
      data: {
        userId,
        action: `Vehicle ${plate_number} created`,
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Plate number already exists or server error' });
  }
};


const getVehicles = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const searchQuery = search.toLowerCase();

  try {
    let where = {};

    if (searchQuery) {
      const searchCondition = {
        OR: [
          { plate_number: { contains: searchQuery, mode: 'insensitive' } },
          { vehicle_type: { contains: searchQuery, mode: 'insensitive' } },
          { id: isNaN(searchQuery) ? undefined : parseInt(searchQuery) },
        ],
      };
      where = isAdmin ? searchCondition : { userId, ...searchCondition };
    } else if (!isAdmin) {
      where = { userId };
    }

    const [totalItems, vehicles] = await Promise.all([
      prisma.vehicles.count({ where }),
      prisma.vehicles.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        orderBy: { id: 'asc' },
        include: {
          slot_requests: {
            where: { request_status: 'approved' },
            take: 1,
          },
        },
      }),
    ]);

    const data = vehicles.map(v => ({
      ...v,
      approval_status: v.slot_requests[0]?.request_status || null,
    }));

    await prisma.logs.create({
      data: {
        userId,
        action: 'Vehicles list viewed',
      },
    });

    res.json({
      data,
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


const getVehicleById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  try {
    const vehicle = await prisma.vehicles.findFirst({
      where: {
        id: parseInt(id),
        ...(isAdmin ? {} : { userId }),
      },
      include: {
        slot_requests: {
          where: { request_status: 'approved' },
          take: 1,
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await prisma.logs.create({
      data: {
        userId,
        action: `Vehicle ID ${id} viewed`,
      },
    });

    res.json({
      ...vehicle,
      approval_status: vehicle.slot_requests[0]?.request_status || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


const updateVehicle = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { plate_number, vehicle_type, size, other_attributes } = req.body;

  try {
    const updated = await prisma.vehicles.updateMany({
      where: { id: parseInt(id), userId },
      data: { plate_number, vehicle_type, size, other_attributes },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await prisma.logs.create({
      data: {
        userId,
        action: `Vehicle ${plate_number} updated`,
      },
    });

    const vehicle = await prisma.vehicles.findUnique({ where: { id: parseInt(id) } });
    res.json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Plate number already exists or server error' });
  }
};


const deleteVehicle = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const { id } = req.params;

  try {
    const vehicle = await prisma.vehicles.findFirst({
      where: {
        id: parseInt(id),
        ...(isAdmin ? {} : { userId }),
      },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await prisma.vehicles.delete({
      where: { id: vehicle.id },
    });

    await prisma.logs.create({
      data: {
        userId,
        action: `Vehicle ${vehicle.plate_number} deleted`,
      },
    });

    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { createVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle };