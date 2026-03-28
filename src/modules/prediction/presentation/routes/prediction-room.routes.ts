import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/authenticate';
import { PredictionRoomController } from '../controllers/PredictionRoomController';

const router = Router();
const ctrl = new PredictionRoomController();

/**
 * @swagger
 * components:
 *   schemas:
 *     PredictionOption:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         eventId:
 *           type: string
 *         label:
 *           type: string
 *         sortOrder:
 *           type: integer
 *     PredictionEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         roomId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         sortOrder:
 *           type: integer
 *         correctOptionId:
 *           type: string
 *           nullable: true
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PredictionOption'
 *     PredictionRoomPlayer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         roomId:
 *           type: string
 *         userId:
 *           type: string
 *         isBot:
 *           type: boolean
 *         displayName:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [WAITING, PREDICTING, READY]
 *         score:
 *           type: integer
 *         position:
 *           type: integer
 *           nullable: true
 *         joinedAt:
 *           type: string
 *           format: date-time
 *         predictions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               eventId:
 *                 type: string
 *               optionId:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *                 nullable: true
 *     PredictionRoom:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         hostId:
 *           type: string
 *         title:
 *           type: string
 *         entryAmount:
 *           type: number
 *         maxPlayers:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [WAITING, IN_PROGRESS, FINISHED, CANCELLED]
 *         predictionsDeadline:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         prizePool:
 *           type: number
 *         platformFee:
 *           type: number
 *         winnerId:
 *           type: string
 *           nullable: true
 *         isSimulation:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         players:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PredictionRoomPlayer'
 *         events:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PredictionEvent'
 */

/**
 * @swagger
 * /prediction-rooms:
 *   post:
 *     summary: Create a prediction room (Apostas)
 *     tags: [Prediction Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, entryAmount, events]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Champions League — Final"
 *               entryAmount:
 *                 type: number
 *                 example: 20
 *               maxPlayers:
 *                 type: integer
 *                 default: 10
 *               predictionsDeadline:
 *                 type: string
 *                 format: date-time
 *               isSimulation:
 *                 type: boolean
 *                 default: false
 *               events:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [title, options]
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     sortOrder:
 *                       type: integer
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required: [label]
 *                         properties:
 *                           label:
 *                             type: string
 *                           sortOrder:
 *                             type: integer
 *     responses:
 *       201:
 *         description: Room created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PredictionRoom'
 */
router.post('/', authenticate, (req, res, next) => ctrl.create(req as any, res).catch(next));

/**
 * @swagger
 * /prediction-rooms:
 *   get:
 *     summary: List prediction rooms
 *     tags: [Prediction Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [WAITING, IN_PROGRESS, FINISHED, CANCELLED]
 *     responses:
 *       200:
 *         description: List of prediction rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PredictionRoom'
 */
router.get('/', authenticate, (req, res, next) => ctrl.list(req as any, res).catch(next));

/**
 * @swagger
 * /prediction-rooms/{id}:
 *   get:
 *     summary: Get a prediction room by ID
 *     tags: [Prediction Rooms]
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
 *         description: Prediction room data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PredictionRoom'
 *       404:
 *         description: Room not found
 */
router.get('/:id', authenticate, (req, res, next) => ctrl.getById(req as any, res).catch(next));

/**
 * @swagger
 * /prediction-rooms/{id}/join:
 *   post:
 *     summary: Join a prediction room
 *     tags: [Prediction Rooms]
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
 *         description: Joined successfully
 *       409:
 *         description: Already joined, room full, or not in WAITING status
 *       422:
 *         description: Insufficient balance
 */
router.post('/:id/join', authenticate, (req, res, next) => ctrl.join(req as any, res).catch(next));

/**
 * @swagger
 * /prediction-rooms/{id}/start:
 *   post:
 *     summary: Start a prediction room — opens predictions (host only)
 *     tags: [Prediction Rooms]
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
 *         description: Room started, predictions now open
 *       403:
 *         description: Only the host can start the room
 */
router.post('/:id/start', authenticate, (req, res, next) => ctrl.start(req as any, res).catch(next));

/**
 * @swagger
 * /prediction-rooms/{id}/predict:
 *   post:
 *     summary: Submit predictions for all events in a room
 *     tags: [Prediction Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [predictions]
 *             properties:
 *               predictions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [eventId, optionId]
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     optionId:
 *                       type: string
 *     responses:
 *       200:
 *         description: Predictions submitted, returns updated player data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PredictionRoomPlayer'
 *       409:
 *         description: Room not in progress or deadline passed
 */
router.post('/:id/predict', authenticate, (req, res, next) => ctrl.submitPredictions(req as any, res).catch(next));

/**
 * @swagger
 * /prediction-rooms/{id}/finish:
 *   post:
 *     summary: Finish a prediction room and reveal correct answers (host only)
 *     tags: [Prediction Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correctOptions]
 *             properties:
 *               correctOptions:
 *                 type: array
 *                 description: The correct option for each event
 *                 items:
 *                   type: object
 *                   required: [eventId, optionId]
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     optionId:
 *                       type: string
 *     responses:
 *       200:
 *         description: Room finished, scores calculated and prizes distributed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PredictionRoom'
 *       403:
 *         description: Only the host can finish the room
 */
router.post('/:id/finish', authenticate, (req, res, next) => ctrl.finish(req as any, res).catch(next));

export default router;
