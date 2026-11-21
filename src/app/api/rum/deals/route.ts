
import { NextResponse } from 'next/server'
import { desc, eq, or } from 'drizzle-orm'
import {
  db,
  rumDeals,
  rumListings,
  rumGifts,
  rumProfiles,
} from '@/lib/db'
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

    const deals = await db
      .select({
        id: rumDeals.id,
        listingId: rumDeals.listingId,
        buyerId: rumDeals.buyerId,
        sellerId: rumDeals.sellerId,
        status: rumDeals.status,
        amountTon: rumDeals.amountTon,
        transactionHash: rumDeals.transactionHash,
        expiresAt: rumDeals.expiresAt,
        paidAt: rumDeals.paidAt,
        completedAt: rumDeals.completedAt,
        createdAt: rumDeals.createdAt,
        giftId: rumGifts.id,
        giftName: rumGifts.name,
        collection: rumGifts.collection,
        number: rumGifts.number,
        model: rumGifts.model,
        imageUrl: rumGifts.imageUrl,
        sellerUsername: rumProfiles.username,
        sellerDisplayName: rumProfiles.displayName,
      })
      .from(rumDeals)
      .innerJoin(
        rumListings,
        eq(rumDeals.listingId, rumListings.id),
      )
      .innerJoin(
        rumGifts,
        eq(rumListings.giftId, rumGifts.id),
      )
      .innerJoin(
        rumProfiles,
        eq(rumDeals.sellerId, rumProfiles.id),
      )
      .where(
        or(
          eq(rumDeals.buyerId, session.profileId),
          eq(rumDeals.sellerId, session.profileId),
        ),
      )
      .orderBy(desc(rumDeals.createdAt))
      .limit(100)

    return NextResponse.json(
      {
        success: true,
        deals: deals.map((deal) => ({
          ...deal,
          role:
            deal.buyerId === session.profileId
              ? 'buyer'
              : 'seller',
        })),
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('RUM deals history error:', error)

    return NextResponse.json(
      { error: 'Не удалось загрузить историю сделок' },
      { status: 500 },
    )
  }
}
