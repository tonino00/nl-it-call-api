const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth');
const { streamNotifications, listMyNotifications, markMyNotificationAsRead } = require('../controllers/notificationController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         readAt:
 *           type: string
 *           nullable: true
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Listar notificações do usuário logado
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Se true, retorna apenas não lidas
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Quantidade por página (máx 200)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar notificação como lida
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificação atualizada
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Notificação não encontrada
 */

/**
 * @swagger
 * /api/notifications/stream:
 *   get:
 *     summary: Stream de notificações (SSE)
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stream de eventos em text/event-stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       401:
 *         description: Não autenticado
 */

router.get('/', protect, listMyNotifications);
router.get('/stream', protect, streamNotifications);
router.patch('/:id/read', protect, markMyNotificationAsRead);

module.exports = router;
