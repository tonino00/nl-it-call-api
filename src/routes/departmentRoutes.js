const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  patchDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID do departamento
 *         name:
 *           type: string
 *           description: Nome do departamento
 *         active:
 *           type: boolean
 *           description: Indica se o departamento está ativo
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
 *     DepartmentInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do departamento
 *       required:
 *         - name
 *     DepartmentPatchInput:
 *       type: object
 *       properties:
 *         active:
 *           type: boolean
 *           description: Ativar/desativar departamento (soft delete)
 *       required:
 *         - active
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Listar departamentos
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo/inativo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome (case-insensitive)
 *     responses:
 *       200:
 *         description: Lista de departamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 departments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 */
router.get('/', protect, authorize('admin', 'support'), getDepartments);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Obter departamento por ID
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do departamento
 *     responses:
 *       200:
 *         description: Dados do departamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 department:
 *                   $ref: '#/components/schemas/Department'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Departamento não encontrado
 */
router.get('/:id', protect, authorize('admin', 'support'), getDepartmentById);

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Criar departamento
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentInput'
 *     responses:
 *       201:
 *         description: Departamento criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 department:
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Dados inválidos ou nome duplicado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 */
router.post('/', protect, authorize('admin'), createDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Editar departamento
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do departamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentInput'
 *     responses:
 *       200:
 *         description: Departamento atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 department:
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Dados inválidos ou nome duplicado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Departamento não encontrado
 */
router.put('/:id', protect, authorize('admin'), updateDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   patch:
 *     summary: Ativar/desativar departamento (soft delete)
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do departamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentPatchInput'
 *     responses:
 *       200:
 *         description: Departamento atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 department:
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Departamento não encontrado
 */
router.patch('/:id', protect, authorize('admin'), patchDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Excluir departamento (hard delete)
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do departamento
 *     responses:
 *       200:
 *         description: Departamento excluído
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Departamento não encontrado
 *       409:
 *         description: Departamento vinculado a patrimônios
 */
router.delete('/:id', protect, authorize('admin'), deleteDepartment);

module.exports = router;
