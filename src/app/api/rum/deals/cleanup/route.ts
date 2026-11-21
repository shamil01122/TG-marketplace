
import { NextRequest, NextResponse } from 'next/server'
import { and, eq, lte } from 'drizzle-orm'
import { timingSafeEqual } from 'node:crypto'
import {
  db,
  rumDeals,
  rumGifts,
  rumListings,
} from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RUM_CLEANUP_SECRET

    if (!secret) {
      return NextResponse.json(
        { error: 'Cleanup secret is not configured' },
        { status: 503 },
      )
    }

    const authorization = req.headers.get('authorization')
    const expected = Buffer.from(`Bearer ${secret}`)
    const received = Buffer.from(authorization ?? '')

    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const cleanedCount = await db.transaction(async (tx) => {
      const now = new Date()

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

      let cleaned = 0

      for (const deal of expiredDeals) {
        const [cancelledDeal] = await tx
          .update(rumDeals)
          .set({ status: 'cancelled' })
          .where(
            and(
              eq(rumDeals.id, deal.id),
              eq(rumDeals.status, 'payment_pending'),
              lte(rumDeals.expiresAt, now),
            ),
          )
          .returning({ id: rumDeals.id })

        if (!cancelledDeal) {
          continue
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

        cleaned += 1
      }

      return cleaned
    })

    return NextResponse.json(
      {
        success: true,
        cleanedCount,
        message: `Освобождено просроченных резервов: ${cleanedCount}`,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('RUM reservation cleanup error:', error)

    return NextResponse.json(
      { error: 'Не удалось очистить просроченные резервы' },
      { status: 500 },
    )
  }
}
