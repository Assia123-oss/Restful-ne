const express = require('express');
const {
  bulkCreateSlots,
  getSlots,
  updateSlot,
  deleteSlot,
} = require('../controllers/slotController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/parking-slots/bulk:
 *   post:
 *     summary: Create multiple parking slots (admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slots
 *             properties:
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - slot_number
 *                     - size
 *                     - vehicle_type
 *                     - location
 *                   properties:
 *                     slot_number:
 *                       type: string
 *                       example: A1
 *                     size:
 *                       type: string
 *                       example: medium
 *                     vehicle_type:
 *                       type: string
 *                       example: car
 *                     location:
 *                       type: string
 *                       example: north
 *     responses:
 *       201:
 *         description: Parking slots created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, example: 1 }
 *                   slot_number: { type: string, example: A1 }
 *                   size: { type: string, example: medium }
 *                   vehicle_type: { type: string, example: car }
 *                   status: { type: string, example: available }
 *                   location: { type: string, example: north }
 *       400:
 *         description: Slot number already exists or invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, admin access required
 */
router.post('/bulk', authenticate, isAdmin, bulkCreateSlots);

/**
 * @swagger
 * /api/parking-slots:
 *   get:
 *     summary: List parking slots (available for users, all for admins)
 *     tags: [Parking Slots]
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
 *         description: Search by slot number or vehicle type
 *     responses:
 *       200:
 *         description: List of parking slots
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
 *                       slot_number: { type: string, example: A1 }
 *                       size: { type: string, example: medium }
 *                       vehicle_type: { type: string, example: car }
 *                       status: { type: string, example: available }
 *                       location: { type: string, example: north }
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
router.get('/', authenticate, getSlots);

/**
 * @swagger
 * /api/parking-slots/{id}:
 *   put:
 *     summary: Update a parking slot (admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parking slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slot_number
 *               - size
 *               - vehicle_type
 *               - location
 *             properties:
 *               slot_number:
 *                 type: string
 *                 example: A1
 *               size:
 *                 type: string
 *                 example: medium
 *               vehicle_type:
 *                 type: string
 *                 example: car
 *               location:
 *                 type: string
 *                 example: north
 *     responses:
 *       200:
 *         description: Parking slot updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 1 }
 *                 slot_number: { type: string, example: A1 }
 *                 size: { type: string, example: medium }
 *                 vehicle_type: { type: string, example: car }
 *                 status: { type: string, example: available }
 *                 location: { type: string, example: north }
 *       400:
 *         description: Invalid input or slot number already exists
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, admin access required
 *       404:
 *         description: Parking slot not found
 */
router.put('/:id', authenticate, isAdmin, updateSlot);

/**
 * @swagger
 * /api/parking-slots/{id}:
 *   delete:
 *     summary: Delete a parking slot (admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parking slot ID
 *     responses:
 *       200:
 *         description: Parking slot deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Slot deleted }
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, admin access required
 *       404:
 *         description: Parking slot not found
 */
router.delete('/:id', authenticate, isAdmin, deleteSlot);

module.exports = router;