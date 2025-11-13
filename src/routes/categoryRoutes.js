const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID da categoria
 *         name:
 *           type: string
 *           description: Nome da categoria
 *         description:
 *           type: string
 *           description: Descrição da categoria
 *         isActive:
 *           type: boolean
 *           description: Status da categoria (ativa/inativa)
 *         slaTime:
 *           type: number
 *           description: Tempo de SLA em horas
 *         priority:
 *           type: string
 *           enum: [baixa, média, alta, crítica]
 *           description: Prioridade padrão da categoria
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 *       required:
 *         - name
 *     CategoryInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da categoria
 *         description:
 *           type: string
 *           description: Descrição da categoria
 *         isActive:
 *           type: boolean
 *           description: Status da categoria
 *         slaTime:
 *           type: number
 *           description: Tempo de SLA em horas
 *         priority:
 *           type: string
 *           enum: [baixa, média, alta, crítica]
 *           description: Prioridade padrão da categoria
 *       required:
 *         - name
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obter todas as categorias
 *     tags: [Categorias]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo/inativo
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filtrar por prioridade
 *     responses:
 *       200:
 *         description: Lista de categorias
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
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Não autenticado
 */
router.get('/', protect, getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obter categoria por ID
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Dados da categoria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Categoria não encontrada
 */
router.get('/:id', protect, getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Criar nova categoria
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Categoria com este nome já existe
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 */
router.post('/', protect, authorize('admin', 'support'), createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Atualizar categoria
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Este nome de categoria já está em uso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Categoria não encontrada
 */
router.put('/:id', protect, authorize('admin', 'support'), updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Excluir categoria
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria excluída com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Categoria não encontrada
 */
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
