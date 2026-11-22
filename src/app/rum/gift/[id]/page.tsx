
'use client'

import RumBottomNav from '@/components/rum/bottom-nav'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRumCart } from '@/lib/rum/cart'
import { useRumFavorites } from '@/lib/rum/favorites'

type Listing = {
  id: string
  priceTon: string
  createdAt: string
  gift: {
    id: string
    name: string
    collection: string
    number: number | null
    model: string
    modelRarity: string | null
    modelRarityPerMille: number | null
    backdrop: string
    backdropCenterColor: number | null
    backdropEdgeColor: number | null
    backdropSymbolColor: number | null
    backdropTextColor: number | null
    backdropRarityPerMille: number | null
    symbol: string
    symbolRarityPerMille: number | null
    imageUrl: string
  }
  seller: {
    username: string
    displayName: string
  }
}

type ReservationDeal = {
  id: string
  amountTon: string
  status: string
  expiresAt: string
}

const GOLD = '#D8B45A'

const panelStyle = {
  background: 'linear-gradient(145deg, #171611, #10100D)',
  border: '1px solid #302D24',
  borderRadius: 16,
} as const

function colorHex(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null
  return `#${(value >>> 0).toString(16).padStart(6, '0').slice(-6)}`
}

function rarityLabel(value: number | null) {
  if (value === null) return null

  return `${(value / 10).toLocaleString('ru-RU', {
    maximumFractionDigits: 1,
  })}%`
}

export default function RumGiftPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reserving, setReserving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reservationError, setReservationError] = useState('')
  const [reservationDeal, setReservationDeal] =
    useState<ReservationDeal | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)

  const favorites = useRumFavorites((state) => state.items)
  const toggleFavorite = useRumFavorites((state) => state.toggleFavorite)
  const addGift = useRumCart((state) => state.addGift)

  const isFavorite = favorites.some((item) => item.listingId === id)

  useEffect(() => {
    let cancelled = false

    async function loadListing() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch('/api/rum/listings', {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Не удалось загрузить объявление')
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Сервер вернул неверный формат данных')
        }

        const found = data.find((item: Listing) => item.id === id)

        if (!cancelled) {
          if (found) {
            setListing(found)
          } else {
            setError('Это объявление больше не найдено или неактивно.')
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Ошибка загрузки подарка',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadListing()

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!reservationDeal?.expiresAt) {
      setRemainingSeconds(null)
      return
    }

    const updateTimer = () => {
      const difference =
        new Date(reservationDeal.expiresAt).getTime() - Date.now()

      setRemainingSeconds(Math.max(0, Math.ceil(difference / 1000)))
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [reservationDeal])

  const formatPrice = (price: string) =>
    Number(price).toLocaleString('ru-RU', {
      maximumFractionDigits: 4,
    })

  const handleReserve = async () => {
    if (!listing || reserving || cancelling || reservationDeal) return

    try {
      setReserving(true)
      setReservationError('')

      const response = await fetch('/api/rum/deals/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Не удалось зарезервировать подарок')
      }

      if (!data?.deal?.id || !data?.deal?.expiresAt) {
        throw new Error('Сервер вернул некорректный ответ')
      }

      setReservationDeal(data.deal)
    } catch (err) {
      setReservationError(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при резервировании',
      )
    } finally {
      setReserving(false)
    }
  }

  const handleCancelReservation = async () => {
    if (!reservationDeal || cancelling || reserving) return

    const confirmed = window.confirm(
      'Отменить резерв? Подарок снова станет доступен другим покупателям.',
    )

    if (!confirmed) return

    try {
      setCancelling(true)
      setReservationError('')

      const response = await fetch('/api/rum/deals/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId: reservationDeal.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Не удалось отменить резерв')
      }

      setReservationDeal(null)
      setRemainingSeconds(null)
      setReservationError('')

      router.push('/catalog')
      router.refresh()
    } catch (err) {
      setReservationError(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при отмене резерва',
      )
    } finally {
      setCancelling(false)
    }
  }

  const handleAddToCart = () => {
    if (!listing) return

    addGift({
      listingId: listing.id,
      name: listing.gift.name,
      priceTon: Number(listing.priceTon),
      imageUrl: listing.gift.imageUrl,
      collection: listing.gift.collection,
      model: listing.gift.model,
    })

    router.push('/rum-cart')
  }

  const formatRemainingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remaining = seconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
  }

  const gift = listing?.gift
  const centerColor = colorHex(gift?.backdropCenterColor ?? null)
  const edgeColor = colorHex(gift?.backdropEdgeColor ?? null)
  const textColor = colorHex(gift?.backdropTextColor ?? null)

  const giftBackground =
    centerColor && edgeColor
      ? `radial-gradient(circle at 50% 42%, ${centerColor} 0%, ${edgeColor} 100%)`
      : 'radial-gradient(circle, #29271F 0%, #15140F 62%, #090908 100%)'

  const infoRow = (
    label: string,
    value: string | number | null | undefined,
    last = false,
  ) => {
    if (value === null || value === undefined || value === '') return null

    return (
      <div
        className="flex min-w-0 items-center justify-between gap-4 py-2"
        style={{
          borderBottom: last ? 'none' : '1px solid #29271F',
          fontSize: 12,
        }}
      >
        <span className="min-w-0 text-[#898579]">{label}</span>
        <strong className="min-w-0 break-words text-right font-semibold text-[#EAE5D9]">
          {value}
        </strong>
      </div>
    )
  }

  return (
    <main
      className="min-h-screen w-full overflow-x-clip bg-[#080807] pb-36 pt-3 text-[#F2F0E9]"
      style={{ paddingLeft: 16, paddingRight: 16, boxSizing: 'border-box' }}
    >
      <style jsx>{`
        .gold-button {
          transition: background 160ms ease, transform 160ms ease;
        }
        .gold-button:active {
          transform: scale(0.985);
        }
        .favorite-button {
          transition: transform 160ms ease, background 160ms ease;
        }
        .favorite-button:active {
          transform: scale(0.92);
        }
        @media (hover: hover) {
          .gold-button:hover {
            background: #E7C875 !important;
          }
          .favorite-button:hover {
            transform: scale(1.06);
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[560px] min-w-0">
        <header className="mb-4 flex min-w-0 items-center justify-between gap-2">
          <button
            onClick={() => router.back()}
            className="shrink-0 rounded-xl border border-[#39352A] bg-[#14130F] px-4 py-3 text-xs font-bold text-[#D8D1C1] transition hover:border-[#D8B45A]/50"
          >
            ← Назад
          </button>

          <a
            href="/"
            className="shrink-0 text-[27px] font-black tracking-[-0.08em] text-[#F4E9CC] no-underline"
          >
            RUM<span style={{ color: GOLD }}>.</span>
          </a>

          <button
            onClick={() => router.push('/rum-cart')}
            className="shrink-0 rounded-xl border border-[#39352A] bg-[#14130F] px-3 py-3 text-xs font-bold text-[#D8D1C1] transition hover:border-[#D8B45A]/50"
          >
            🛒 Корзина
          </button>
        </header>

        {loading ? (
          <section
            style={panelStyle}
            className="animate-pulse p-10 text-center"
          >
            <div className="mx-auto mb-4 aspect-square max-w-[220px] rounded-2xl bg-white/[0.05]" />
            <div className="mx-auto h-4 w-1/2 rounded bg-white/[0.06]" />
            <p className="mt-5 text-xs text-[#898579]">Загружаем подарок…</p>
          </section>
        ) : error || !listing ? (
          <section style={panelStyle} className="px-6 py-12 text-center">
            <div className="mb-5 text-5xl">⌕</div>
            <h1 className="text-xl font-black">Подарок не найден</h1>
            <p className="mx-auto mt-3 max-w-[290px] text-xs leading-6 text-[#999589]">
              {error || 'Объявление больше недоступно.'}
            </p>
            <button
              onClick={() => router.push('/catalog')}
              className="gold-button mt-7 rounded-xl bg-[#D8B45A] px-6 py-4 text-xs font-black tracking-wider text-[#17140D]"
            >
              ВЕРНУТЬСЯ В КАТАЛОГ
            </button>
          </section>
        ) : (
          <>
            <div
              className="mb-4 w-full min-w-0 overflow-hidden rounded-2xl border border-[#393222] shadow-2xl"
              style={{ background: '#11110E' }}
            >
              <div
                className="relative flex aspect-square max-h-[360px] min-h-[210px] w-full items-center justify-center overflow-hidden"
                style={{ background: giftBackground }}
              >
                <div
                  className="pointer-events-none absolute h-3/4 w-3/4 rounded-full blur-[65px]"
                  style={{
                    background: textColor || '#FFFFFF',
                    opacity: 0.1,
                  }}
                />

                {textColor && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ border: `1px solid ${textColor}33` }}
                  />
                )}

                {listing.gift.imageUrl ? (
                  <img
                    src={listing.gift.imageUrl}
                    alt={listing.gift.name}
                    className="relative z-10 block h-full w-full object-contain drop-shadow-2xl"
                  />
                ) : (
                  <span className="relative z-10 text-8xl">🎁</span>
                )}

                {listing.gift.number !== null && (
                  <span className="absolute bottom-4 right-4 z-20 rounded-full border border-white/20 bg-black/50 px-3 py-2 text-xs font-black text-white">
                    #{listing.gift.number}
                  </span>
                )}

                <span className="absolute left-4 top-4 z-20 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[8px] font-black tracking-[0.18em] text-white/80">
                  TELEGRAM UNIQUE GIFT
                </span>
              </div>

              <div className="flex min-w-0 items-center justify-between gap-3 border-t border-[#302D24] px-4 py-2">
                <div className="min-w-0">
                  <p className="text-[9px] font-black tracking-[0.17em] text-[#D8B45A]">
                    DIGITAL COLLECTIBLE
                  </p>
                  <p className="mt-1 text-[10px] text-[#858176]">
                    Уникальный Telegram-подарок
                  </p>
                </div>

                <button
                  className="favorite-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#403A2B] bg-[#1A1914] text-2xl"
                  onClick={() => toggleFavorite(listing.id)}
                  style={{ color: isFavorite ? GOLD : '#AAA69B' }}
                  aria-label={
                    isFavorite
                      ? 'Убрать из избранного'
                      : 'Добавить в избранное'
                  }
                >
                  {isFavorite ? '♥' : '♡'}
                </button>
              </div>
            </div>

            <section className="mb-4 min-w-0">
              <div className="mb-2 inline-flex max-w-full items-center rounded-lg border border-[#5A4824] bg-[#211C10] px-3 py-2 text-[9px] font-black tracking-[0.13em] text-[#D8B45A]">
                <span className="truncate">
                  {listing.gift.collection || 'TELEGRAM COLLECTION'}
                </span>
              </div>

              <h1 className="break-words text-[25px] font-black leading-[1.1] tracking-[-0.065em]">
                {listing.gift.name}
                <span style={{ color: GOLD }}>.</span>
              </h1>

              <p className="mt-1 break-words text-xs text-[#999589]">
                {listing.gift.model || 'Модель не указана'}
              </p>

              {listing.gift.number !== null && (
                <p className="mt-2 text-[9px] font-bold tracking-widest text-[#777267]">
                  UNIQUE NUMBER #{listing.gift.number}
                </p>
              )}
            </section>

            <section
              style={panelStyle}
              className="relative mb-3 min-w-0 overflow-hidden p-4"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#D8B45A]/[0.07] blur-3xl" />

              <p className="relative text-[9px] font-black tracking-[0.2em] text-[#898579]">
                ЦЕНА ПРОДАВЦА
              </p>

              <div className="relative mt-1 flex items-baseline gap-2">
                <span className="text-[29px] font-black tracking-[-0.06em] text-[#E7C875]">
                  {formatPrice(listing.priceTon)}
                </span>
                <span className="text-lg font-bold text-[#D8B45A]">TON</span>
              </div>

              <p className="relative mt-1 text-[10px] text-[#777267]">
                Цена указана продавцом
              </p>
            </section>

            <section style={panelStyle} className="mb-3 min-w-0 px-4 pb-1">
              <div className="border-b border-[#302D24] py-3">
                <h2 className="text-[10px] font-black tracking-[0.18em] text-[#D8B45A]">
                  ХАРАКТЕРИСТИКИ NFT
                </h2>
              </div>

              {infoRow('Коллекция', listing.gift.collection)}
              {infoRow(
                'Номер подарка',
                listing.gift.number !== null
                  ? `#${listing.gift.number}`
                  : null,
              )}
              {infoRow('Модель', listing.gift.model)}
              {infoRow(
                'Редкость модели',
                rarityLabel(listing.gift.modelRarityPerMille),
              )}
              {infoRow('Символ', listing.gift.symbol)}
              {infoRow(
                'Редкость символа',
                rarityLabel(listing.gift.symbolRarityPerMille),
              )}
              {infoRow('Фон', listing.gift.backdrop)}
              {infoRow(
                'Редкость фона',
                rarityLabel(listing.gift.backdropRarityPerMille),
                true,
              )}
            </section>

            <section style={panelStyle} className="mb-3 min-w-0 px-4 pb-1">
              <div className="border-b border-[#302D24] py-3">
                <h2 className="text-[10px] font-black tracking-[0.18em] text-[#D8B45A]">
                  ПРОДАВЕЦ
                </h2>
              </div>

              {infoRow(
                'Имя',
                listing.seller.displayName ||
                  (listing.seller.username
                    ? `@${listing.seller.username}`
                    : 'Не указан'),
                true,
              )}
            </section>

            <section className="mb-4 min-w-0 rounded-2xl border border-[#5A4824]/70 bg-[#17140D] p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[#D8B45A]">ⓘ</span>
                <h2 className="text-[10px] font-black tracking-[0.14em] text-[#D8C58F]">
                  ИНФОРМАЦИЯ О ПОКУПКЕ
                </h2>
              </div>

              <p className="text-[10px] leading-5 text-[#AAA18D]">
                Резервирование временно удерживает объявление за вами на 15
                минут. TON-оплата и автоматическая передача Telegram-подарка
                ещё не подключены. Не отправляйте продавцу оплату вне RUM.
              </p>
            </section>

            {reservationError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-900/70 bg-red-950/30 p-4 text-xs leading-6 text-red-200"
              >
                {reservationError}
              </div>
            )}

            {reservationDeal && (
              <section
                style={panelStyle}
                className="mb-4 border-[#6B5629] p-4 text-center"
              >
                <div className="mb-2 text-3xl text-[#D8B45A]">✓</div>

                <h2 className="text-lg font-black">
                  Подарок зарезервирован
                </h2>

                {remainingSeconds !== null && remainingSeconds > 0 ? (
                  <>
                    <div className="my-3 text-[32px] font-black tabular-nums tracking-widest text-[#E7C875]">
                      {formatRemainingTime(remainingSeconds)}
                    </div>
                    <p className="text-[11px] leading-6 text-[#999589]">
                      Осталось времени резерва. Оплата и передача NFT пока не
                      подключены.
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-xs leading-6 text-[#E7C875]">
                    Время резерва истекло. Вы можете отменить его или обновить
                    страницу, чтобы проверить доступность объявления.
                  </p>
                )}

                <button
                  onClick={handleCancelReservation}
                  disabled={cancelling || reserving}
                  className="mt-3 w-full rounded-xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-[11px] font-black text-red-200 transition hover:bg-red-950/60 disabled:opacity-50"
                >
                  {cancelling ? 'Отменяем резерв…' : 'Отменить резерв'}
                </button>
              </section>
            )}
          </>
        )}
      </div>

      {!loading && listing && (
        <div
          className="fixed bottom-[60px] z-40 border-t border-[#393222] bg-[#0D0D0B]/[0.97] px-3 pb-2 pt-2 shadow-[0_-12px_35px_#00000066] backdrop-blur-xl"
          style={{
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <div className="mx-auto flex w-full max-w-[560px] min-w-0 items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-bold tracking-[0.15em] text-[#898579]">
                ЦЕНА
              </p>
              <p className="mt-1 truncate text-lg font-black text-[#E7C875]">
                {formatPrice(listing.priceTon)}{' '}
                <span className="text-xs text-[#D8B45A]">TON</span>
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              className="shrink-0 rounded-lg border border-[#4A412C] bg-[#191710] px-3 py-3 text-[9px] font-black tracking-wider text-[#D8C58F] transition hover:border-[#D8B45A]"
            >
              В КОРЗИНУ
            </button>

            {!reservationDeal && (
              <button
                onClick={handleReserve}
                disabled={reserving || cancelling}
                className="gold-button min-w-0 flex-1 rounded-lg bg-[#D8B45A] px-3 py-3 text-[9px] font-black tracking-wider text-[#17140D] disabled:opacity-60"
              >
                {reserving ? 'ОФОРМЛЯЕМ…' : 'КУПИТЬ'}
              </button>
            )}

            {reservationDeal && (
              <div className="shrink-0 rounded-lg border border-[#6B5629] bg-[#211C10] px-3 py-3 text-center text-[9px] font-black text-[#E7C875]">
                РЕЗЕРВ АКТИВЕН
              </div>
            )}
          </div>
        </div>
      )}

      <RumBottomNav />
    </main>
  )
}
