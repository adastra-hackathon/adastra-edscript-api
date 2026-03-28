import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/authenticate';
import { RecentGamesController } from '../controllers/RecentGamesController';

const router = Router();
const controller = new RecentGamesController();

/**
 * @swagger
 * tags:
 *   name: RecentGames
 *   description: Recently played games tracking
 */

/**
 * @swagger
 * /me/recent-games:
 *   get:
 *     summary: List the authenticated user's recently played games (up to 10)
 *     tags: [RecentGames]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recently played games ordered by lastPlayedAt desc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:           { type: string }
 *                       gameId:       { type: string }
 *                       lastPlayedAt: { type: string, format: date-time }
 *                       game:
 *                         type: object
 *                         properties:
 *                           id:        { type: string }
 *                           name:      { type: string, example: "Fortune Ox" }
 *                           slug:      { type: string, example: "fortune-ox" }
 *                           imageUrl:  { type: string, nullable: true }
 *                           type:      { type: string, example: "CASINO" }
 *                           isPopular: { type: boolean }
 *                           isNew:     { type: boolean }
 *                           provider:
 *                             type: object
 *                             properties:
 *                               id:   { type: string }
 *                               name: { type: string }
 *                               slug: { type: string }
 *       401:
 *         description: Unauthorized
 */
router.get('/me/recent-games', authenticate, (req, res, next) =>
  controller.list(req, res).catch(next),
);

/**
 * @swagger
 * /me/recent-games:
 *   post:
 *     summary: Track a game as recently played (upserts lastPlayedAt, enforces limit of 10)
 *     tags: [RecentGames]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gameId]
 *             properties:
 *               gameId:
 *                 type: string
 *                 example: "uuid-of-game"
 *     responses:
 *       200:
 *         description: Game tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { nullable: true, example: null }
 *       401:
 *         description: Unauthorized
 */
router.post('/me/recent-games', authenticate, (req, res, next) =>
  controller.track(req, res).catch(next),
);

export default router;
