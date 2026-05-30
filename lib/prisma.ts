import { PrismaClient } from '../generated/prisma';

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Error handling and initialization check
function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      // Add connection pool settings for better performance
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  } catch (error) {
    console.error('Error initializing Prisma Client:', error);
    throw new Error('Failed to initialize Prisma Client. Make sure you ran "prisma generate"');
  }
}

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
