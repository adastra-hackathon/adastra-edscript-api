import { Router } from 'express';
import { BetslipController } from '../controllers/BetslipController';
import { authenticate } from '../../../../shared/middlewares/authenticate';

const router = Router();
const controller = new BetslipController();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Betslip
 *   description: Gerenciamento de bilhetes de apostas do usuário autenticado
 */

/**
 * @swagger
 * /betslips:
 *   post:
 *     summary: Criar novo bilhete de apostas
 *     tags: [Betslip]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [selections, totalStake, totalOdds, potentialPayout]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [SIMPLE, MULTIPLE, SYSTEM]
 *                 default: MULTIPLE
 *               selections:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [eventId, eventName, marketName, selectionName, odd]
 *                   properties:
 *                     eventId:       { type: string }
 *                     eventName:     { type: string, maxLength: 200 }
 *                     marketName:    { type: string, maxLength: 100 }
 *                     selectionName: { type: string, maxLength: 100 }
 *                     odd:           { type: number, minimum: 1, example: 1.85 }
 *                     stake:         { type: number, minimum: 0 }
 *                     sortOrder:     { type: integer, minimum: 0 }
 *               totalStake:
 *                 type: number
 *                 minimum: 0
 *                 example: 50.00
 *               totalOdds:
 *                 type: number
 *                 minimum: 0
 *                 example: 3.70
 *               potentialPayout:
 *                 type: number
 *                 minimum: 0
 *                 example: 185.00
 *               acceptAnyOddsChange:
 *                 type: boolean
 *                 default: false
 *               acceptOnlyHigherOdds:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Bilhete criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/BetSlip'
 *       401:
 *         description: Não autorizado
 *       422:
 *         description: Erro de validação
 */
router.post('/', (req, res, next) => controller.create(req as any, res).catch(next));

/**
 * @swagger
 * /betslips:
 *   get:
 *     summary: Listar todos os bilhetes do usuário autenticado
 *     tags: [Betslip]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de bilhetes do usuário ordenados por data de criação (mais recente primeiro)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BetSlip'
 *       401:
 *         description: Não autorizado
 */
router.get('/', (req, res, next) => controller.list(req as any, res).catch(next));

/**
 * @swagger
 * /betslips/{id}:
 *   get:
 *     summary: Obter bilhete por ID
 *     tags: [Betslip]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bilhete
 *     responses:
 *       200:
 *         description: Dados do bilhete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/BetSlip'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Bilhete não encontrado
 */
router.get('/:id', (req, res, next) => controller.getById(req as any, res).catch(next));

/**
 * @swagger
 * /betslips/{id}:
 *   patch:
 *     summary: Atualizar dados do bilhete (stake, odds, preferências)
 *     tags: [Betslip]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bilhete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalStake:          { type: number, minimum: 0 }
 *               totalOdds:           { type: number, minimum: 0 }
 *               potentialPayout:     { type: number, minimum: 0 }
 *               acceptAnyOddsChange: { type: boolean }
 *               acceptOnlyHigherOdds: { type: boolean }
 *     responses:
 *       200:
 *         description: Bilhete atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/BetSlip'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Bilhete não encontrado
 *       422:
 *         description: Erro de validação
 */
router.patch('/:id', (req, res, next) => controller.update(req as any, res).catch(next));

/**
 * @swagger
 * /betslips/{id}/submit:
 *   post:
 *     summary: Submeter bilhete para confirmação da aposta
 *     tags: [Betslip]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bilhete
 *     responses:
 *       200:
 *         description: Bilhete submetido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/BetSlip'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Bilhete não encontrado
 *       409:
 *         description: Bilhete já foi submetido
 *       422:
 *         description: Bilhete não possui seleções
 */
router.post('/:id/submit', (req, res, next) => controller.submit(req as any, res).catch(next));

/**
 * @swagger
 * /betslips/{id}/selections/{selectionId}:
 *   delete:
 *     summary: Remover uma seleção do bilhete
 *     tags: [Betslip]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bilhete
 *       - in: path
 *         name: selectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da seleção a remover
 *     responses:
 *       200:
 *         description: Seleção removida com sucesso — retorna bilhete atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/BetSlip'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Bilhete ou seleção não encontrados
 */
router.delete('/:id/selections/:selectionId', (req, res, next) => controller.removeSelection(req as any, res).catch(next));

/**
 * @swagger
 * /betslips/{id}/clear:
 *   delete:
 *     summary: Limpar todas as seleções do bilhete e zerar valores
 *     tags: [Betslip]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bilhete
 *     responses:
 *       200:
 *         description: Bilhete limpo com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/BetSlip'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Bilhete não encontrado
 */
router.delete('/:id/clear', (req, res, next) => controller.clear(req as any, res).catch(next));

/**
 * @swagger
 * components:
 *   schemas:
 *     BetSlipSelection:
 *       type: object
 *       properties:
 *         id:            { type: string }
 *         betSlipId:     { type: string }
 *         eventId:       { type: string }
 *         eventName:     { type: string, example: "Arsenal vs Chelsea" }
 *         marketName:    { type: string, example: "Resultado Final" }
 *         selectionName: { type: string, example: "Arsenal" }
 *         odd:           { type: number, example: 1.85 }
 *         stake:         { type: number, nullable: true }
 *         sortOrder:     { type: integer }
 *         createdAt:     { type: string, format: date-time }
 *     BetSlip:
 *       type: object
 *       properties:
 *         id:                   { type: string }
 *         userId:               { type: string }
 *         type:                 { type: string, enum: [SIMPLE, MULTIPLE, SYSTEM] }
 *         status:               { type: string, enum: [DRAFT, SUBMITTED, SETTLED, CANCELLED] }
 *         totalStake:           { type: number, example: 50.00 }
 *         totalOdds:            { type: number, example: 3.70 }
 *         potentialPayout:      { type: number, example: 185.00 }
 *         acceptAnyOddsChange:  { type: boolean }
 *         acceptOnlyHigherOdds: { type: boolean }
 *         selections:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BetSlipSelection'
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

export default router;
