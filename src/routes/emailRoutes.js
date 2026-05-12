const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const { sendTestEmail } = require('../controllers/emailController');

/**
 * @swagger
 * /api/email/test:
 *   post:
 *     summary: Enviar e-mail de teste
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 description: Destinatário (opcional)
 *               subject:
 *                 type: string
 *                 description: Assunto (opcional)
 *               text:
 *                 type: string
 *                 description: Corpo em texto (opcional)
 *     responses:
 *       200:
 *         description: E-mail enviado (ou tentativa executada)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 */

router.post('/test', protect, authorize('admin', 'support'), sendTestEmail);

module.exports = router;
