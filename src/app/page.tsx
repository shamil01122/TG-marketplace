
'use client'

import RumBottomNav from '@/components/rum/bottom-nav'
import Link from 'next/link'
import TelegramAuth from '@/components/telegram-auth'
import { useEffect, useState } from 'react'

type Listing = {
  id: string
  priceTon: string
  createdAt: string
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
    <main className="mx-auto min-h-screen max-w-[560px] overflow-hidden bg-[#080807] pb-28 text-[#F2F0E9]">
      <TelegramAuth />

      {/* Компактная шапка */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#25231D] bg-[#080807]/95 px-4 py-3 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-[25px] font-black leading-none tracking-[-0.09em] text-[#F4E9CC]">
            RUM<span className="text-[#D8B45A]">.</span>
          </span>
          <span className="rounded border border-[#D8B45A]/30 px-1.5 py-1 text-[7px] font-black tracking-widest text-[#D8B45A]">
            MARKET
          </span>
        </Link>

        <div className="flex items-center gap-2 rounded-lg border border-[#393323] bg-[#14130F] px-3 py-2">
          <span className="text-[9px] text-[#898579]">Баланс</span>
          <span className="text-xs font-black text-[#E7C875]">— TON</span>
        </div>
      </header>

      {/* Поиск */}
      <section className="px-3 pt-4">
        <Link
          href="/catalog"
          className="flex items-center gap-3 rounded-xl border border-[#39352A] bg-[#151511] px-4 py-3.5 no-underline transition hover:border-[#D8B45A]/60"
        >
          <span className="text-xl text-[#D8B45A]">⌕</span>
          <span className="flex-1 text-xs text-[#918B7D]">
            Поиск подарков и коллекций
          </span>
          <span className="text-lg text-[#D8B45A]">→</span>
        </Link>
      </section>

      {/* Быстрая навигация */}
      <section className="flex gap-2 overflow-x-auto px-3 pb-1 pt-3">
        <Link
          href="/catalog"
          className="shrink-0 rounded-lg border border-[#D8B45A] bg-[#D8B45A] px-4 py-2.5 text-[10px] font-black text-[#17140D] no-underline"
        >
          ◈ Все подарки
        </Link>

        <Link
          href="/catalog"
          className="shrink-0 rounded-lg border border-[#302D24] bg-[#151511] px-4 py-2.5 text-[10px] font-bold text-[#C0B69F] no-underline transition hover:border-[#D8B45A]/50"
        >
          Коллекции
        </Link>

        <Link
          href="/favorites"
          className="shrink-0 rounded-lg border border-[#302D24] bg-[#151511] px-4 py-2.5 text-[10px] font-bold text-[#C0B69F] no-underline transition hover:border-[#D8B45A]/50"
        >
          ♡ Избранное
        </Link>

        <Link
          href="/sell"
          className="shrink-0 rounded-lg border border-[#302D24] bg-[#151511] px-4 py-2.5 text-[10px] font-bold text-[#C0B69F] no-underline transition hover:border-[#D8B45A]/50"
        >
          + Продать
        </Link>
      </section>

      {/* Витрина подарков */}
      <section className="px-3 pt-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-[8px] font-black tracking-[0.2em] text-[#B99A50]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D8B45A]" />
              RUM MARKETPLACE
            </div>

            <h1 className="text-[25px] font-black tracking-[-0.065em]">
              Подарки<span className="text-[#D8B45A]">.</span>
            </h1>

            <p className="mt-1 text-[10px] text-[#858176]">
              Уникальные Telegram-подарки
            </p>
          </div>

          <Link
            href="/catalog"
            className="pb-1 text-[10px] font-bold text-[#D8B45A] no-underline"
          >
            Весь каталог →
          </Link>
        </div>

        {/* Загрузка */}
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-xl border border-[#302D24] bg-[#151511]"
              >
                <div className="aspect-square bg-white/[0.05]" />
                <div className="space-y-3 p-3">
                  <div className="h-3 w-3/4 rounded bg-white/[0.07]" />
                  <div className="h-3 w-1/2 rounded bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ошибка */}
        {!loading && error && (
          <div className="rounded-xl border border-[#393222] bg-[#151511] p-7 text-center">
            <div className="mb-3 text-3xl">⚠️</div>
            <p className="text-xs text-[#D0C9B8]">{error}</p>

            <button
              onClick={loadListings}
              className="mt-5 rounded-lg bg-[#D8B45A] px-5 py-3 text-[10px] font-black text-[#17140D]"
            >
              ПОВТОРИТЬ ЗАГРУЗКУ
            </button>
          </div>
        )}

        {/* Пустой каталог */}
        {!loading && !error && listings.length === 0 && (
          <div className="rounded-xl border border-[#302D24] bg-[#151511] p-8 text-center">
            <div className="mb-4 text-5xl">🎁</div>

            <p className="text-sm font-bold">
              Пока нет активных объявлений
            </p>

            <p className="mt-2 text-xs leading-5 text-[#85827A]">
              Здесь появятся подарки, которые пользователи выставят на продажу.
            </p>

            <Link
              href="/sell"
              className="mt-6 inline-block rounded-lg bg-[#D8B45A] px-5 py-3.5 text-[10px] font-black text-[#17140D] no-underline"
            >
              ВЫСТАВИТЬ ПОДАРОК ↗
            </Link>
          </div>
        )}

        {/* Карточки */}
        {!loading && !error && listings.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {listings.slice(0, 8).map((listing) => {
              const centerColor = getSafeColor(
                listing.gift.backdropCenterColor,
                '#29271F',
              )

              const edgeColor = getSafeColor(
                listing.gift.backdropEdgeColor,
                '#0D0D0B',
              )

              return (
                <Link
                  href={`/rum/gift/${listing.id}`}
                  key={listing.id}
                  className="group min-w-0 overflow-hidden rounded-xl border border-[#302D24] bg-[#151511] no-underline transition hover:border-[#D8B45A]/60"
                >
                  {/* Изображение */}
                  <div
                    className="relative flex aspect-square items-center justify-center overflow-hidden p-3"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${centerColor}, ${edgeColor})`,
                    }}
                  >
                    {listing.gift.imageUrl &&
                    !brokenImages.includes(listing.id) ? (
                      <img
                        src={listing.gift.imageUrl}
                        alt={listing.gift.name}
                        loading="lazy"
                        onError={() =>
                          setBrokenImages((prev) =>
                            prev.includes(listing.id)
                              ? prev
                              : [...prev, listing.id],
                          )
                        }
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-6xl">🎁</span>
                    )}

                    {listing.gift.collection && (
                      <span className="absolute bottom-2 left-2 max-w-[85%] truncate rounded-md border border-white/15 bg-black/60 px-2 py-1 text-[8px] font-bold text-white">
                        {listing.gift.collection}
                      </span>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="p-3">
                    <h2 className="truncate text-xs font-bold text-[#F2F0E9]">
                      {listing.gift.name}
                    </h2>

                    {listing.gift.model && (
                      <p className="mt-1 truncate text-[9px] text-[#85827A]">
                        {listing.gift.model}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-1 rounded-lg bg-[#24221C] px-2.5 py-2.5">
                      <span className="text-[8px] text-[#A9A18F]">◆</span>

                      <span className="truncate text-xs font-black text-[#E7C875]">
                        {formatPrice(listing.priceTon)} TON
                      </span>

                      <span className="text-xs text-[#D8B45A]">↗</span>
                    </div>

                    <p className="mt-2 truncate text-[8px] text-[#777267]">
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

        {/* Все объявления */}
        {!loading && !error && listings.length > 0 && (
          <Link
            href="/catalog"
            className="mt-5 flex items-center justify-center gap-3 rounded-xl border border-[#4B4027] bg-[#17150F] px-4 py-4 text-[10px] font-black tracking-widest text-[#D8B45A] no-underline transition hover:bg-[#211D12]"
          >
            ОТКРЫТЬ ВЕСЬ КАТАЛОГ
            <span className="text-base">→</span>
          </Link>
        )}
      </section>

      <RumBottomNav />
    </main>
  )
}
