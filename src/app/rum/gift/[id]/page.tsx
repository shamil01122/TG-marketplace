
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

const panelStyle = {
  background: '#111111',
  border: '1px solid #292929',
  borderRadius: 19,
} as const

function colorHex(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null

  return `#${(value >>> 0).toString(16).padStart(6, '0').slice(-6)}`
}

function rarityLabel(value: number | null) {
  if (value === null) return 'Не указана'
  return `${value}‰`
}

export default function RumGiftPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const favorites = useRumFavorites((state) => state.items)
  const toggleFavorite = useRumFavorites((state) => state.toggleFavorite)
  const addGift = useRumCart((state) => state.addGift)

  const isFavorite = favorites.some(
    (item) => item.listingId === id,
  )

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

        const found = data.find(
          (item: Listing) => item.id === id,
        )

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
            err instanceof Error
              ? err.message
              : 'Ошибка загрузки подарка',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadListing()

    return () => {
      cancelled = true
    }
  }, [id])

  const formatPrice = (price: string) =>
    Number(price).toLocaleString('ru-RU', {
      maximumFractionDigits: 4,
    })

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
  const symbolColor = colorHex(gift?.backdropSymbolColor ?? null)
  const textColor = colorHex(gift?.backdropTextColor ?? null)

  const giftBackground = centerColor && edgeColor
    ? `radial-gradient(circle at 50% 42%, ${centerColor} 0%, ${edgeColor} 100%)`
    : 'radial-gradient(circle, #292929 0%, #151515 62%, #080808 100%)'

  const infoRow = (
    label: string,
    value: string | number | null | undefined,
    last = false,
  ) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        fontSize: 12,
        marginBottom: last ? 0 : 15,
      }}
    >
      <span style={{ color: '#888888' }}>{label}</span>
      <strong style={{ textAlign: 'right', color: '#eeeeee' }}>
        {value === null || value === undefined || value === ''
          ? 'Не указана'
          : value}
      </strong>
    </div>
  )

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#f5f5f5',
        padding: '22px 17px 115px',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 27,
          }}
        >
          <button
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
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 330,
                  maxHeight: '75vw',
                  minHeight: 230,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 22,
                  boxSizing: 'border-box',
                  background: giftBackground,
                  overflow: 'hidden',
                }}
              >
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
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 90 }}>🎁</span>
                )}

                {listing.gift.number !== null && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 13,
                      right: 15,
                      zIndex: 2,
                      color: textColor || '#ffffff',
                      fontSize: 11,
                      fontWeight: 900,
                      background: '#00000055',
                      padding: '6px 10px',
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
                  padding: '15px 17px',
                  borderTop: '1px solid #292929',
                }}
              >
                <span
                  style={{
                    color: '#999999',
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                  }}
                >
                  UNIQUE TELEGRAM GIFT
                </span>

                <button
                  onClick={() => toggleFavorite(listing.id)}
                  style={{
                    width: 39,
                    height: 39,
                    borderRadius: 50,
                    border: '1px solid #383838',
                    background: '#202020',
                    color: '#ffffff',
                    fontSize: 21,
                    cursor: 'pointer',
                  }}
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

            <section style={{ marginBottom: 23 }}>
              <div
                style={{
                  color: '#888888',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 2,
                  marginBottom: 10,
                }}
              >
                {listing.gift.collection || 'TELEGRAM COLLECTION'}
              </div>

              <h1
                style={{
                  fontSize: 30,
                  lineHeight: 1.15,
                  fontWeight: 950,
                  letterSpacing: -1,
                  margin: '0 0 10px',
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
                padding: 19,
                marginBottom: 15,
              }}
            >
              <div
                style={{
                  color: '#888888',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  marginBottom: 9,
                }}
              >
                ЦЕНА ПРОДАВЦА
              </div>

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 950,
                  letterSpacing: -0.7,
                }}
              >
                {formatPrice(listing.priceTon)} TON
              </div>
            </section>

            <section
              style={{
                ...panelStyle,
                padding: 19,
                marginBottom: 15,
              }}
            >
              <div
                style={{
                  color: '#888888',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  marginBottom: 15,
                }}
              >
                ХАРАКТЕРИСТИКИ NFT
              </div>

              {infoRow('Коллекция', listing.gift.collection)}
              {infoRow('Номер подарка', `#${listing.gift.number ?? '—'}`)}
              {infoRow('Модель', listing.gift.model)}
              {infoRow('Редкость модели', listing.gift.modelRarity || 'Не указана')}
              {infoRow('Редкость модели', rarityLabel(listing.gift.modelRarityPerMille))}
              {infoRow('Символ', listing.gift.symbol)}
              {infoRow('Редкость символа', rarityLabel(listing.gift.symbolRarityPerMille))}
              {infoRow('Фон', listing.gift.backdrop)}
              {infoRow('Редкость фона', rarityLabel(listing.gift.backdropRarityPerMille), true)}
            </section>

            <section
              style={{
                ...panelStyle,
                padding: 19,
                marginBottom: 17,
              }}
            >
              <div
                style={{
                  color: '#888888',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  marginBottom: 16,
                }}
              >
                ОРИГИНАЛЬНЫЕ ЦВЕТА TELEGRAM
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 12,
                }}
              >
                {[
                  { name: 'Центральный', color: centerColor },
                  { name: 'Край фона', color: edgeColor },
                  { name: 'Цвет символа', color: symbolColor },
                  { name: 'Цвет текста', color: textColor },
                ].map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: 10,
                      background: '#191919',
                      border: '1px solid #303030',
                      borderRadius: 12,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        flexShrink: 0,
                        borderRadius: 9,
                        background: item.color || '#333333',
                        border: '1px solid #ffffff30',
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: '#aaaaaa',
                          marginBottom: 4,
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#ffffff',
                        }}
                      >
                        {item.color || 'Нет данных'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              style={{
                ...panelStyle,
                padding: 19,
                marginBottom: 17,
              }}
            >
              <div
                style={{
                  color: '#888888',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  marginBottom: 15,
                }}
              >
                ПРОДАВЕЦ
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

            <section
              style={{
                ...panelStyle,
                padding: 17,
                marginBottom: 17,
              }}
            >
              <div
                style={{
                  color: '#888888',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.3,
                  marginBottom: 9,
                }}
              >
                ВАЖНО
              </div>

              <p
                style={{
                  color: '#999999',
                  fontSize: 11,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Добавление подарка в корзину пока не является покупкой.
                Оплата и автоматическая передача Telegram-подарка ещё не
                подключены.
              </p>
            </section>

            <button
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: 17,
                border: 0,
                borderRadius: 15,
                background: '#ffffff',
                color: '#000000',
                fontSize: 14,
                fontWeight: 950,
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
