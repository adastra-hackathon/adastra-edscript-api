import { Router } from 'express';
import { SportsController } from '../controllers/SportsController';

const router = Router();
const controller = new SportsController();

/**
 * @swagger
 * tags:
 *   name: Sports
 *   description: Sports matches and betting odds
 */

/**
 * @swagger
 * /sports/matches:
 *   get:
 *     summary: Get sports matches with optional filters
 *     tags: [Sports]
 *     parameters:
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *           example: "football"
 *         description: Filter by sport type
 *       - in: query
 *         name: isLive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by live status
 *     responses:
 *       200:
 *         description: List of sports matches ordered by isLive desc, startTime asc
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
 *                     matches:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:          { type: string }
 *                           sport:       { type: string, example: "football" }
 *                           league:      { type: string, example: "Premier League" }
 *                           homeTeam:    { type: string, example: "Arsenal" }
 *                           awayTeam:    { type: string, example: "Chelsea" }
 *                           homeLogoUrl: { type: string, nullable: true }
 *                           awayLogoUrl: { type: string, nullable: true }
 *                           startTime:   { type: string, format: date-time }
 *                           isLive:      { type: boolean }
 *                           oddsHome:    { type: number, example: 1.85 }
 *                           oddsDraw:    { type: number, example: 3.40 }
 *                           oddsAway:    { type: number, example: 4.20 }
 *                           homeScore:   { type: integer, nullable: true }
 *                           awayScore:   { type: integer, nullable: true }
 *                           minute:      { type: integer, nullable: true }
 *       400:
 *         description: Invalid query parameters
 */
router.get('/matches', (req, res, next) => controller.getMatches(req, res).catch(next));

export default router;
