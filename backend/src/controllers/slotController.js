const prisma = require('../lib/prisma');

// BULK CREATE SLOTS
const bulkCreateSlots = async (req, res) => {
  const userId = req.user.id;
  const { slots } = req.body;
  try {
    const createdSlots = await prisma.parking_slots.createMany({
      data: slots.map(slot => ({
        slot_number: slot.slot_number,
        size: slot.size,
        vehicle_type: slot.vehicle_type,
        location: slot.location
      })),
      skipDuplicates: true,
    });

    await prisma.logs.create({
      data: {
        userId: userId,
        action: `Bulk created ${slots.length} slots`
      }
    });

    const allCreated = await prisma.parking_slots.findMany({
      orderBy: { id: 'desc' },
      take: slots.length
    });

    res.status(201).json(allCreated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Slot number already exists or server error' });
  }
};

// GET SLOTS
const getSlots = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const isAdmin = req.user.role === 'admin';

  try {
    const where = {
      OR: [
        { slot_number: { contains: search, mode: 'insensitive' } },
        { vehicle_type: { contains: search, mode: 'insensitive' } }
      ],
      ...(isAdmin ? {} : { status: 'available' })
    };

    const totalItems = await prisma.parking_slots.count({ where });
    const slots = await prisma.parking_slots.findMany({
      where,
      skip: +offset,
      take: +limit,
      orderBy: { id: 'asc' }
    });

    await prisma.logs.create({
      data: {
        userId: req.user.id,
        action: 'Slots list viewed'
      }
    });

    res.json({
      data: slots,
      meta: {
        totalItems,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        limit: parseInt(limit),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// UPDATE SLOT
const updateSlot = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { slot_number, size, vehicle_type, location } = req.body;

  try {
    const updatedSlot = await prisma.parking_slots.update({
      where: { id: parseInt(id) },
      data: {
        slot_number,
        size,
        vehicle_type,
        location
      }
    });

    await prisma.logs.create({
      data: {
        userId: userId,
        action: `Slot ${slot_number} updated`
      }
    });

    res.json(updatedSlot);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Slot not found or already exists' });
  }
};

// DELETE SLOT
const deleteSlot = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const deletedSlot = await prisma.parking_slots.delete({
      where: { id: parseInt(id) }
    });

    await prisma.logs.create({
      data: {
        userId: userId,
        action: `Slot ${deletedSlot.slot_number} deleted`
      }
    });

    res.json({ message: 'Slot deleted' });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Slot not found' });
  }
};

module.exports = {
  bulkCreateSlots,
  getSlots,
  updateSlot,
  deleteSlot
};
