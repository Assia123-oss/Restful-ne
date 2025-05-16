// src/routes/vehicleRoutes.js
const express = require('express');
const {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plate_number
 *               - vehicle_type
 *               - size
 *             properties:
 *               plate_number:
 *                 type: string
 *                 example: ABC123
 *               vehicle_type:
 *                 type: string
 *                 example: car
 *               size:
 *                 type: string
 *                 example: medium
 *               other_attributes:
 *                 type: object
 *                 example: { "color": "blue" }
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 user_id: { type: integer }
 *                 plate_number: { type: string }
 *                 vehicle_type: { type: string }
 *                 size: { type: string }
 *                 other_attributes: { type: object }
 *       400:
 *         description: Plate number already exists or invalid input
 */
router.post('/', authenticate, createVehicle);

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: List vehicles for the authenticated user
 *     tags: [Vehicles]
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
 *         description: Search by plate number or vehicle type
 *     responses:
 *       200:
 *         description: List of vehicles
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
 *                       id: { type: integer }
 *                       user_id: { type: integer }
 *                       plate_number: { type: string }
 *                       vehicle_type: { type: string }
 *                       size: { type: string }
 *                       other_attributes: { type: object }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems: { type: integer }
 *                     currentPage: { type: integer }
 *                     totalPages: { type: integer }
 *                     limit: { type: integer }
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, getVehicles);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plate_number
 *               - vehicle_type
 *               - size
 *             properties:
 *               plate_number:
 *                 type: string
 *                 example: ABC123
 *               vehicle_type:
 *                 type: string
 *                 example: car
 *               size:
 *                 type: string
 *                 example: medium
 *               other_attributes:
 *                 type: object
 *                 example: { "color": "blue" }
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 user_id: { type: integer }
 *                 plate_number: { type: string }
 *                 vehicle_type: { type: string }
 *                 size: { type: string }
 *                 other_attributes: { type: object }
 *       404:
 *         description: Vehicle not found
 *       400:
 *         description: Invalid input
 */
router.put('/:id', authenticate, updateVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Vehicle not found
 */
router.delete('/:id', authenticate, deleteVehicle);

module.exports = router;