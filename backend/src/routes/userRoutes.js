const express = require('express');
const { getProfile, updateProfile, getUsers, deleteUser } = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 1 }
 *                 name: { type: string, example: John Doe }
 *                 email: { type: string, example: john@example.com }
 *                 role: { type: string, example: user }
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticate, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Smith
 *               email:
 *                 type: string
 *                 example: john.smith@example.com
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 1 }
 *                 name: { type: string, example: John Smith }
 *                 email: { type: string, example: john.smith@example.com }
 *                 role: { type: string, example: user }
 *       400:
 *         description: Invalid input or email already exists
 *       401:
 *         description: Unauthorized, invalid or missing token
 */
router.put('/profile', authenticate, updateProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
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
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of users
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
 *                       name: { type: string, example: John Doe }
 *                       email: { type: string, example: john@example.com }
 *                       role: { type: string, example: user }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems: { type: integer, example: 50 }
 *                     currentPage: { type: integer, example: 1 }
 *                     totalPages: { type: integer, example: 5 }
 *                     limit: { type: integer, example: 10 }
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, isAdmin, getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: User deleted }
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, admin access required
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, isAdmin, deleteUser);

module.exports = router;