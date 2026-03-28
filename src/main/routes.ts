import { Router } from 'express';
import { authRoutes } from '../modules/auth/presentation/routes/auth.routes';
import { profileRoutes } from '../modules/profile/presentation/routes/profile.routes';
import { responsibleGamingRoutes } from '../modules/responsible-gaming/presentation/routes/responsible-gaming.routes';
import gamesRoutes from '../modules/games/presentation/routes/games.routes';
import homeRoutes from '../modules/home/presentation/routes/home.routes';
import favoritesRoutes from '../modules/favorites/presentation/routes/favorites.routes';
import recentGamesRoutes from '../modules/recent-games/presentation/routes/recent-games.routes';
import sportsRoutes from '../modules/sports/presentation/routes/sports.routes';
import betslipRoutes from '../modules/betslip/presentation/routes/betslip.routes';
import gameRoomRoutes from '../modules/game-room/presentation/routes/game-room.routes';
import predictionRoomRoutes from '../modules/prediction/presentation/routes/prediction-room.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/responsible-gaming', responsibleGamingRoutes);
router.use('/games', gamesRoutes);
router.use('/home', homeRoutes);
router.use('/', favoritesRoutes);
router.use('/', recentGamesRoutes);
router.use('/sports', sportsRoutes);
router.use('/betslips', betslipRoutes);
router.use('/game-rooms', gameRoomRoutes);
router.use('/prediction-rooms', predictionRoomRoutes);

export { router };
