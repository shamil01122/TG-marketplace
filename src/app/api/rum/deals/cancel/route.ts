
import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import {
  db,
  rumDeals,
  rumGifts,
  rumListings,
} from '@/lib/db'
import { getRumSession } from '@/lib/rum/session'

export const dynamic = 'force-dynamic'

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
    const dealId = body?.dealId

    if (
      typeof dealId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dealId)
    ) {
      return NextResponse.json(
        { error: 'Некорректный ID сделки' },
        { status: 400 },
      )
    }

    const result = await db.transaction(async (tx) => {
      const [deal] = await tx
        .select({
          id: rumDeals.id,
          listingId: rumDeals.listingId,
          buyerId: rumDeals.buyerId,
          sellerId: rumDeals.sellerId,
          status: rumDeals.status,
          giftId: rumListings.giftId,
        })
        .from(rumDeals)
        .innerJoin(
          rumListings,
          eq(rumDeals.listingId, rumListings.id),
        )
        .where(eq(rumDeals.id, dealId))
        .for('update')
        .limit(1)

      if (!deal || deal.buyerId !== session.profileId) {
        return {
          error: 'Сделка не найдена',
          status: 404,
        }
      }

      if (deal.status !== 'payment_pending') {
        return {
          error: 'Эту сделку уже нельзя отменить',
          status: 409,
        }
      }

      const [cancelledDeal] = await tx
        .update(rumDeals)
        .set({ status: 'cancelled' })
        .where(
          and(
            eq(rumDeals.id, deal.id),
            eq(rumDeals.buyerId, session.profileId),
            eq(rumDeals.status, 'payment_pending'),
          ),
        )
        .returning({ id: rumDeals.id })

      if (!cancelledDeal) {
        return {
          error: 'Не удалось отменить резерв',
          status: 409,
        }
      }

      await tx
        .update(rumListings)
        .set({ status: 'active' })
        .where(
          and(
            eq(rumListings.id, deal.listingId),
            eq(rumListings.status, 'reserved'),
          ),
        )

      await tx
        .update(rumGifts)
        .set({ status: 'listed' })
        .where(
          and(
            eq(rumGifts.id, deal.giftId),
            eq(rumGifts.ownerId, deal.sellerId),
            eq(rumGifts.status, 'reserved'),
          ),
        )

      return { success: true }
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
        message: 'Резерв отменён. Подарок снова доступен.',
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('RUM reservation cancellation error:', error)

    return NextResponse.json(
      { error: 'Не удалось отменить резерв' },
      { status: 500 },
    )
  }
}
