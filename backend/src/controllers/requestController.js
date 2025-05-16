const prisma = require('../lib/prisma');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');

const createRequest = async (req, res) => {
  const userId = req.user.id;
  const { vehicle_id } = req.body;

  try {
    // Check if vehicle belongs to user
    const vehicle = await prisma.vehicles.findFirst({
      where: { id: vehicle_id, userId: userId }
    });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Create slot request with status 'pending'
    const slotRequest = await prisma.slot_requests.create({
      data: {
        vehicleId: vehicle_id,
        request_status: 'pending',
      }
    });

    // Log the action
    await prisma.logs.create({
      data: {
        userId,
        action: `Slot request created for vehicle ${vehicle_id}`,
      }
    });

    res.status(201).json(slotRequest);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getRequests = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;
  const isAdmin = req.user.role === 'admin';

  try {
    // Build search filter
    const searchFilter = {
      OR: [
        { vehicle: { plate_number: { contains: search, mode: 'insensitive' } } },
        { request_status: { contains: search, mode: 'insensitive' } }
      ]
    };

    // If not admin, filter by user vehicles only
    const whereFilter = isAdmin
      ? searchFilter
      : {
          AND: [
            searchFilter,
            { vehicle: { userId } }
          ]
        };

    // Get total count for pagination
    const totalItems = await prisma.slot_requests.count({ where: whereFilter });

    // Get paginated slot requests with related vehicle info
    const requests = await prisma.slot_requests.findMany({
      where: whereFilter,
      include: {
        vehicle: {
          select: {
            plate_number: true,
            vehicle_type: true,
          }
        }
      },
      orderBy: { id: 'asc' },
      skip,
      take: Number(limit),
    });

    // Log viewing action
    await prisma.logs.create({
      data: {
        userId,
        action: 'Slot requests list viewed',
      }
    });

    res.json({
      data: requests,
      meta: {
        totalItems,
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / limit),
        limit: Number(limit),
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { vehicle_id } = req.body;

  try {
    // Check if vehicle belongs to user
    const vehicle = await prisma.vehicles.findFirst({
      where: { id: vehicle_id, userId }
    });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Update slot request only if it belongs to user and status is 'pending'
    const updatedRequest = await prisma.slot_requests.updateMany({
      where: {
        id: Number(id),
        vehicle: { userId },
        request_status: 'pending'
      },
      data: {
        vehicleId: vehicle_id
      }
    });

    if (updatedRequest.count === 0) {
      return res.status(404).json({ error: 'Request not found or not editable' });
    }

    // Log the update
    await prisma.logs.create({
      data: {
        userId,
        action: `Slot request ${id} updated`,
      }
    });

    // Return updated slot request data
    const request = await prisma.slot_requests.findUnique({ where: { id: Number(id) } });
    res.json(request);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Delete only if user owns the request and status is 'pending'
    const deletedRequest = await prisma.slot_requests.deleteMany({
      where: {
        id: Number(id),
        vehicle: { userId },
        request_status: 'pending'
      }
    });

    if (deletedRequest.count === 0) {
      return res.status(404).json({ error: 'Request not found or not deletable' });
    }

    // Log deletion
    await prisma.logs.create({
      data: {
        userId,
        action: `Slot request ${id} deleted`,
      }
    });

    res.json({ message: 'Request deleted' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const approveRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Fetch request with vehicle and user info if status pending
    const request = await prisma.slot_requests.findFirst({
      where: { id: Number(id), request_status: 'pending' },
      include: {
        vehicle: true,
        vehicle: {
          include: {
            user: true
          }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    const { vehicle, vehicle: { vehicle_type, size, plate_number, user } } = request;
    const email = user.email;

    // Find an available compatible parking slot
    const slot = await prisma.parking_slots.findFirst({
      where: {
        vehicle_type,
        size,
        status: 'available',
      }
    });

    if (!slot) {
      return res.status(400).json({ error: 'No compatible slots available' });
    }

    // Use transaction to update request and slot status atomically
    await prisma.$transaction(async (tx) => {
      await tx.slot_requests.update({
        where: { id: Number(id) },
        data: {
          request_status: 'approved',
          slot_id: slot.id,
          approved_at: new Date(),
        }
      });

      await tx.parking_slots.update({
        where: { id: slot.id },
        data: { status: 'unavailable' }
      });
    });

    // Send approval email
    let emailStatus = 'sent';
    try {
      await sendApprovalEmail(email, slot.slot_number, { plate_number }, slot.location);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      emailStatus = 'failed';
    }

    // Log approval
    await prisma.logs.create({
      data: {
        userId,
        action: `Slot request ${id} approved, assigned slot ${slot.slot_number}, email ${emailStatus}`,
      }
    });

    res.json({ message: 'Request approved', slot, emailStatus });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const rejectRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { reason } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!reason) {
    return res.status(400).json({ error: 'Rejection reason is required' });
  }

  try {
    // Fetch request with vehicle and user info if status pending
    const request = await prisma.slot_requests.findFirst({
      where: { id: Number(id), request_status: 'pending' },
      include: {
        vehicle: true,
        vehicle: {
          include: { user: true }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    const { vehicle, vehicle: { plate_number, vehicle_type, size, user } } = request;
    const email = user.email;

    // Find slot location (if any) just for email context
    const slot = await prisma.parking_slots.findFirst({
      where: {
        vehicle_type,
        size,
      }
    });
    const slotLocation = slot?.location || 'unknown';

    // Update request status to rejected
    const updatedRequest = await prisma.slot_requests.update({
      where: { id: Number(id) },
      data: { request_status: 'rejected' }
    });

    // Send rejection email
    let emailStatus = 'sent';
    try {
      await sendRejectionEmail(email, { plate_number }, slotLocation, reason);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      emailStatus = 'failed';
    }

    // Log rejection
    await prisma.logs.create({
      data: {
        userId,
        action: `Slot request ${id} rejected with reason: ${reason}, email ${emailStatus}`,
      }
    });

    res.json({ message: 'Request rejected', request: updatedRequest, emailStatus });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
  approveRequest,
  rejectRequest
};

