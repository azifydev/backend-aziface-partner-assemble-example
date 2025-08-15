import { PrismaService } from 'src/prisma/prisma.service';

import { type MockType, mockDeep } from '../types/mock-like-object';

export function generateMockPrisma(
  prisma?: PrismaService,
): MockType<PrismaService> {
  const usedPrisma = prisma || new PrismaService();

  return mockDeep<PrismaService>(usedPrisma);
}
