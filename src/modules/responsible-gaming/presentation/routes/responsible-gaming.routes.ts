import { Router } from 'express';
import { ResponsibleGamingController } from '../controllers/ResponsibleGamingController';
import { authenticate } from '../../../../shared/middlewares/authenticate';

const router = Router();
const controller = new ResponsibleGamingController();
const wrap = (fn: (req: any, res: any) => Promise<void>) =>
  (req: any, res: any, next: any) => fn(req, res).catch(next);

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: ResponsibleGaming
 *   description: Jogo responsável — limites e auto exclusão
 */

/**
 * @swagger
 * /responsible-gaming:
 *   get:
 *     summary: Obter estado completo de jogo responsável do usuário
 *     tags: [ResponsibleGaming]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado atual de limites e exclusão
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 betLimit:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     dailyAmount: { type: number, nullable: true }
 *                     weeklyAmount: { type: number, nullable: true }
 *                     monthlyAmount: { type: number, nullable: true }
 *                     reason: { type: string, nullable: true }
 *                     updatedAt: { type: string, format: date-time }
 *                 depositLimit:
 *                   type: object
 *                   nullable: true
 *                 sessionTimeLimit:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     dailyMinutes: { type: integer, nullable: true }
 *                     weeklyMinutes: { type: integer, nullable: true }
 *                     monthlyMinutes: { type: integer, nullable: true }
 *                 selfExclusion:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     type: { type: string, enum: [TIMED, AUTO] }
 *                     untilDate: { type: string, format: date-time, nullable: true }
 *                     duration: { type: string, nullable: true }
 *                     isActive: { type: boolean }
 */
router.get('/', wrap((req, res) => controller.getState(req, res)));

/**
 * @swagger
 * /responsible-gaming/limits/bet:
 *   patch:
 *     summary: Criar ou atualizar limite de apostas
 *     tags: [ResponsibleGaming]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyAmount: { type: number, example: 100 }
 *               weeklyAmount: { type: number, example: 500 }
 *               monthlyAmount: { type: number, example: 1000 }
 *               reason: { type: string, example: "Controle financeiro" }
 *           example:
 *             dailyAmount: 100
 *             weeklyAmount: 500
 *             monthlyAmount: 1000
 *             reason: "Controle financeiro"
 *     responses:
 *       200:
 *         description: Limite atualizado com sucesso
 *       422:
 *         description: Limites inválidos ou aumento de limite ativo não permitido
 *         content:
 *           application/json:
 *             examples:
 *               invalidLimits:
 *                 value: { code: "RESPONSIBLE_GAMING_INVALID_LIMITS", message: "Os limites informados são inválidos." }
 *               increaseNotAllowed:
 *                 value: { code: "RESPONSIBLE_GAMING_LIMIT_INCREASE_NOT_ALLOWED", message: "Não é permitido aumentar um limite ativo no momento." }
 */
router.patch('/limits/bet', wrap((req, res) => controller.upsertBetLimit(req, res)));

/**
 * @swagger
 * /responsible-gaming/limits/deposit:
 *   patch:
 *     summary: Criar ou atualizar limite de depósito
 *     tags: [ResponsibleGaming]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyAmount: { type: number }
 *               weeklyAmount: { type: number }
 *               monthlyAmount: { type: number }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Limite de depósito atualizado
 */
router.patch('/limits/deposit', wrap((req, res) => controller.upsertDepositLimit(req, res)));

/**
 * @swagger
 * /responsible-gaming/limits/session-time:
 *   patch:
 *     summary: Criar ou atualizar limite de tempo de sessão
 *     tags: [ResponsibleGaming]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyMinutes: { type: integer, example: 60 }
 *               weeklyMinutes: { type: integer, example: 300 }
 *               monthlyMinutes: { type: integer, example: 1200 }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Limite de tempo atualizado
 */
router.patch('/limits/session-time', wrap((req, res) => controller.upsertSessionTimeLimit(req, res)));

/**
 * @swagger
 * /responsible-gaming/limits/{type}:
 *   delete:
 *     summary: Resetar limite de um tipo
 *     tags: [ResponsibleGaming]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BET_AMOUNT, DEPOSIT_AMOUNT, TIME_ON_SITE]
 *     responses:
 *       200:
 *         description: Limite resetado com sucesso
 */
router.delete('/limits/:type', wrap((req, res) => controller.resetLimit(req, res)));

/**
 * @swagger
 * /responsible-gaming/self-exclusion/temporary:
 *   post:
 *     summary: Criar exclusão por tempo determinado
 *     tags: [ResponsibleGaming]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [untilDate]
 *             properties:
 *               untilDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-01T23:59:59.000Z"
 *               reason:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Exclusão criada com sucesso
 *       409:
 *         description: Já existe uma auto exclusão ativa
 *         content:
 *           application/json:
 *             example:
 *               code: "RESPONSIBLE_GAMING_SELF_EXCLUSION_ALREADY_ACTIVE"
 *               message: "Já existe uma auto exclusão ativa."
 *       422:
 *         description: Data de exclusão inválida
 *         content:
 *           application/json:
 *             example:
 *               code: "RESPONSIBLE_GAMING_INVALID_EXCLUSION_DATE"
 *               message: "A data informada para exclusão é inválida."
 *               field: "untilDate"
 */
router.post('/self-exclusion/temporary', wrap((req, res) => controller.createTimedSelfExclusion(req, res)));

/**
 * @swagger
 * /responsible-gaming/self-exclusion:
 *   post:
 *     summary: Criar auto exclusão (por período ou permanente)
 *     tags: [ResponsibleGaming]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: string
 *                 nullable: true
 *                 enum: [3_MONTHS, 6_MONTHS, 1_YEAR, 2_YEARS, PERMANENT]
 *               reason:
 *                 type: string
 *                 nullable: true
 *           examples:
 *             permanent:
 *               value: { duration: "PERMANENT", reason: "Solicitação do usuário" }
 *             sixMonths:
 *               value: { duration: "6_MONTHS", reason: "Pausa preventiva" }
 *     responses:
 *       200:
 *         description: Auto exclusão configurada com sucesso
 *       409:
 *         description: Já existe uma auto exclusão ativa
 */
router.post('/self-exclusion', wrap((req, res) => controller.createSelfExclusion(req, res)));

export { router as responsibleGamingRoutes };
