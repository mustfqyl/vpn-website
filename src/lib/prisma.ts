// Prisma client initialization for PasarGuard architecture
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

// Check if the cached instance is valid (has the new models)
const isInstanceValid = (instance: any) => {
  return instance && 
         typeof instance.vpnUser !== 'undefined' && 
         typeof instance.nodeUptimeLog !== 'undefined' &&
         typeof instance.appState !== 'undefined'
}

export const prisma = (globalForPrisma.prisma && isInstanceValid(globalForPrisma.prisma))
  ? globalForPrisma.prisma 
  : prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

