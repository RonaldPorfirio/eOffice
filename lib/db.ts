import { PrismaClient } from "@prisma/client"

// Evita instanciar múltiplos clientes em ambiente de dev com HMR
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

