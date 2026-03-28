import { Router } from 'express';
import { HomeController } from '../controllers/HomeController';

const router = Router();
const controller = new HomeController();

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Home page data (banners and shortcuts)
 */

/**
 * @swagger
 * /home:
 *   get:
 *     summary: Get all home page data (banners + shortcuts) in one request
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Home data
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 banners:
 *                   - id: "uuid"
 *                     title: "Sweet Rush Bonanza"
 *                     subtitle: "Big Wins Await!"
 *                     imageUrl: "https://..."
 *                     mobileImageUrl: "https://..."
 *                     redirectType: "game"
 *                     redirectValue: "sweet-bonanza"
 *                     sortOrder: 1
 *                 shortcuts:
 *                   - id: "uuid"
 *                     title: "Prêmio Diário"
 *                     imageUrl: "https://..."
 *                     redirectType: "screen"
 *                     redirectValue: "Missions"
 *                     sortOrder: 1
 */
router.get('/', (req, res, next) => controller.getHomeData(req, res).catch(next));

/**
 * @swagger
 * /home/banners:
 *   get:
 *     summary: Get active banners (respects startsAt/endsAt window)
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Active banners ordered by sortOrder
 */
router.get('/banners', (req, res, next) => controller.getBanners(req, res).catch(next));

/**
 * @swagger
 * /home/shortcuts:
 *   get:
 *     summary: Get active home shortcuts
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Active shortcuts ordered by sortOrder
 */
router.get('/shortcuts', (req, res, next) => controller.getShortcuts(req, res).catch(next));

export default router;
