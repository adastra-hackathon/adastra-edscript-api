import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { router } from './routes';
import { swaggerSpec } from './docs/swagger';
import { errorHandler } from '../shared/middlewares/errorHandler';

export function createApp() {
  const app = express();

  // Security
  app.use(helmet());
  app.use(cors());

  // Body parsing
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Swagger docs
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // API routes
  app.use('/api/v1', router);

  // Error handler — must be last
  app.use(errorHandler);

  return app;
}
