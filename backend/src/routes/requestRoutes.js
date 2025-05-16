const express = require('express');
const {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
  approveRequest,
  rejectRequest,
} = require('../controllers/requestController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/slot-requests:
 *   post:
 *     summary: Create a new slot request
 *     tags: [Slot Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *             properties:
 *               vehicle_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Slot request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 1 }
 *                 user_id: { type: integer, example: 1 }
 *                 vehicle_id: { type: integer, example: 1 }
 *                 request_status: { type: string, example: pending }
 *                 requested_at: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, createRequest);

/**
 * @swagger
 * /api/slot-requests:
 *   get:
 *     summary: List slot requests (user's requests or all for admins)
 *     tags: [Slot Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by status or vehicle plate number
 *     responses:
 *       200:
 *         description: List of slot requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 1 }
 *                       user_id: { type: integer, example: 1 }
 *                       vehicle_id: { type: integer, example: 1 }
 *                       slot_id: { type: integer, nullable: true }
 *                       request_status: { type: string, example: pending }
 *                       slot_number: { type: string, nullable: true }
 *                       requested_at: { type: string, format: date-time }
 *                       approved_at: { type: string, format: date-time, nullable: true }
 *                       plate_number: { type: string, example: ABC123 }
 *                       vehicle_type: { type: string, example: car }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems: { type: integer, example: 50 }
 *                     currentPage: { type: integer, example: 1 }
 *                     totalPages: { type: integer, example: 5 }
 *                     limit: { type: integer, example: 10 }
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, getRequests);

/**
 * @swagger
 * /api/slot-requests/{id}:
 *   put:
 *     summary: Update a pending slot request
 *     tags: [Slot Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Slot request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *             properties:
 *               vehicle_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Slot request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 1 }
 *                 user_id: { type: integer, example: 1 }
 *                 vehicle_id: { type: integer, example: 2 }
 *                 request_status: { type: string, example: pending }
 *                 requested_at: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Request not found or not editable
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, updateRequest);

/**
 * @swagger
 * /api/slot-requests/{id}:
 *   delete:
 *     summary: Delete a pending slot request
 *     tags: [Slot Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Slot request ID
 *     responses:
 *       200:
 *         description: Slot request deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Request deleted }
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Request not found or not deletable
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, deleteRequest);

/**
 * @swagger
 * /api/slot-requests/{id}/approve:
 *   put:
 *     summary: Approve a slot request (admin only)
 *     tags: [Slot Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Slot request ID
 *     responses:
 *       200:
 *         description: Slot request approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Request approved }
 *                 slot:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 1 }
 *                     slot_number: { type: string, example: A1 }
 *                     size: { type: string, example: medium }
 *                     vehicle_type: { type: string, example: car }
 *                     status: { type: string, example: unavailable }
 *                     location: { type: string, example: north }
 *                 emailStatus: { type: string, example: sent }
 *       400:
 *         description: No compatible slots available
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, admin access required
 *       404:
 *         description: Request not found or already processed
 *       500:
 *         description: Server error
 */
router.put('/:id/approve', authenticate, isAdmin, approveRequest);

/**
 * @swagger
 * /api/slot-requests/{id}/reject:
 *   put:
 *     summary: Reject a slot request (admin only)
 *     tags: [Slot Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Slot request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: No compatible slots available
 *     responses:
 *       200:
 *         description: Slot request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Request rejected }
 *                 request:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 1 }
 *                     user_id: { type: integer, example: 1 }
 *                     vehicle_id: { type: integer, example: 1 }
 *                     request_status: { type: string, example: rejected }
 *                     requested_at: { type: string, format: date-time }
 *                 emailStatus: { type: string, example: sent }
 *       400:
 *         description: Rejection reason is required
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, admin access required
 *       404:
 *         description: Request not found or already processed
 *       500:
 *         description: Server error
 */
router.put('/:id/reject', authenticate, isAdmin, rejectRequest);

module.exports = router;