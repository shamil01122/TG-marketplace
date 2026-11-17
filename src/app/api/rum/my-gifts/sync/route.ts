
import { NextResponse } from 'next/server'
import { getRumSession } from '@/lib/rum/session'
import { getTelegramNftGifts } from '@/lib/telegram-gifts'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {console.log('RUM NFT SYNC: request received')
    const session = await getRumSession()
console.log('RUM NFT SYNC: session found:', Boolean(session))

    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация Telegram' },
        { status: 401 },
      )
    }

    const gifts = await getTelegramNftGifts(session.telegramUserId)

    return NextResponse.json({
      success: true,
      total: gifts.length,
      gifts,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('RUM NFT sync test error:', error)

    return NextResponse.json(
      { error: 'Не удалось получить NFT из Telegram' },
      { status: 502 },
    )
  }
}
