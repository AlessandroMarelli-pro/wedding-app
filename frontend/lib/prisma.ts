import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
declare global {
  var prisma: PrismaClient | undefined;
}
const adapter = new PrismaNeon({
  connectionString: process.env.POSTGRES_PRISMA_URL,
});
export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
