
'use client'

import RumBottomNav from '@/components/rum/bottom-nav'
import Link from 'next/link'
import TelegramAuth from '@/components/telegram-auth'
import { useEffect, useState } from 'react'

type Listing = {
  id: string
  priceTon: string
  gift: {
    name: string
    collection: string
    model: string
    imageUrl: string
    backdropCenterColor: number | string | null
    backdropEdgeColor: number | string | null
  }
  seller: {
    username: string
    displayName: string
  }
}

const categories = ['ALL GIFTS', 'RARE', 'NEW', 'COLLECTIONS']

function getSafeColor(
  color: number | string | null | undefined,
  fallback: string,
) {
  if (typeof color === 'number') {
    if (Number.isInteger(color) && color >= 0 && color <= 0xffffff) {
      return '#' + color.toString(16).padStart(6, '0')
    }
    return fallback
  }

  if (typeof color === 'string') {
    if (/^#[0-9a-fA-F]{6}$/.test(color)) {
      return color
    }

    if (/^\d+$/.test(color)) {
      const numericColor = Number(color)
      if (numericColor >= 0 && numericColor <= 0xffffff) {
        return '#' + numericColor.toString(16).padStart(6, '0')
      }
    }
  }

  return fallback
}

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [brokenImages, setBrokenImages] = useState<string[]>([])

  async function loadListings() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/rum/listings', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Не удалось загрузить объявления')
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Неверный формат данных')
      }

      setListings(data)
      setBrokenImages([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function initialLoad() {
      try {
        const response = await fetch('/api/rum/listings', {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Не удалось загрузить объявления')
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Неверный формат данных')
        }

        if (!cancelled) {
          setListings(data)
          setBrokenImages([])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    initialLoad()

    return () => {
      cancelled = true
    }
  }, [])

  const formatPrice = (price: string) =>
    Number(price).toLocaleString('ru-RU', {
      maximumFractionDigits: 4,
    })

  return (
    <main className="mx-auto min-h-screen max-w-[520px] overflow-hidden bg-[#000000] pb-28 text-white">
      <TelegramAuth />

      <header className="flex items-center justify-between px-5 pb-6 pt-7">
        <Link href="/" className="group">
          <div className="text-[38px] font-black leading-none tracking-[-0.09em]">
            RUM<span className="text-white">.</span>
          </div>
          <div className="mt-2 text-[9px] font-bold tracking-[0.32em] text-[#777777]">
            DIGITAL COLLECTIBLES
          </div>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#101010] px-4 py-3">
          <div className="text-[8px] font-bold tracking-[0.2em] text-[#777777]">
            YOUR BALANCE
          </div>
          <div className="mt-1 text-sm font-bold">
            — <span className="text-white">TON</span>
          </div>
        </div>
      </header>

      <section className="px-4">
        <div className="relative min-h-[390px] overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#1b1b1b] via-[#101010] to-[#050505] p-6">
          <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-white/[0.04] blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-white/[0.03] blur-[70px]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span className="text-[9px] font-bold tracking-[0.19em] text-[#cccccc]">
                TELEGRAM GIFT MARKETPLACE
              </span>
            </div>

            <h1 className="mt-9 text-[47px] font-black uppercase leading-[0.91] tracking-[-0.075em]">
              YOUR GIFTS.
              <br />
              <span className="text-[#888888]">YOUR LEGACY.</span>
            </h1>

            <p className="mt-6 max-w-[255px] text-[13px] leading-6 text-[#aaaaaa]">
              Редкие Telegram-подарки. Уникальные коллекции. Твоя история начинается здесь.
            </p>

            <Link
              href="/catalog"
              className="mt-8 inline-flex items-center gap-5 rounded-xl bg-white px-5 py-4 text-[10px] font-black tracking-[0.16em] text-black transition hover:bg-[#cccccc]"
            >
              EXPLORE MARKET
              <span className="text-base">↗</span>
            </Link>
          </div>

          <div className="pointer-events-none absolute bottom-3 right-3 rotate-[-14deg] select-none text-[116px] opacity-[0.10]">
            🎁
          </div>

          <div className="absolute bottom-5 right-6 text-[8px] font-bold tracking-[0.25em] text-white/30">
            RUM / 2026
          </div>
        </div>
      </section>

      <section className="px-5 pt-7">
        <Link
          href="/catalog"
          className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#101010] px-4 py-4 transition hover:border-white/25"
        >
          <span className="text-xl text-white">⌕</span>
          <span className="text-xs text-[#aaaaaa]">
            Search gifts & collections
          </span>
          <span className="ml-auto text-lg text-white">→</span>
        </Link>
      </section>

      <section className="pt-9">
        <div className="mb-4 flex items-center justify-between px-5">
          <div>
            <div className="mb-2 text-[8px] font-bold tracking-[0.24em] text-[#777777]">
              EXPLORE THE WORLD
            </div>
            <h2 className="text-lg font-black tracking-[-0.04em]">
              Discover
            </h2>
          </div>
          <span className="text-[9px] tracking-widest text-[#666666]">
            01 / 04
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto px-5 pb-2">
          {categories.map((category, index) => (
            <Link
              key={category}
              href="/catalog"
              className={
                index === 0
                  ? 'shrink-0 rounded-xl bg-white px-4 py-3 text-[9px] font-black tracking-[0.13em] text-black transition'
                  : 'shrink-0 rounded-xl border border-white/[0.09] bg-[#101010] px-4 py-3 text-[9px] font-black tracking-[0.13em] text-[#aaaaaa] transition hover:border-white/30'
              }
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pt-9">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[8px] font-bold tracking-[0.22em] text-[#888888]">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              LIVE MARKETPLACE
            </div>
            <h2 className="text-[25px] font-black tracking-[-0.06em]">
              Trending gifts<span className="text-[#888888]">.</span>
            </h2>
          </div>

          <Link
            href="/catalog"
            className="pb-1 text-[9px] font-bold tracking-wider text-[#aaaaaa] transition hover:text-white"
          >
            VIEW ALL ↗
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101010]"
              >
                <div className="aspect-square bg-white/[0.04]" />
                <div className="space-y-3 p-3">
                  <div className="h-3 w-3/4 rounded bg-white/[0.07]" />
                  <div className="h-2 w-1/2 rounded bg-white/[0.05]" />
                  <div className="h-4 w-2/3 rounded bg-white/[0.07]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-7 text-center">
            <p className="text-sm text-[#cccccc]">{error}</p>
            <button
              onClick={loadListings}
              className="mt-5 rounded-xl border border-white/20 px-5 py-3 text-[10px] font-bold tracking-widest text-white"
            >
              TRY AGAIN ↻
            </button>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#101010] p-8 text-center">
            <div className="mb-4 text-5xl">🎁</div>
            <p className="text-sm font-bold">Пока нет активных объявлений</p>
            <p className="mt-2 text-xs leading-5 text-[#858585]">
              Здесь появятся уникальные подарки, которые пользователи выставят на продажу.
            </p>
            <Link
              href="/sell"
              className="mt-6 inline-block rounded-xl bg-white px-5 py-3.5 text-[10px] font-black tracking-widest text-black"
            >
              LIST YOUR GIFT ↗
            </Link>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {listings.slice(0, 4).map((listing) => {
              const centerColor = getSafeColor(
                listing.gift.backdropCenterColor,
                '#202020',
              )
              const edgeColor = getSafeColor(
                listing.gift.backdropEdgeColor,
                '#080808',
              )

              return (
                <Link
                  href="/catalog"
                  key={listing.id}
                  className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101010] transition hover:border-white/30"
                >
                  <div
                    className="relative flex aspect-square items-center justify-center overflow-hidden p-4"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, ' +
                        centerColor +
                        ', ' +
                        edgeColor +
                        ')',
                    }}
                  >
                    {listing.gift.imageUrl && !brokenImages.includes(listing.id) ? (
                      <img
                        src={listing.gift.imageUrl}
                        alt={listing.gift.name}
                        onError={() =>
                          setBrokenImages((prev) =>
                            prev.includes(listing.id)
                              ? prev
                              : [...prev, listing.id],
                          )
                        }
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-[70px]">🎁</span>
                    )}

                    {listing.gift.collection && (
                      <span className="absolute left-2 top-2 max-w-[85%] truncate rounded-md border border-white/15 bg-black/70 px-2 py-1 text-[7px] font-bold tracking-wider text-[#dddddd]">
                        {listing.gift.collection}
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="truncate text-xs font-bold text-white">
                      {listing.gift.name}
                    </h3>

                    {listing.gift.model && (
                      <p className="mt-1 truncate text-[9px] text-[#888888]">
                        {listing.gift.model}
                      </p>
                    )}

                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[8px] font-bold tracking-wider text-[#777777]">
                          PRICE
                        </p>
                        <p className="mt-1 text-sm font-black text-white">
                          {formatPrice(listing.priceTon)} TON
                        </p>
                      </div>
                      <span className="text-[9px] text-[#888888]">↗</span>
                    </div>

                    <p className="mt-2 truncate text-[8px] text-[#666666]">
                      {listing.seller.displayName ||
                        (listing.seller.username
                          ? '@' + listing.seller.username
                          : 'RUM seller')}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <RumBottomNav />
    </main>
  )
}
