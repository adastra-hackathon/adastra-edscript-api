import { Router } from 'express';
import { GamesController } from '../controllers/GamesController';

const router = Router();
const controller = new GamesController();

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Casino and live casino games
 */

/**
 * @swagger
 * /games/filters:
 *   get:
 *     summary: Get available filter options (providers and categories)
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Available filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     providers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:        { type: string }
 *                           name:      { type: string, example: "PG Soft" }
 *                           slug:      { type: string, example: "pg-soft" }
 *                           logoUrl:   { type: string, nullable: true }
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:        { type: string }
 *                           name:      { type: string, example: "Populares" }
 *                           slug:      { type: string, example: "populares" }
 *                           icon:      { type: string, nullable: true, example: "🔥" }
 *                           gameCount: { type: integer, example: 58 }
 */
router.get('/filters', (req, res, next) => controller.getFilters(req, res).catch(next));

/**
 * @swagger
 * /games:
 *   get:
 *     summary: Get games with optional filters and pagination
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CASINO, LIVE_CASINO]
 *         description: Filter by game type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by game name (case-insensitive)
 *       - in: query
 *         name: providers[]
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by provider slugs (OR between providers)
 *       - in: query
 *         name: categories[]
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by category slugs (OR between categories)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [default, a-z, new]
 *         description: Sort order (default=sortOrder, a-z=name, new=createdAt desc)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Paginated list of games
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 games:
 *                   - id: "uuid"
 *                     name: "Fortune Ox"
 *                     slug: "fortune-ox"
 *                     imageUrl: "https://..."
 *                     type: "CASINO"
 *                     isPopular: true
 *                     isNew: false
 *                     provider: { id: "uuid", name: "PG Soft", slug: "pg-soft" }
 *                     categories: [{ id: "uuid", name: "Populares", slug: "populares" }]
 *                 total: 40
 *                 page: 1
 *                 limit: 20
 *                 totalPages: 2
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', (req, res, next) => controller.getGames(req, res).catch(next));

/**
 * @swagger
 * /games/{slug}:
 *   get:
 *     summary: Get detailed information for a single game by slug
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "fortune-ox"
 *         description: Game slug
 *     responses:
 *       200:
 *         description: Game detail data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:           { type: string }
 *                     name:         { type: string, example: "Fortune Ox" }
 *                     slug:         { type: string, example: "fortune-ox" }
 *                     imageUrl:     { type: string, nullable: true }
 *                     type:         { type: string, enum: [CASINO, LIVE_CASINO] }
 *                     isPopular:    { type: boolean }
 *                     isNew:        { type: boolean }
 *                     sortOrder:    { type: integer }
 *                     description:  { type: string, nullable: true }
 *                     rtp:          { type: number, nullable: true, example: 96.7 }
 *                     volatility:   { type: string, nullable: true, example: "HIGH" }
 *                     minBet:       { type: number, nullable: true, example: 0.20 }
 *                     maxBet:       { type: number, nullable: true, example: 200.00 }
 *                     dealerName:   { type: string, nullable: true }
 *                     playersCount: { type: integer, nullable: true }
 *                     provider:
 *                       type: object
 *                       properties:
 *                         id:   { type: string }
 *                         name: { type: string }
 *                         slug: { type: string }
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:   { type: string }
 *                           name: { type: string }
 *                           slug: { type: string }
 *       404:
 *         description: Game not found
 */
router.get('/:slug', (req, res, next) => controller.getGameBySlug(req, res).catch(next));

export default router;
