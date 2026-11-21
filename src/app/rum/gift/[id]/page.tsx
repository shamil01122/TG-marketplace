
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

const panelStyle = {
  background: 'linear-gradient(145deg, #151515, #0c0c0c)',
  border: '1px solid #292929',
  borderRadius: 20,
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
  const [reservationDeal, setReservationDeal] = useState<ReservationDeal | null>(null)
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
      const difference = new Date(reservationDeal.expiresAt).getTime() - Date.now()
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

  const gift = listing?.gift
  const centerColor = colorHex(gift?.backdropCenterColor ?? null)
  const edgeColor = colorHex(gift?.backdropEdgeColor ?? null)
  const textColor = colorHex(gift?.backdropTextColor ?? null)

  const giftBackground = centerColor && edgeColor
    ? `radial-gradient(circle at 50% 42%, ${centerColor} 0%, ${edgeColor} 100%)`
    : 'radial-gradient(circle, #292929 0%, #151515 62%, #080808 100%)'

  const formatRemainingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remaining = seconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
  }

  const infoRow = (
    label: string,
    value: string | number | null | undefined,
    last = false,
  ) => {
    if (value === null || value === undefined || value === '') return null

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
          padding: '13px 0',
          borderBottom: last ? 'none' : '1px solid #252525',
          fontSize: 12,
        }}
      >
        <span style={{ color: '#888888' }}>{label}</span>
        <strong style={{ textAlign: 'right', color: '#eeeeee', fontWeight: 750 }}>
          {value}
        </strong>
      </div>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050505',
        color: '#f5f5f5',
        padding: '20px 16px 120px',
      }}
    >
      <style jsx>{`
        .action-button {
          transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
        }
        .action-button:active {
          transform: scale(0.98);
        }
        .favorite-button {
          transition: transform 160ms ease, background 160ms ease;
        }
        .favorite-button:active {
          transform: scale(0.92);
        }
        .buy-button {
          transition: opacity 160ms ease, transform 160ms ease;
        }
        .buy-button:active {
          transform: scale(0.985);
        }
        .reserve-button {
          transition: opacity 160ms ease, transform 160ms ease;
        }
        .reserve-button:active {
          transform: scale(0.985);
        }
        @media (hover: hover) {
          .action-button:hover {
            background: #252525 !important;
            border-color: #555 !important;
          }
          .favorite-button:hover {
            transform: scale(1.06);
            background: #303030 !important;
          }
          .buy-button:hover,
          .reserve-button:hover {
            opacity: 0.88;
          }
        }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <button
            className="action-button"
            onClick={() => router.back()}
            style={{
              border: '1px solid #303030',
              background: '#151515',
              color: '#ffffff',
              borderRadius: 30,
              padding: '10px 15px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ← Назад
          </button>

          <a
            href="/"
            style={{
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: 25,
              fontWeight: 950,
              letterSpacing: 3,
            }}
          >
            RUM
          </a>

          <button
            className="action-button"
            onClick={() => router.push('/rum-cart')}
            style={{
              border: '1px solid #303030',
              background: '#151515',
              color: '#ffffff',
              borderRadius: 30,
              padding: '10px 13px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🛒 Корзина
          </button>
        </header>

        {loading ? (
          <section
            style={{
              ...panelStyle,
              padding: 45,
              textAlign: 'center',
              color: '#999999',
              fontSize: 13,
            }}
          >
            Загружаем подарок…
          </section>
        ) : error || !listing ? (
          <section
            style={{
              ...panelStyle,
              padding: 35,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 38, marginBottom: 15 }}>⌕</div>
            <h1 style={{ fontSize: 19, margin: '0 0 10px' }}>
              Подарок не найден
            </h1>
            <p
              style={{
                color: '#999999',
                fontSize: 12,
                lineHeight: 1.7,
                margin: '0 0 20px',
              }}
            >
              {error || 'Объявление больше недоступно.'}
            </p>
            <button
              onClick={() => router.push('/catalog')}
              style={{
                border: 0,
                borderRadius: 12,
                background: '#ffffff',
                color: '#000000',
                padding: '13px 20px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Вернуться в каталог
            </button>
          </section>
        ) : (
          <>
            <div
              style={{
                ...panelStyle,
                overflow: 'hidden',
                marginBottom: 23,
                boxShadow: '0 18px 55px #00000080',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 350,
                  maxHeight: '82vw',
                  minHeight: 245,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 28,
                  boxSizing: 'border-box',
                  background: giftBackground,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    width: '75%',
                    height: '75%',
                    borderRadius: '50%',
                    background: textColor || '#ffffff',
                    opacity: 0.08,
                    filter: 'blur(65px)',
                  }}
                />

                {textColor && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      border: `1px solid ${textColor}33`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {listing.gift.imageUrl ? (
                  <img
                    src={listing.gift.imageUrl}
                    alt={listing.gift.name}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'block',
                      width: '90%',
                      height: '90%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 16px 22px #00000055)',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 90 }}>🎁</span>
                )}

                {listing.gift.number !== null && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 15,
                      right: 15,
                      zIndex: 2,
                      color: textColor || '#ffffff',
                      fontSize: 11,
                      fontWeight: 900,
                      background: '#00000066',
                      border: '1px solid #ffffff22',
                      padding: '7px 11px',
                      borderRadius: 20,
                    }}
                  >
                    #{listing.gift.number}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  padding: '13px 17px',
                  borderTop: '1px solid #292929',
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#eeeeee',
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: 1.5,
                    }}
                  >
                    UNIQUE TELEGRAM GIFT
                  </div>
                  <div style={{ color: '#777777', fontSize: 10, marginTop: 4 }}>
                    Коллекционный цифровой подарок
                  </div>
                </div>

                <button
                  className="favorite-button"
                  onClick={() => toggleFavorite(listing.id)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 50,
                    border: '1px solid #383838',
                    background: '#202020',
                    color: isFavorite ? '#ffffff' : '#cccccc',
                    fontSize: 21,
                    cursor: 'pointer',
                  }}
                  aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                >
                  {isFavorite ? '♥' : '♡'}
                </button>
              </div>
            </div>

            <section style={{ marginBottom: 22 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '7px 10px',
                  border: '1px solid #303030',
                  borderRadius: 30,
                  color: '#aaaaaa',
                  fontSize: 9,
                  fontWeight: 850,
                  letterSpacing: 1.3,
                  marginBottom: 13,
                  background: '#111111',
                }}
              >
                {listing.gift.collection || 'TELEGRAM COLLECTION'}
              </div>

              <h1
                style={{
                  fontSize: 31,
                  lineHeight: 1.12,
                  fontWeight: 950,
                  letterSpacing: -1.1,
                  margin: '0 0 9px',
                }}
              >
                {listing.gift.name}
              </h1>

              <p
                style={{
                  color: '#999999',
                  fontSize: 13,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {listing.gift.model || 'Модель не указана'}
              </p>
            </section>

            <section
              style={{
                ...panelStyle,
                padding: 20,
                marginBottom: 15,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: -30,
                  top: -45,
                  width: 130,
                  height: 130,
                  borderRadius: '50%',
                  background: '#ffffff',
                  opacity: 0.035,
                  filter: 'blur(30px)',
                }}
              />
              <div
                style={{
                  color: '#888888',
                  fontSize: 10,
                  fontWeight: 850,
                  letterSpacing: 1.5,
                  marginBottom: 10,
                }}
              >
                ЦЕНА ПРОДАВЦА
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 950,
                  letterSpacing: -1,
                }}
              >
                {formatPrice(listing.priceTon)} <span style={{ fontSize: 19 }}>TON</span>
              </div>
              <div style={{ color: '#777777', fontSize: 10, marginTop: 7 }}>
                Цена указана продавцом
              </div>
            </section>

            <section
              style={{
                ...panelStyle,
                padding: '7px 18px',
                marginBottom: 15,
              }}
            >
              <div
                style={{
                  color: '#888888',
                  fontSize: 10,
                  fontWeight: 850,
                  letterSpacing: 1.5,
                  padding: '13px 0 3px',
                }}
              >
                ХАРАКТЕРИСТИКИ NFT
              </div>

              {infoRow('Коллекция', listing.gift.collection)}
              {infoRow('Номер подарка', listing.gift.number !== null ? `#${listing.gift.number}` : null)}
              {infoRow('Модель', listing.gift.model)}
              {infoRow('Редкость модели', rarityLabel(listing.gift.modelRarityPerMille))}
              {infoRow('Символ', listing.gift.symbol)}
              {infoRow('Редкость символа', rarityLabel(listing.gift.symbolRarityPerMille))}
              {infoRow('Фон', listing.gift.backdrop)}
              {infoRow('Редкость фона', rarityLabel(listing.gift.backdropRarityPerMille), true)}
            </section>

            <section
              style={{
                ...panelStyle,
                padding: '7px 18px',
                marginBottom: 15,
              }}
            >
              <div
                style={{
                  color: '#888888',
                  fontSize: 10,
                  fontWeight: 850,
                  letterSpacing: 1.5,
                  padding: '13px 0 3px',
                }}
              >
                ПРОДАВЕЦ
              </div>

              {infoRow(
                'Имя',
                listing.seller.displayName ||
                  (listing.seller.username ? `@${listing.seller.username}` : 'Не указан'),
                true,
              )}
            </section>

            <section
              style={{
                ...panelStyle,
                padding: 17,
                marginBottom: 17,
                borderColor: '#343434',
              }}
            >
              <div
                style={{
                  color: '#bbbbbb',
                  fontSize: 10,
                  fontWeight: 850,
                  letterSpacing: 1.3,
                  marginBottom: 9,
                }}
              >
                ИНФОРМАЦИЯ О ПОКУПКЕ
              </div>
              <p
                style={{
                  color: '#999999',
                  fontSize: 11,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                Резервирование временно удерживает объявление за вами на 15 минут.
                TON-оплата и автоматическая передача Telegram-подарка ещё не подключены.
                Не отправляйте продавцу оплату вне RUM.
              </p>
            </section>

            {reservationError && (
              <div
                role="alert"
                style={{
                  padding: 14,
                  marginBottom: 13,
                  border: '1px solid #713838',
                  borderRadius: 12,
                  background: '#241010',
                  color: '#ffaaaa',
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                {reservationError}
              </div>
            )}

            {reservationDeal ? (
              <section
                style={{
                  ...panelStyle,
                  padding: 20,
                  marginBottom: 15,
                  borderColor: '#555555',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 25, marginBottom: 10 }}>✓</div>
                <h2 style={{ fontSize: 17, margin: '0 0 8px' }}>
                  Подарок зарезервирован
                </h2>
                {remainingSeconds !== null && remainingSeconds > 0 ? (
                  <>
                    <div
                      style={{
                        fontSize: 34,
                        fontWeight: 950,
                        letterSpacing: 2,
                        margin: '12px 0',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatRemainingTime(remainingSeconds)}
                    </div>
                    <p style={{ color: '#999999', fontSize: 11, lineHeight: 1.6, margin: 0 }}>
                      Осталось времени резерва. Оплата и передача NFT пока не подключены.
                    </p>
                  </>
                ) : (
                  <p style={{ color: '#ffcc88', fontSize: 11, lineHeight: 1.6, margin: 0 }}>
                    Время резерва истекло. Вы можете отменить его или обновить страницу, чтобы проверить доступность объявления.
                  </p>
                )}

                <button
                  className="reserve-button"
                  onClick={handleCancelReservation}
                  disabled={cancelling || reserving}
                  style={{
                    width: '100%',
                    padding: 15,
                    marginTop: 18,
                    border: '1px solid #713838',
                    borderRadius: 13,
                    background: cancelling ? '#442222' : '#241010',
                    color: '#ffaaaa',
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: cancelling ? 'wait' : 'pointer',
                    opacity: cancelling ? 0.7 : 1,
                  }}
                >
                  {cancelling ? 'Отменяем резерв…' : 'Отменить резерв'}
                </button>
              </section>
            ) : (
              <button
                className="reserve-button"
                onClick={handleReserve}
                disabled={reserving || cancelling}
                style={{
                  width: '100%',
                  padding: 18,
                  marginBottom: 12,
                  border: '1px solid #ffffff',
                  borderRadius: 15,
                  background: reserving ? '#777777' : '#ffffff',
                  color: '#000000',
                  fontSize: 14,
                  fontWeight: 950,
                  cursor: reserving ? 'wait' : 'pointer',
                  opacity: reserving ? 0.7 : 1,
                  boxShadow: '0 8px 30px #ffffff12',
                }}
              >
                {reserving ? 'Резервируем…' : 'Зарезервировать на 15 минут'}
              </button>
            )}

            <button
              className="buy-button"
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: 18,
                border: '1px solid #383838',
                borderRadius: 15,
                background: '#151515',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Добавить в корзину · {formatPrice(listing.priceTon)} TON
            </button>
          </>
        )}
      </div>

      <RumBottomNav />
    </main>
  )
}
