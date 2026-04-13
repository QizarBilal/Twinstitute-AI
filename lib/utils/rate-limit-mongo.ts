import { prisma } from '@/lib/prisma'

export async function checkRateLimit(key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)

  const attempt = await prisma.oTPAttempt.findUnique({
    where: { key },
  })

  if (!attempt || now > attempt.resetAt) {
    await prisma.oTPAttempt.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    })
    return true
  }

  if (attempt.count >= maxAttempts) {
    return false
  }

  await prisma.oTPAttempt.update({
    where: { key },
    data: { count: attempt.count + 1 },
  })

  return true
}

export async function checkLoginRateLimit(key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)

  const attempt = await prisma.loginAttempt.findUnique({
    where: { key },
  })

  if (!attempt || now > attempt.resetAt) {
    await prisma.loginAttempt.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    })
    return true
  }

  if (attempt.count >= maxAttempts) {
    return false
  }

  await prisma.loginAttempt.update({
    where: { key },
    data: { count: attempt.count + 1 },
  })

  return true
}

export async function resetRateLimit(key: string): Promise<void> {
  await prisma.oTPAttempt.deleteMany({
    where: { key },
  })
}

export async function resetLoginRateLimit(key: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({
    where: { key },
  })
}
