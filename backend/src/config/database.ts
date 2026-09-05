import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database Connection Timeout')), 2000)),
    ]);
    return true;
  } catch (error) {
    return false;
  }
};
