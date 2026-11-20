
import { NextRequest, NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db, rumListings, rumGifts, rumProfiles } from '@/lib/db'
import { getRumSession } from '@/lib/rum/session'
import { getTelegramNftGifts } from '@/lib/telegram-gifts'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const listings = await db
      .select({
        id: rumListings.id,
        priceTon: rumListings.priceTon,
        createdAt: rumListings.createdAt,
        gift: {
          id: rumGifts.id,
          name: rumGifts.name,
          collection: rumGifts.collection,
          number: rumGifts.number,
          model: rumGifts.model,
          modelRarity: rumGifts.modelRarity,
          modelRarityPerMille: rumGifts.modelRarityPerMille,
          backdrop: rumGifts.backdrop,
          backdropCenterColor: rumGifts.backdropCenterColor,
          backdropEdgeColor: rumGifts.backdropEdgeColor,
          backdropSymbolColor: rumGifts.backdropSymbolColor,
          backdropTextColor: rumGifts.backdropTextColor,
          backdropRarityPerMille: rumGifts.backdropRarityPerMille,
          symbol: rumGifts.symbol,
          symbolRarityPerMille: rumGifts.symbolRarityPerMille,
          imageUrl: rumGifts.imageUrl,
        },
        seller: {
          username: rumProfiles.username,
          displayName: rumProfiles.displayName,
        },
      })
      .from(rumListings)
      .innerJoin(rumGifts, eq(rumListings.giftId, rumGifts.id))
      .innerJoin(rumProfiles, eq(rumListings.sellerId, rumProfiles.id))
      .where(
        and(
          eq(rumListings.status, 'active'),
          eq(rumGifts.status, 'listed'),
          eq(rumGifts.isBurned, false),
          eq(rumGifts.isFromBlockchain, false),
        ),
      )
      .orderBy(desc(rumListings.createdAt))
      .limit(100)

    return NextResponse.json(listings, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('RUM listings API error:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить объявления' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getRumSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация Telegram' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const giftId = body?.giftId
    const priceTon = body?.priceTon

    if (
      typeof giftId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(giftId)
    ) {
      return NextResponse.json(
        { error: 'Некорректный ID подарка' },
        { status: 400 },
      )
    }

    if (
      typeof priceTon !== 'string' ||
      !/^(?:0|[1-9]\d{0,8})(?:\.\d{1,9})?$/.test(priceTon) ||
      Number(priceTon) <= 0
    ) {
      return NextResponse.json(
        { error: 'Укажите корректную цену в TON' },
        { status: 400 },
      )
    }

    const telegramGifts = await getTelegramNftGifts(session.telegramUserId)

    const [storedGift] = await db
      .select({
        telegramGiftId: rumGifts.telegramGiftId,
      })
      .from(rumGifts)
      .where(
        and(
          eq(rumGifts.id, giftId),
          eq(rumGifts.ownerId, session.profileId),
          eq(rumGifts.status, 'available'),
          eq(rumGifts.isBurned, false),
          eq(rumGifts.isFromBlockchain, false),
        ),
      )
      .limit(1)

    const isStillOwned = storedGift && telegramGifts.some(
      (gift) =>
        gift.telegramGiftId === storedGift.telegramGiftId &&
        !gift.isBurned &&
        !gift.isFromBlockchain,
    )

    if (!isStillOwned) {
      return NextResponse.json(
        {
          error: 'Подарок не найден в актуальном списке Telegram или недоступен для продажи',
        },
        { status: 409 },
      )
    }

    const listing = await db.transaction(async (tx) => {
      const [gift] = await tx
        .update(rumGifts)
        .set({ status: 'listed' })
        .where(
          and(
            eq(rumGifts.id, giftId),
            eq(rumGifts.ownerId, session.profileId),
            eq(rumGifts.status, 'available'),
            eq(rumGifts.isBurned, false),
            eq(rumGifts.isFromBlockchain, false),
          ),
        )
        .returning({ id: rumGifts.id })

      if (!gift) return null

      const [created] = await tx
        .insert(rumListings)
        .values({
          giftId: gift.id,
          sellerId: session.profileId,
          priceTon,
        })
        .returning({
          id: rumListings.id,
          priceTon: rumListings.priceTon,
          status: rumListings.status,
        })

      return created
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Подарок уже недоступен или выставлен' },
        { status: 409 },
      )
    }

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('RUM listing creation error:', error)
    return NextResponse.json(
      { error: 'Не удалось создать объявление' },
      { status: 500 },
    )
  }
}
