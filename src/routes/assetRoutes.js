const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset
} = require('../controllers/assetController');

router.use(protect, authorize('admin', 'support'));

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID do patrimônio
 *         name:
 *           type: string
 *           description: Nome do patrimônio de TI
 *         type:
 *           type: string
 *           enum: [hardware, software]
 *           description: Tipo do patrimônio
 *         assetTag:
 *           type: string
 *           description: Código/etiqueta interna do patrimônio
 *         serialNumber:
 *           type: string
 *           description: Número de série (para hardware)
 *         status:
 *           type: string
 *           enum: [ativo, em_uso, em_manutencao, baixado]
 *           description: Status atual do patrimônio
 *         location:
 *           type: string
 *           description: Localização física ou lógica do patrimônio
 *         ownerUser:
 *           type: string
 *           description: ID do usuário responsável/que utiliza o patrimônio
 *         department:
 *           type: string
 *           description: Departamento associado ao patrimônio
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           description: Data de compra
 *         warrantyEndDate:
 *           type: string
 *           format: date-time
 *           description: Fim da garantia
 *         vendor:
 *           type: string
 *           description: Fabricante/fornecedor
 *         licenseKey:
 *           type: string
 *           description: Chave de licença (para software)
 *         expirationDate:
 *           type: string
 *           format: date-time
 *           description: Data de expiração da licença
 *         notes:
 *           type: string
 *           description: Observações gerais
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
 *         - type
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Obter lista de patrimônios de TI
 *     tags: [Patrimônios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de patrimônio (hardware ou software)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status do patrimônio
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filtrar por departamento
 *       - in: query
 *         name: ownerUser
 *         schema:
 *           type: string
 *         description: Filtrar por ID do usuário responsável
 *     responses:
 *       200:
 *         description: Lista de patrimônios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 assets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asset'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 */
router.get('/', getAssets);

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Obter patrimônio de TI por ID
 *     tags: [Patrimônios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do patrimônio
 *     responses:
 *       200:
 *         description: Dados do patrimônio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 asset:
 *                   $ref: '#/components/schemas/Asset'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Patrimônio não encontrado
 */
router.get('/:id', getAssetById);

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Criar novo patrimônio de TI
 *     tags: [Patrimônios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Asset'
 *     responses:
 *       201:
 *         description: Patrimônio criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 */
router.post('/', createAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Atualizar patrimônio de TI
 *     tags: [Patrimônios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do patrimônio
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Asset'
 *     responses:
 *       200:
 *         description: Patrimônio atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Patrimônio não encontrado
 */
router.put('/:id', updateAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: Excluir patrimônio de TI
 *     tags: [Patrimônios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do patrimônio
 *     responses:
 *       200:
 *         description: Patrimônio excluído com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Patrimônio não encontrado
 */
router.delete('/:id', deleteAsset);

module.exports = router;
