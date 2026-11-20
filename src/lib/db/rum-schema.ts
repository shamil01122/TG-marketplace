
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  numeric,
  bigint,
  boolean,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'

export const giftStatusEnum = pgEnum('rum_gift_status', [
  'available',
  'listed',
  'reserved',
  'sold',
])

export const listingStatusEnum = pgEnum('rum_listing_status', [
  'active',
  'reserved',
  'sold',
  'cancelled',
])

export const dealStatusEnum = pgEnum('rum_deal_status', [
  'pending',
  'payment_pending',
  'paid',
  'transferring',
  'completed',
  'cancelled',
  'disputed',
])

export const rumProfiles = pgTable('rum_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  telegramUserId: bigint('telegram_user_id', { mode: 'number' }).notNull().unique(),
  username: text('username').notNull().default(''),
  displayName: text('display_name').notNull().default(''),
  avatarUrl: text('avatar_url').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const rumGifts = pgTable('rum_gifts', {
  id: uuid('id').primaryKey().defaultRandom(),
  telegramGiftId: text('telegram_gift_id').notNull().unique(),
  name: text('name').notNull(),
  collection: text('collection').notNull().default(''),
  number: integer('number'),
  model: text('model').notNull().default(''),
  modelRarity: text('model_rarity'),
  modelRarityPerMille: integer('model_rarity_per_mille'),
  backdrop: text('backdrop').notNull().default(''),
  backdropCenterColor: integer('backdrop_center_color'),
  backdropEdgeColor: integer('backdrop_edge_color'),
  backdropSymbolColor: integer('backdrop_symbol_color'),
  backdropTextColor: integer('backdrop_text_color'),
  backdropRarityPerMille: integer('backdrop_rarity_per_mille'),
  symbol: text('symbol').notNull().default(''),
  symbolRarityPerMille: integer('symbol_rarity_per_mille'),
  imageUrl: text('image_url').notNull().default(''),
  isBurned: boolean('is_burned').notNull().default(false),
  isFromBlockchain: boolean('is_from_blockchain').notNull().default(false),
  ownerId: uuid('owner_id').references(() => rumProfiles.id),
  status: giftStatusEnum('status').notNull().default('available'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const rumListings = pgTable('rum_listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  giftId: uuid('gift_id').notNull().references(() => rumGifts.id),
  sellerId: uuid('seller_id').notNull().references(() => rumProfiles.id),
  priceTon: numeric('price_ton', { precision: 20, scale: 9 }).notNull(),
  status: listingStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const rumDeals = pgTable('rum_deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().references(() => rumListings.id),
  buyerId: uuid('buyer_id').notNull().references(() => rumProfiles.id),
  sellerId: uuid('seller_id').notNull().references(() => rumProfiles.id),
  amountTon: numeric('amount_ton', { precision: 20, scale: 9 }).notNull(),
  status: dealStatusEnum('status').notNull().default('pending'),
  transactionHash: text('transaction_hash'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
