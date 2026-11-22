
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
    number: number | null
    model: string
    modelRarity: string | null
    modelRarityPerMille: number | null
    symbol: string
    symbolRarityPerMille: number | null
    imageUrl: string
    modelThumbnailFileId: string | null
    symbolThumbnailFileId: string | null
    backdropCenterColor: number | string | null
    backdropEdgeColor: number | string | null
    backdropSymbolColor: number | string | null
    backdropTextColor: number | string | null
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

function getTelegramFileUrl(fileId: string | null | undefined) {
  if (!fileId) return ''
  return `/api/rum/telegram-file?file_id=${encodeURIComponent(fileId)}`
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

      <style jsx>{`
        .market-link {
          transition: border-color 160ms ease, background 160ms ease,
            transform 160ms ease;
        }

        .market-link:active,
        .gift-card:active {
          transform: scale(0.985);
        }

        .gift-card {
          transition: border-color 180ms ease, transform 180ms ease;
        }

        @media (hover: hover) {
          .gift-card:hover {
            border-color: #806832;
            transform: translateY(-2px);
          }

          .gift-card:hover .gift-image {
            transform: scale(1.045);
          }
        }

        .gift-image {
          transition: transform 300ms ease;
        }

        .gift-pattern {
          background-repeat: repeat;
          background-size: 48px 48px;
          background-position: center;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 15%,
            black 85%,
            transparent
          );
        }
      `}</style>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#29261E] bg-[#080807]/95 px-4 py-3 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-[27px] font-black leading-none tracking-[-0.09em] text-[#F4E9CC]">
            RUM<span className="text-[#D8B45A]">.</span>
          </span>

          <span className="rounded border border-[#665329]/70 bg-[#211C10] px-1.5 py-1 text-[7px] font-black tracking-widest text-[#D8B45A]">
            MARKET
          </span>
        </Link>

        <Link
          href="/profile"
          className="market-link flex items-center gap-3 rounded-xl border border-[#393323] bg-[#14130F] px-3 py-2 no-underline"
        >
          <span className="text-[9px] text-[#918B7D]">Баланс</span>
          <span className="text-xs font-black text-[#E7C875]">— TON</span>
          <span className="text-[#777267]">›</span>
        </Link>
      </header>

      <section className="px-3 pt-4">
        <Link
          href="/catalog"
          className="market-link flex items-center gap-3 rounded-xl border border-[#39352A] bg-[#151511] px-4 py-4 no-underline"
        >
          <span className="text-xl text-[#D8B45A]">⌕</span>
          <span className="flex-1 text-xs text-[#918B7D]">
            Поиск подарков и коллекций
          </span>
          <span className="text-lg text-[#D8B45A]">→</span>
        </Link>
      </section>

      <section className="flex gap-2 overflow-x-auto px-3 pb-1 pt-3">
        <Link
          href="/catalog"
          className="shrink-0 rounded-lg border border-[#D8B45A] bg-[#D8B45A] px-4 py-3 text-[10px] font-black text-[#17140D] no-underline"
        >
          ◈ Все подарки
        </Link>

        <Link
          href="/catalog"
          className="market-link shrink-0 rounded-lg border border-[#302D24] bg-[#151511] px-4 py-3 text-[10px] font-bold text-[#C0B69F] no-underline"
        >
          Коллекции
        </Link>

        <Link
          href="/favorites"
          className="market-link shrink-0 rounded-lg border border-[#302D24] bg-[#151511] px-4 py-3 text-[10px] font-bold text-[#C0B69F] no-underline"
        >
          ♡ Избранное
        </Link>

        <Link
          href="/sell"
          className="market-link shrink-0 rounded-lg border border-[#302D24] bg-[#151511] px-4 py-3 text-[10px] font-bold text-[#C0B69F] no-underline"
        >
          + Продать
        </Link>
      </section>

      <section className="px-3 pt-7">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[8px] font-black tracking-[0.22em] text-[#B99A50]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D8B45A]" />
              RUM MARKETPLACE
            </div>

            <h1 className="text-[29px] font-black leading-none tracking-[-0.075em]">
              Подарки<span className="text-[#D8B45A]">.</span>
            </h1>

            <p className="mt-2 text-[10px] text-[#858176]">
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

        {!loading && !error && listings.length > 0 && (
          <div className="mb-3 flex items-center justify-between border-y border-[#24221C] py-2.5">
            <span className="text-[9px] font-bold tracking-[0.13em] text-[#858176]">
              ДОСТУПНЫЕ ПРЕДЛОЖЕНИЯ
            </span>

            <span className="text-[10px] font-black tabular-nums text-[#D8B45A]">
              {listings.length}
            </span>
          </div>
        )}

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
                  <div className="h-9 rounded-lg bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        )}

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

        {!loading && !error && listings.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {listings.slice(0, 8).map((listing) => {
              const gift = listing.gift

              const centerColor = getSafeColor(
                gift.backdropCenterColor,
                '#29271F',
              )

              const edgeColor = getSafeColor(
                gift.backdropEdgeColor,
                '#0D0D0B',
              )

              const symbolColor = getSafeColor(
                gift.backdropSymbolColor,
                '#FFFFFF',
              )

              const textColor = getSafeColor(
                gift.backdropTextColor,
                '#FFFFFF',
              )

              const modelUrl =
                getTelegramFileUrl(gift.modelThumbnailFileId) ||
                gift.imageUrl

              const symbolUrl = getTelegramFileUrl(
                gift.symbolThumbnailFileId,
              )

              const sellerName =
                listing.seller.displayName ||
                (listing.seller.username
                  ? '@' + listing.seller.username
                  : 'RUM seller')

              return (
                <Link
                  href={`/rum/gift/${listing.id}`}
                  key={listing.id}
                  className="gift-card group min-w-0 overflow-hidden rounded-xl border border-[#302D24] bg-[#13130F] no-underline"
                >
                  <div
                    className="relative flex aspect-square items-center justify-center overflow-hidden p-3"
                    style={{
                      backgroundImage: `linear-gradient(145deg, ${centerColor}, ${edgeColor})`,
                    }}
                  >
                    {symbolUrl && (
                      <div
                        aria-hidden="true"
                        className="gift-pattern pointer-events-none absolute inset-0 opacity-[0.22]"
                        style={{
                          backgroundImage: `url("${symbolUrl}")`,
                        }}
                      />
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/[0.08]" />

                    <div
                      className="pointer-events-none absolute inset-3 rounded-xl border"
                      style={{
                        borderColor: `${textColor}35`,
                      }}
                    />

                    {modelUrl && !brokenImages.includes(listing.id) ? (
                      <img
                        src={modelUrl}
                        alt={gift.name}
                        loading="lazy"
                        onError={() =>
                          setBrokenImages((prev) =>
                            prev.includes(listing.id)
                              ? prev
                              : [...prev, listing.id],
                          )
                        }
                        className="gift-image relative z-10 h-full w-full object-contain drop-shadow-2xl"
                      />
                    ) : (
                      <span className="relative z-10 text-6xl">🎁</span>
                    )}

                    <span className="absolute left-2 top-2 z-20 rounded-md border border-white/20 bg-black/45 px-2 py-1 text-[7px] font-black tracking-wider text-white/90">
                      UNIQUE
                    </span>

                    {gift.number != null && (
                      <span className="absolute right-2 top-2 z-20 rounded-md border border-white/20 bg-black/45 px-2 py-1 text-[8px] font-bold text-white">
                        #{gift.number}
                      </span>
                    )}

                    {gift.collection && (
                      <span className="absolute bottom-2 left-2 z-20 max-w-[85%] truncate rounded-md border border-white/15 bg-black/65 px-2 py-1 text-[8px] font-bold text-white">
                        {gift.collection}
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h2 className="truncate text-[12px] font-black tracking-[-0.02em] text-[#F2F0E9]">
                      {gift.name}
                    </h2>

                    <p className="mt-1 min-h-[13px] truncate text-[9px] text-[#85827A]">
                      {gift.model || 'Telegram collectible'}
                    </p>

                    {gift.symbol && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: symbolColor }}
                        />
                        <span className="truncate text-[8px] text-[#B9AD91]">
                          {gift.symbol}
                        </span>
                      </div>
                    )}

                    <div className="mt-3 rounded-lg border border-[#393323] bg-[#211F18] px-2.5 py-2.5">
                      <p className="mb-1 text-[7px] font-bold tracking-[0.15em] text-[#898579]">
                        ЦЕНА
                      </p>

                      <div className="flex items-baseline justify-between gap-1">
                        <span className="truncate text-[14px] font-black tracking-[-0.04em] text-[#E7C875]">
                          {formatPrice(listing.priceTon)}
                        </span>

                        <span className="shrink-0 text-[9px] font-black text-[#D8B45A]">
                          TON
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="truncate text-[8px] text-[#777267]">
                        {sellerName}
                      </span>

                      <span className="shrink-0 text-[10px] text-[#D8B45A]">
                        ↗
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <Link
            href="/catalog"
            className="market-link mt-5 flex items-center justify-center gap-3 rounded-xl border border-[#554526] bg-[#19160F] px-4 py-4 text-[10px] font-black tracking-[0.15em] text-[#D8B45A] no-underline"
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
