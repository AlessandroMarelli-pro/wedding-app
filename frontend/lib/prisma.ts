import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
declare global {
  var prisma: PrismaClient | undefined;
}
let prismaClient;
if (process.env.NODE_ENV === 'production') {
  prismaClient = new PrismaClient().$extends(withAccelerate());
} else {
  prismaClient = new PrismaClient();
}
export const prisma = prismaClient;
