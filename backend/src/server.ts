import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, prisma } from './config/database.js';
import { connectRedis } from './config/redis.js';

async function bootstrap() {
  console.log('🚀 Starting SkyHaven Monolith Engine...');

  await connectDatabase();
  await connectRedis();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`✨ SkyHaven Monolith Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`🌐 REST API available at: http://localhost:${env.PORT}/api/v1`);
    console.log(`❤️  Healthcheck at: http://localhost:${env.PORT}/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('🔌 HTTP server closed.');
      await prisma.$disconnect();
      console.log('📦 Database disconnected.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('💥 Fatal bootstrap error:', err);
  process.exit(1);
});
