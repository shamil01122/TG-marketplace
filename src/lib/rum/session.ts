import 'server-only'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'rum_session'
const SESSION_DURATION = 60 * 60 * 24 * 7

function getSecret() {
  const secret = process.env.RUM_SESSION_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('RUM_SESSION_SECRET не настроен')
  }

  return new TextEncoder().encode(secret)
}

export type RumSession = {
  profileId: string
  telegramUserId: number
}

export async function createRumSession(
  profileId: string,
  telegramUserId: number,
) {
  const token = await new SignJWT({ telegramUserId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(profileId)
    .setIssuer('rum')
    .setAudience('rum-app')
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())

  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  })
}

export async function getRumSession(): Promise<RumSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: 'rum',
      audience: 'rum-app',
    })

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.telegramUserId !== 'number' ||
      !Number.isSafeInteger(payload.telegramUserId)
    ) {
      return null
    }

    return {
      profileId: payload.sub,
      telegramUserId: payload.telegramUserId,
    }
  } catch {
    return null
  }
}

export async function clearRumSession() {
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
