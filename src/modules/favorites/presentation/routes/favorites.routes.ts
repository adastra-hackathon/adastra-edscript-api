import { Router } from 'express';
import { authenticate } from '../../../../shared/middlewares/authenticate';
import { FavoritesController } from '../controllers/FavoritesController';

const router = Router();
const controller = new FavoritesController();

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: User favorite games
 */

/**
 * @swagger
 * /me/favorites:
 *   get:
 *     summary: List authenticated user's favorite games
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite games
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
 *                       id:        { type: string }
 *                       gameId:    { type: string }
 *                       createdAt: { type: string, format: date-time }
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
router.get('/me/favorites', authenticate, (req, res, next) =>
  controller.list(req, res).catch(next),
);

/**
 * @swagger
 * /me/favorites:
 *   post:
 *     summary: Add a game to user's favorites
 *     tags: [Favorites]
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
 *         description: Game added to favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { nullable: true, example: null }
 *       409:
 *         description: Game is already in favorites
 *       401:
 *         description: Unauthorized
 */
router.post('/me/favorites', authenticate, (req, res, next) =>
  controller.add(req, res).catch(next),
);

/**
 * @swagger
 * /me/favorites/{gameId}:
 *   delete:
 *     summary: Remove a game from user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the game to remove
 *     responses:
 *       200:
 *         description: Game removed from favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { nullable: true, example: null }
 *       404:
 *         description: Game not found in favorites
 *       401:
 *         description: Unauthorized
 */
router.delete('/me/favorites/:gameId', authenticate, (req, res, next) =>
  controller.remove(req, res).catch(next),
);

export default router;
