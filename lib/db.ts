import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

let prisma: PrismaClient;

const connectionString = process.env.DATABASE_URL?.replace(/^mysql:/, 'mariadb:');

const getAdapter = () => {
  const dbUrl = new URL(connectionString || '');
  return new PrismaMariaDb({
    host: dbUrl.hostname,
    port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ''),
    connectionLimit: 10,
  });
};

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    adapter: getAdapter(),
    log: ['error'],
  });
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: getAdapter(),
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = globalForPrisma.prisma;
}

export const db = prisma;
