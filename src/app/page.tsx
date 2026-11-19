
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
  }
  seller: {
    username: string
    displayName: string
  }
}

const categories = ['ALL GIFTS', 'RARE', 'NEW', 'COLLECTIONS']

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
      setError(
        err instanceof Error ? err.message : 'Ошибка загрузки',
      )
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
          setError(
            err instanceof Error ? err.message : 'Ошибка загрузки',
          )
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
    <main className="mx-auto min-h-screen max-w-[520px] overflow-hidden bg-[#08090b] pb-28 text-[#f5f3ee]">
      <TelegramAuth />

      <header className="flex items-center justify-between px-5 pb-6 pt-7">
        <Link href="/" className="group">
          <div className="text-[38px] font-black leading-none tracking-[-0.09em]">
            RUM<span className="text-[#c8a96e]">.</span>
          </div>
          <div className="mt-2 text-[9px] font-bold tracking-[0.32em] text-[#77736b]">
            DIGITAL COLLECTIBLES
          </div>
        </Link>

        <div className="rounded-2xl border border-[#c8a96e]/20 bg-[#c8a96e]/[0.06] px-4 py-3">
          <div className="text-[8px] font-bold tracking-[0.2em] text-[#9b927f]">
            YOUR BALANCE
          </div>
          <div className="mt-1 text-sm font-bold">
            — <span className="text-[#c8a96e]">TON</span>
          </div>
        </div>
      </header>

      <section className="px-4">
        <div className="relative min-h-[390px] overflow-hidden rounded-[28px] border border-[#c8a96e]/25 bg-gradient-to-br from-[#29251e] via-[#171714] to-[#0c0d0e] p-6">
          <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-[#c8a96e]/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#8a7046]/10 blur-[70px]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c8a96e]/30 bg-black/20 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8a96e]" />
              <span className="text-[9px] font-bold tracking-[0.19em] text-[#d3bd91]">
                TELEGRAM GIFT MARKETPLACE
              </span>
            </div>

            <h1 className="mt-9 text-[47px] font-black uppercase leading-[0.91] tracking-[-0.075em]">
              YOUR GIFTS.
              <br />
              <span className="text-[#c8a96e]">YOUR LEGACY.</span>
            </h1>

            <p className="mt-6 max-w-[255px] text-[13px] leading-6 text-[#aaa69d]">
              Редкие Telegram-подарки. Уникальные коллекции. Твоя история начинается здесь.
            </p>

            <Link
              href="/catalog"
              className="mt-8 inline-flex items-center gap-5 rounded-xl bg-[#c8a96e] px-5 py-4 text-[10px] font-black tracking-[0.16em] text-[#17130d] transition hover:bg-[#e0c18a]"
            >
              EXPLORE MARKET
              <span className="text-base">↗</span>
            </Link>
          </div>

          <div className="pointer-events-none absolute bottom-3 right-3 rotate-[-14deg] select-none text-[116px] opacity-[0.13]">
            🎁
          </div>

          <div className="absolute bottom-5 right-6 text-[8px] font-bold tracking-[0.25em] text-[#c8a96e]/50">
            RUM / 2026
          </div>
        </div>
      </section>

      <section className="px-5 pt-7">
        <Link
          href="/catalog"
          className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#111214] px-4 py-4 transition hover:border-[#c8a96e]/30"
        >
          <span className="text-xl text-[#c8a96e]">⌕</span>
          <span className="text-xs text-[#aaa69d]">
            Search gifts & collections
          </span>
          <span className="ml-auto text-lg text-[#c8a96e]">→</span>
        </Link>
      </section>

      <section className="pt-9">
        <div className="mb-4 flex items-center justify-between px-5">
          <div>
            <div className="mb-2 text-[8px] font-bold tracking-[0.24em] text-[#c8a96e]">
              EXPLORE THE WORLD
            </div>
            <h2 className="text-lg font-black tracking-[-0.04em]">
              Discover
            </h2>
          </div>
          <span className="text-[9px] tracking-widest text-[#66635c]">
            01 / 04
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto px-5 pb-2">
          {categories.map((category, index) => (
            <Link
              key={category}
              href="/catalog"
              className={`shrink-0 rounded-xl px-4 py-3 text-[9px] font-black tracking-[0.13em] transition ${
                index === 0
                  ? 'bg-[#c8a96e] text-[#17130d]'
                  : 'border border-white/[0.09] bg-[#111214] text-[#aaa69d] hover:border-[#c8a96e]/40'
              }`}
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pt-9">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[8px] font-bold tracking-[0.22em] text-[#c8a96e]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8a96e]" />
              LIVE MARKETPLACE
            </div>
            <h2 className="text-[25px] font-black tracking-[-0.06em]">
              Trending gifts<span className="text-[#c8a96e]">.</span>
            </h2>
          </div>

          <Link
            href="/catalog"
            className="pb-1 text-[9px] font-bold tracking-wider text-[#c8a96e]"
          >
            VIEW ALL ↗
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111214]"
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
          <div className="rounded-2xl border border-red-900/30 bg-[#171214] p-7 text-center">
            <p className="text-sm text-[#d5aaa0]">{error}</p>
            <button
              onClick={loadListings}
              className="mt-5 rounded-xl border border-[#c8a96e]/30 px-5 py-3 text-[10px] font-bold tracking-widest text-[#c8a96e]"
            >
              TRY AGAIN ↻
            </button>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#111214] p-8 text-center">
            <div className="mb-4 text-5xl">🎁</div>
            <p className="text-sm font-bold">Пока нет активных объявлений</p>
            <p className="mt-2 text-xs leading-5 text-[#858078]">
              Здесь появятся уникальные подарки, которые пользователи выставят на продажу.
            </p>
            <Link
              href="/sell"
              className="mt-6 inline-block rounded-xl bg-[#c8a96e] px-5 py-3.5 text-[10px] font-black tracking-widest text-[#17130d]"
            >
              LIST YOUR GIFT ↗
            </Link>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {listings.slice(0, 4).map((listing, index) => (
              <Link
                href="/catalog"
                key={listing.id}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111214] transition hover:border-[#c8a96e]/40"
              >
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-[#25231e] to-[#101113] p-4">
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
                    <span className="absolute left-2 top-2 max-w-[85%] truncate rounded-md border border-[#c8a96e]/30 bg-black/60 px-2 py-1 text-[7px] font-bold tracking-wider text-[#d9c398]">
                      {listing.gift.collection}
                    </span>
                  )}

                  <span className="absolute bottom-2 right-2 text-[8px] font-bold tracking-widest text-white/30">
                    0{index + 1}
                  </span>
                </div>

                <div className="p-3">
                  <div className="truncate text-[13px] font-extrabold">
                    {listing.gift.name}
                  </div>

                  <div className="mt-1 truncate text-[8px] font-semibold tracking-[0.13em] text-[#77736b]">
                    {listing.gift.model || 'TELEGRAM GIFT'}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-1 border-t border-white/[0.07] pt-3">
                    <div>
                      <div className="text-[7px] font-bold tracking-widest text-[#77736b]">
                        PRICE
                      </div>
                      <div className="mt-1 text-[13px] font-black text-[#d7bd8b]">
                        {formatPrice(listing.priceTon)} TON
                      </div>
                    </div>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#c8a96e]/20 bg-[#c8a96e]/10 text-sm text-[#c8a96e] transition group-hover:bg-[#c8a96e] group-hover:text-[#17130d]">
                      ↗
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 pb-6 pt-10">
        <Link
          href="/sell"
          className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-[#c8a96e]/25 bg-gradient-to-r from-[#282319] to-[#141412] p-5 transition hover:border-[#c8a96e]/50"
        >
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#c8a96e]/10 blur-3xl" />

          <div className="relative">
            <div className="text-[8px] font-bold tracking-[0.22em] text-[#c8a96e]">
              GOT SOMETHING RARE?
            </div>
            <div className="mt-2 text-xl font-black tracking-[-0.04em]">
              Make it yours.
            </div>
            <div className="mt-1 text-[10px] text-[#aaa69d]">
              List your gift on RUM
            </div>
          </div>

          <span className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#c8a96e]/30 bg-[#c8a96e]/10 text-xl text-[#c8a96e] transition group-hover:bg-[#c8a96e] group-hover:text-[#17130d]">
            ↗
          </span>
        </Link>
      </section>

      <div className="px-5 pb-5 text-center">
        <span className="text-[8px] font-bold tracking-[0.3em] text-[#555149]">
          RUM — DIGITAL COLLECTIBLES
        </span>
      </div>

      <RumBottomNav />
    </main>
  )
}
