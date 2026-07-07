import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalForPrisma._prisma) {
      globalForPrisma._prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return (globalForPrisma._prisma as any)[prop];
  }
});
