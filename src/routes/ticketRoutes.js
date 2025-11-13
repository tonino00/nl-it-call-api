const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  addComment,
  closeTicket,
  reopenTicket,
  getTicketMetrics
} = require('../controllers/ticketController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID do comentário
 *         user:
 *           type: object
 *           description: Usuário que criou o comentário
 *         content:
 *           type: string
 *           description: Conteúdo do comentário
 *         isPrivate:
 *           type: boolean
 *           description: Indica se o comentário é privado
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do comentário
 *     Ticket:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID do chamado
 *         title:
 *           type: string
 *           description: Título do chamado
 *         description:
 *           type: string
 *           description: Descrição do chamado
 *         status:
 *           type: string
 *           enum: [novo, aberto, em andamento, pendente, resolvido, fechado, cancelado]
 *           description: Status atual do chamado
 *         priority:
 *           type: string
 *           enum: [baixa, média, alta, crítica]
 *           description: Prioridade do chamado
 *         requester:
 *           type: object
 *           description: Usuário que abriu o chamado
 *         assignedTo:
 *           type: object
 *           description: Usuário responsável pelo atendimento
 *         category:
 *           type: object
 *           description: Categoria do chamado
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *           description: Lista de comentários
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Data limite para resolução
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: Data de conclusão
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *           description: Lista de anexos
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *       required:
 *         - title
 *         - description
 *         - requester
 *         - category
 *     TicketInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Título do chamado
 *         description:
 *           type: string
 *           description: Descrição detalhada do chamado
 *         category:
 *           type: string
 *           description: ID da categoria
 *         priority:
 *           type: string
 *           enum: [baixa, média, alta, crítica]
 *           description: Prioridade do chamado (opcional)
 *       required:
 *         - title
 *         - description
 *         - category
 *     CommentInput:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           description: Conteúdo do comentário
 *         isPrivate:
 *           type: boolean
 *           description: Indica se é um comentário privado
 *       required:
 *         - content
 */

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Obter lista de chamados (com filtros)
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página atual para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filtrar por prioridade
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por ID da categoria
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filtrar por ID do atendente
 *       - in: query
 *         name: requester
 *         schema:
 *           type: string
 *         description: Filtrar por ID do solicitante (apenas admin/support)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por texto no título e descrição
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtro
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtro
 *     responses:
 *       200:
 *         description: Lista de chamados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Não autenticado
 */
router.get('/', protect, getTickets);

/**
 * @swagger
 * /api/tickets/metrics:
 *   get:
 *     summary: Obter métricas de chamados
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para métricas (padrão último mês)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para métricas (padrão hoje)
 *       - in: query
 *         name: timeFormat
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Formato de agrupamento para métricas de tempo
 *     responses:
 *       200:
 *         description: Métricas dos chamados
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 */
router.get('/metrics', protect, authorize('admin', 'support'), getTicketMetrics);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Obter chamado por ID
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do chamado
 *     responses:
 *       200:
 *         description: Dados do chamado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Chamado não encontrado
 */
router.get('/:id', protect, getTicketById);

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Criar novo chamado
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketInput'
 *     responses:
 *       201:
 *         description: Chamado criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Categoria não encontrada
 */
router.post('/', protect, createTicket);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Atualizar chamado
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do chamado
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chamado atualizado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Chamado não encontrado
 */
router.put('/:id', protect, updateTicket);

/**
 * @swagger
 * /api/tickets/{id}/comments:
 *   post:
 *     summary: Adicionar comentário a um chamado
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do chamado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       201:
 *         description: Comentário adicionado com sucesso
 *       400:
 *         description: Conteúdo do comentário é obrigatório
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Chamado não encontrado
 */
router.post('/:id/comments', protect, addComment);

/**
 * @swagger
 * /api/tickets/{id}/close:
 *   put:
 *     summary: Fechar um chamado
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do chamado
 *     responses:
 *       200:
 *         description: Chamado fechado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Chamado não encontrado
 */
router.put('/:id/close', protect, closeTicket);

/**
 * @swagger
 * /api/tickets/{id}/reopen:
 *   put:
 *     summary: Reabrir um chamado fechado
 *     tags: [Chamados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do chamado
 *     responses:
 *       200:
 *         description: Chamado reaberto com sucesso
 *       400:
 *         description: Apenas chamados fechados ou resolvidos podem ser reabertos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Chamado não encontrado
 */
router.put('/:id/reopen', protect, reopenTicket);

module.exports = router;
