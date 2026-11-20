
import { NextResponse } from 'next/server'
import { and, eq, inArray } from 'drizzle-orm'
import {
  db,
  rumGifts,
  rumListings,
} from '@/lib/db'
import { getRumSession } from '@/lib/rum/session'
import { getTelegramNftGifts } from '@/lib/telegram-gifts'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await getRumSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация Telegram' },
        { status: 401 },
      )
    }

    const gifts = await getTelegramNftGifts(session.telegramUserId)
    const currentGiftIds = new Set(
      gifts.map((gift) => gift.telegramGiftId),
    )

    await db.transaction(async (tx) => {
      const previousGifts = await tx
        .select({
          id: rumGifts.id,
          telegramGiftId: rumGifts.telegramGiftId,
        })
        .from(rumGifts)
        .where(eq(rumGifts.ownerId, session.profileId))

      for (const previousGift of previousGifts) {
        if (!currentGiftIds.has(previousGift.telegramGiftId)) {
          await tx
            .update(rumListings)
            .set({ status: 'cancelled' })
            .where(
              and(
                eq(rumListings.giftId, previousGift.id),
                inArray(rumListings.status, ['active', 'reserved']),
              ),
            )

          await tx
            .update(rumGifts)
            .set({
              ownerId: null,
              status: 'available',
            })
            .where(eq(rumGifts.id, previousGift.id))
        }
      }

      for (const gift of gifts) {
        const giftAttributes = {
          name: gift.name,
          collection: gift.baseName,
          number: gift.number,

          model: gift.model,
          modelRarity: gift.modelRarity,
          modelRarityPerMille: gift.modelRarityPerMille,

          backdrop: gift.backdrop,
          backdropCenterColor: gift.backdropCenterColor,
          backdropEdgeColor: gift.backdropEdgeColor,
          backdropSymbolColor: gift.backdropSymbolColor,
          backdropTextColor: gift.backdropTextColor,
          backdropRarityPerMille: gift.backdropRarityPerMille,

          symbol: gift.symbol,
          symbolRarityPerMille: gift.symbolRarityPerMille,

          imageUrl: gift.imageUrl,
          isBurned: gift.isBurned,
          isFromBlockchain: gift.isFromBlockchain,
        }

        const [existing] = await tx
          .select({
            id: rumGifts.id,
            ownerId: rumGifts.ownerId,
          })
          .from(rumGifts)
          .where(eq(rumGifts.telegramGiftId, gift.telegramGiftId))
          .limit(1)

        if (existing) {
          const ownershipChanged =
            existing.ownerId !== session.profileId

          const mustCancelListing =
            ownershipChanged ||
            gift.isBurned ||
            gift.isFromBlockchain

          if (mustCancelListing) {
            await tx
              .update(rumListings)
              .set({ status: 'cancelled' })
              .where(
                and(
                  eq(rumListings.giftId, existing.id),
                  inArray(rumListings.status, ['active', 'reserved']),
                ),
              )
          }

          await tx
            .update(rumGifts)
            .set({
              ...giftAttributes,
              ownerId: session.profileId,
              ...(mustCancelListing
                ? { status: 'available' as const }
                : {}),
            })
            .where(eq(rumGifts.id, existing.id))
        } else {
          await tx.insert(rumGifts).values({
            telegramGiftId: gift.telegramGiftId,
            ...giftAttributes,
            ownerId: session.profileId,
          })
        }
      }
    })

    return NextResponse.json(
      {
        success: true,
        total: gifts.length,
        saved: gifts.length,
        gifts,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('RUM NFT sync error:', error)

    return NextResponse.json(
      { error: 'Не удалось синхронизировать NFT с базой данных' },
      { status: 502 },
    )
  }
}
