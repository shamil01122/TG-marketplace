import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db, rumGifts } from '@/lib/db'
import { getRumSession } from '@/lib/rum/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getRumSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация Telegram' },
        { status: 401 },
      )
    }

    const gifts = await db
      .select({
        id: rumGifts.id,
        name: rumGifts.name,
        collection: rumGifts.collection,
        model: rumGifts.model,
        backdrop: rumGifts.backdrop,
        symbol: rumGifts.symbol,
        imageUrl: rumGifts.imageUrl,
        status: rumGifts.status,
      })
      .from(rumGifts)
      .where(
  and(
    eq(rumGifts.ownerId, session.profileId),
    eq(rumGifts.status, 'available'),
    eq(rumGifts.isBurned, false),
    eq(rumGifts.isFromBlockchain, false),
  ),
)
    return NextResponse.json(gifts, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('RUM my gifts API error:', error)

    return NextResponse.json(
      { error: 'Не удалось загрузить подарки' },
      { status: 500 },
    )
  }
}
