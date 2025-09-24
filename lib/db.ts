// lib/db.ts
import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

/**
 * Prisma em serverless + dev:
 * - Reutiliza a instância em dev (global)
 * - No deploy (production), cria uma única
 * - Log mais silencioso em prod
 */
export const prisma =
  global.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        // deixa explícito para o runtime da Vercel
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}
