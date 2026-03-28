import 'dotenv/config';
import { env } from '../shared/config/env';
import { createApp } from './app';
import { prisma } from '../shared/infra/database/prisma';

const app = createApp();

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`📚 Docs available at http://localhost:${env.PORT}/docs`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
