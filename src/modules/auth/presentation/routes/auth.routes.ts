import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../../../../shared/middlewares/authenticate';

const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticação
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cadastrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, cpf, phone, birthDate, password]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: João da Silva
 *               displayName:
 *                 type: string
 *                 example: João
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao.silva@email.com
 *               cpf:
 *                 type: string
 *                 example: "123.456.789-00"
 *               phone:
 *                 type: string
 *                 example: "(11) 98765-4321"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1990-06-15"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "Senha@123"
 *               acceptBonus:
 *                 type: boolean
 *                 example: true
 *           example:
 *             fullName: "João da Silva"
 *             displayName: "João"
 *             email: "joao.silva@email.com"
 *             cpf: "123.456.789-00"
 *             phone: "(11) 98765-4321"
 *             birthDate: "1990-06-15"
 *             password: "Senha@123"
 *             acceptBonus: true
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *       409:
 *         description: E-mail, CPF ou telefone já cadastrado
 *       422:
 *         description: Erro de validação
 */
router.post('/register', controller.register.bind(controller));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login com e-mail ou CPF e senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: E-mail ou CPF
 *                 example: "joao.silva@email.com"
 *               password:
 *                 type: string
 *                 example: "Senha@123"
 *           example:
 *             identifier: "joao.silva@email.com"
 *             password: "Senha@123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Credenciais inválidas
 *       423:
 *         description: Conta temporariamente bloqueada
 */
router.post('/login', controller.login.bind(controller));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Novos tokens gerados
 *       401:
 *         description: Refresh token inválido ou expirado
 */
router.post('/refresh', controller.refresh.bind(controller));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     displayName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [PLAYER, ADMIN, SUPPORT]
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, INACTIVE, BANNED, PENDING_VERIFICATION]
 *                     isEmailVerified:
 *                       type: boolean
 *                     isPhoneVerified:
 *                       type: boolean
 *                     level:
 *                       type: string
 *                       enum: [BRONZE, PRATA, OURO, DIAMANTE, VIP]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Não autorizado
 */
router.get('/me', authenticate, controller.me.bind(controller));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Encerrar sessão
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Sessão encerrada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.post('/logout', authenticate, controller.logout.bind(controller));

export { router as authRoutes };
