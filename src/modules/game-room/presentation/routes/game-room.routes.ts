import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/authenticate';
import { GameRoomController } from '../controllers/GameRoomController';

const router = Router();
const ctrl = new GameRoomController();

/**
 * @swagger
 * components:
 *   schemas:
 *     GameRoomPlayer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         roomId:
 *           type: string
 *         userId:
 *           type: string
 *         initialBalance:
 *           type: number
 *         finalBalance:
 *           type: number
 *           nullable: true
 *         profit:
 *           type: number
 *           nullable: true
 *         position:
 *           type: integer
 *           nullable: true
 *         joinedAt:
 *           type: string
 *           format: date-time
 *     GameRoom:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         hostId:
 *           type: string
 *         gameId:
 *           type: string
 *         entryAmount:
 *           type: number
 *         maxPlayers:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [WAITING, IN_PROGRESS, FINISHED, CANCELLED]
 *         startAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         duration:
 *           type: integer
 *           description: Duration in seconds
 *         prizePool:
 *           type: number
 *         platformFee:
 *           type: number
 *         winnerId:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         players:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GameRoomPlayer'
 */

/**
 * @swagger
 * /game-rooms:
 *   post:
 *     summary: Create a game room
 *     tags: [Game Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gameId, entryAmount]
 *             properties:
 *               gameId:
 *                 type: string
 *                 example: "uuid-game-id"
 *               entryAmount:
 *                 type: number
 *                 example: 20
 *               maxPlayers:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 10
 *                 default: 10
 *               startAt:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 description: Duration in seconds
 *                 default: 300
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
 *                   $ref: '#/components/schemas/GameRoom'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post('/', authenticate, (req, res, next) => ctrl.create(req as any, res, next).catch(next));

/**
 * @swagger
 * /game-rooms:
 *   get:
 *     summary: List game rooms
 *     tags: [Game Rooms]
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
 *         description: List of rooms
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
 *                     $ref: '#/components/schemas/GameRoom'
 */
router.get('/', authenticate, (req, res, next) => ctrl.list(req as any, res, next).catch(next));

/**
 * @swagger
 * /game-rooms/{id}:
 *   get:
 *     summary: Get a game room by ID
 *     tags: [Game Rooms]
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
 *         description: Room data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GameRoom'
 *       404:
 *         description: Room not found
 */
router.get('/:id', authenticate, (req, res, next) => ctrl.getById(req as any, res, next).catch(next));

/**
 * @swagger
 * /game-rooms/{id}/join:
 *   post:
 *     summary: Join a game room
 *     tags: [Game Rooms]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GameRoom'
 *       404:
 *         description: Room not found
 *       409:
 *         description: Room full, already joined, or not waiting
 *       422:
 *         description: Insufficient balance
 */
router.post('/:id/join', authenticate, (req, res, next) => ctrl.join(req as any, res, next).catch(next));

/**
 * @swagger
 * /game-rooms/{id}/start:
 *   post:
 *     summary: Start a game room (host only)
 *     tags: [Game Rooms]
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
 *         description: Room started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GameRoom'
 *       403:
 *         description: Only the host can start the room
 *       409:
 *         description: Room is not in WAITING status
 */
router.post('/:id/start', authenticate, (req, res, next) => ctrl.start(req as any, res, next).catch(next));

/**
 * @swagger
 * /game-rooms/{id}/finish:
 *   post:
 *     summary: Finish a game room and distribute prizes (host only)
 *     tags: [Game Rooms]
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
 *             required: [results, winnerId, lastPlaceUserId]
 *             properties:
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [userId, finalBalance, position]
 *                   properties:
 *                     userId:
 *                       type: string
 *                     finalBalance:
 *                       type: number
 *                     position:
 *                       type: integer
 *               winnerId:
 *                 type: string
 *               lastPlaceUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room finished, prizes distributed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GameRoom'
 *       403:
 *         description: Only the host can finish the room
 *       409:
 *         description: Room is not in progress
 */
router.post('/:id/finish', authenticate, (req, res, next) => ctrl.finish(req as any, res, next).catch(next));

/**
 * @swagger
 * /game-rooms/{id}/add-bots:
 *   post:
 *     summary: Add simulated bot players (simulation mode only)
 *     tags: [Game Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *                 default: 3
 *     responses:
 *       200:
 *         description: Bots added
 */
router.post('/:id/add-bots', authenticate, (req, res, next) => ctrl.addBots(req as any, res).catch(next));

export default router;
