import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authenticate } from '../../../../shared/middlewares/authenticate';

const router = Router();
const controller = new ProfileController();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Gerenciamento do perfil do usuário autenticado
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Obter perfil completo do usuário autenticado
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil completo do usuário
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
 *                       example: João da Silva
 *                     displayName:
 *                       type: string
 *                       example: João
 *                     email:
 *                       type: string
 *                       format: email
 *                     cpf:
 *                       type: string
 *                       example: "000.000.000-00"
 *                     phone:
 *                       type: string
 *                       example: "+55 (11) 99999-9999"
 *                     birthDate:
 *                       type: string
 *                       format: date-time
 *                     gender:
 *                       type: string
 *                       example: Masculino
 *                     address:
 *                       type: string
 *                       example: "Rua Exemplo, 123 – São Paulo, SP"
 *                     avatarUrl:
 *                       type: string
 *                     level:
 *                       type: string
 *                       enum: [BRONZE, PRATA, OURO, DIAMANTE, VIP]
 *                     points:
 *                       type: integer
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         balance:
 *                           type: string
 *                           example: "1250.00"
 *                         bonusBalance:
 *                           type: string
 *                           example: "0.00"
 *                         currency:
 *                           type: string
 *                           example: BRL
 *                     isEmailVerified:
 *                       type: boolean
 *                     isPhoneVerified:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, INACTIVE, BANNED, PENDING_VERIFICATION]
 *                     role:
 *                       type: string
 *                       enum: [PLAYER, ADMIN, SUPPORT]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     editableFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [fullName, displayName, phone, gender, address]
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/', controller.getProfile.bind(controller));

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Atualizar dados editáveis do perfil
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: João da Silva
 *               displayName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: João
 *               phone:
 *                 type: string
 *                 example: "+55 (11) 99999-9999"
 *               gender:
 *                 type: string
 *                 example: Masculino
 *               address:
 *                 type: string
 *                 example: "Rua Exemplo, 123 – São Paulo, SP"
 *           example:
 *             fullName: "João da Silva"
 *             phone: "(11) 99999-9999"
 *             gender: "Masculino"
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Campo não editável ou dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: string
 *                   example: FIELD_NOT_EDITABLE
 *                 message:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       422:
 *         description: Erro de validação
 */
router.patch('/', controller.updateProfile.bind(controller));

/**
 * @swagger
 * /profile/password:
 *   patch:
 *     summary: Alterar senha do usuário
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "Senha@123"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: "NovaSenha@456"
 *               confirmPassword:
 *                 type: string
 *                 example: "NovaSenha@456"
 *           example:
 *             currentPassword: "Senha@123"
 *             newPassword: "NovaSenha@456"
 *             confirmPassword: "NovaSenha@456"
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Senha alterada com sucesso.
 *       400:
 *         description: Senha atual incorreta ou senhas não conferem
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   enum: [WRONG_PASSWORD, PASSWORD_MISMATCH]
 *                 translatedMessage:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       422:
 *         description: Erro de validação
 */
router.patch('/password', controller.changePassword.bind(controller));

/**
 * @swagger
 * /profile/notifications:
 *   get:
 *     summary: Obter preferências de notificação
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferências de notificação
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
 *                     emailOnDeposit:
 *                       type: boolean
 *                     emailOnWithdrawal:
 *                       type: boolean
 *                     checkIntervalMinutes:
 *                       type: integer
 *                       nullable: true
 *       401:
 *         description: Não autorizado
 */
router.get('/notifications', controller.getNotificationPrefs.bind(controller));

/**
 * @swagger
 * /profile/notifications:
 *   patch:
 *     summary: Atualizar preferências de notificação
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOnDeposit:
 *                 type: boolean
 *               emailOnWithdrawal:
 *                 type: boolean
 *               checkIntervalMinutes:
 *                 type: integer
 *                 nullable: true
 *                 example: 30
 *           example:
 *             emailOnDeposit: true
 *             emailOnWithdrawal: false
 *             checkIntervalMinutes: 30
 *     responses:
 *       200:
 *         description: Preferências atualizadas com sucesso
 *       401:
 *         description: Não autorizado
 *       422:
 *         description: Erro de validação
 */
router.patch('/notifications', controller.updateNotificationPrefs.bind(controller));

export { router as profileRoutes };
