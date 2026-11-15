import { NextRequest, NextResponse } from 'next/server'
import { db, rumProfiles } from '@/lib/db'
import { parseTelegramUser } from '@/lib/telegram'
import { createRumSession } from '@/lib/rum/session'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const initData = body?.initData

    if (typeof initData !== 'string' || initData.length > 16000) {
      return NextResponse.json(
        { error: 'Invalid initData' },
        { status: 400 },
      )
    }

    const user = parseTelegramUser(initData)

    if (!user) {
      return NextResponse.json(
        { error: 'Telegram authentication failed' },
        { status: 401 },
      )
    }

    const displayName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(' ')

    const [profile] = await db
      .insert(rumProfiles)
      .values({
        telegramUserId: user.id,
        username: user.username ?? '',
        displayName,
        avatarUrl: user.photo_url ?? '',
      })
      .onConflictDoUpdate({
        target: rumProfiles.telegramUserId,
        set: {
          username: user.username ?? '',
          displayName,
          avatarUrl: user.photo_url ?? '',
        },
      })
      .returning({
        id: rumProfiles.id,
        username: rumProfiles.username,
        displayName: rumProfiles.displayName,
      })

    if (!profile) {
      throw new Error('Не удалось создать профиль')
    }

    await createRumSession(profile.id, user.id)

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('RUM Telegram auth error:', error)

    return NextResponse.json(
      { error: 'Could not authenticate Telegram user' },
      { status: 500 },
    )
  }
}
