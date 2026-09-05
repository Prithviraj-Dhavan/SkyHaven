import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var prismaClientGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaClientGlobal ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prismaClientGlobal = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('📦 Database (Prisma) connected successfully.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // Do not crash immediately so the app can output clear error messages or run in tests
  }
}
