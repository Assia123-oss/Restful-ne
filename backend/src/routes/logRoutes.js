const express = require('express');
const { getLogs } = require('../controllers/logController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: List activity logs (admin only)
 *     tags: [Logs]
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
 *         description: Search by action or user ID
 *     responses:
 *       200:
 *         description: List of logs
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
 *                       action: { type: string, example: Slot request 1 approved }
 *                       created_at: { type: string, format: date-time }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems: { type: integer, example: 50 }
 *                     currentPage: { type: integer, example: 1 }
 *                     totalPages: { type: integer, example: 5 }
 *                     limit: { type: integer, example: 10 }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, isAdmin, getLogs);

module.exports = router;