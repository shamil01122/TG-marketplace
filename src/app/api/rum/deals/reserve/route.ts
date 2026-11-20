
import { NextRequest, NextResponse } from 'next/server'
import { and, eq, lte } from 'drizzle-orm'
import {
  db,
  rumDeals,
  rumGifts,
  rumListings,
} from '@/lib/db'
import { getRumSession } from '@/lib/rum/session'

export const dynamic = 'force-dynamic'

const RESERVATION_MINUTES = 15

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
    const listingId = body?.listingId

    if (
      typeof listingId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId)
    ) {
      return NextResponse.json(
        { error: 'Некорректный ID объявления' },
        { status: 400 },
      )
    }

    const result = await db.transaction(async (tx) => {
      const now = new Date()

      // Находим просроченные резервы и блокируем их строки.
      const expiredDeals = await tx
        .select({
          id: rumDeals.id,
          listingId: rumDeals.listingId,
          sellerId: rumDeals.sellerId,
          giftId: rumListings.giftId,
        })
        .from(rumDeals)
        .innerJoin(
          rumListings,
          eq(rumDeals.listingId, rumListings.id),
        )
        .where(
          and(
            eq(rumDeals.status, 'payment_pending'),
            lte(rumDeals.expiresAt, now),
          ),
        )
        .for('update')

      // Освобождаем объявления и подарки просроченных сделок.
      for (const expiredDeal of expiredDeals) {
        await tx
          .update(rumListings)
          .set({ status: 'active' })
          .where(
            and(
              eq(rumListings.id, expiredDeal.listingId),
              eq(rumListings.status, 'reserved'),
            ),
          )

        await tx
          .update(rumGifts)
          .set({ status: 'listed' })
          .where(
            and(
              eq(rumGifts.id, expiredDeal.giftId),
              eq(rumGifts.ownerId, expiredDeal.sellerId),
              eq(rumGifts.status, 'reserved'),
            ),
          )

        await tx
          .update(rumDeals)
          .set({ status: 'cancelled' })
          .where(eq(rumDeals.id, expiredDeal.id))
      }

      const [listing] = await tx
        .select({
          id: rumListings.id,
          sellerId: rumListings.sellerId,
          giftId: rumListings.giftId,
          priceTon: rumListings.priceTon,
          giftStatus: rumGifts.status,
          isBurned: rumGifts.isBurned,
          isFromBlockchain: rumGifts.isFromBlockchain,
        })
        .from(rumListings)
        .innerJoin(
          rumGifts,
          eq(rumListings.giftId, rumGifts.id),
        )
        .where(eq(rumListings.id, listingId))
        .limit(1)

      if (!listing || listing.sellerId === session.profileId) {
        return {
          error: 'Объявление недоступно',
          status: 409,
        }
      }

      if (
        listing.giftStatus !== 'listed' ||
        listing.isBurned ||
        listing.isFromBlockchain
      ) {
        return {
          error: 'Подарок больше недоступен',
          status: 409,
        }
      }

      // Условное обновление защищает от двойного резервирования.
      const [reservedListing] = await tx
        .update(rumListings)
        .set({ status: 'reserved' })
        .where(
          and(
            eq(rumListings.id, listingId),
            eq(rumListings.status, 'active'),
          ),
        )
        .returning({ id: rumListings.id })

      if (!reservedListing) {
        return {
          error: 'Подарок уже зарезервирован',
          status: 409,
        }
      }

      const [reservedGift] = await tx
        .update(rumGifts)
        .set({ status: 'reserved' })
        .where(
          and(
            eq(rumGifts.id, listing.giftId),
            eq(rumGifts.status, 'listed'),
            eq(rumGifts.ownerId, listing.sellerId),
          ),
        )
        .returning({ id: rumGifts.id })

      if (!reservedGift) {
        throw new Error('Не удалось зарезервировать подарок')
      }

      const expiresAt = new Date(
        now.getTime() + RESERVATION_MINUTES * 60 * 1000,
      )

      const [deal] = await tx
        .insert(rumDeals)
        .values({
          listingId,
          buyerId: session.profileId,
          sellerId: listing.sellerId,
          amountTon: listing.priceTon,
          status: 'payment_pending',
          expiresAt,
        })
        .returning({
          id: rumDeals.id,
          amountTon: rumDeals.amountTon,
          status: rumDeals.status,
          expiresAt: rumDeals.expiresAt,
        })

      return { deal }
    })

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      )
    }

    return NextResponse.json(
      {
        success: true,
        deal: result.deal,
        message:
          'Подарок зарезервирован на 15 минут. Оплата и передача NFT пока не подключены.',
      },
      {
        status: 201,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('RUM reservation error:', error)

    return NextResponse.json(
      { error: 'Не удалось зарезервировать подарок' },
      { status: 500 },
    )
  }
}
