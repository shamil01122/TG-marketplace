
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
    model: string
    backdrop: string
    symbol: string
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
                  height: 330,
                  maxHeight: '75vw',
                  minHeight: 230,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 22,
                  boxSizing: 'border-box',
                  background:
                    'radial-gradient(circle, #292929 0%, #151515 62%, #080808 100%)',
                }}
              >
                {listing.gift.imageUrl ? (
                  <img
                    src={listing.gift.imageUrl}
                    alt={listing.gift.name}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 90 }}>🎁</span>
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
                ИНФОРМАЦИЯ
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 12,
                  marginBottom: 15,
                }}
              >
                <span style={{ color: '#888888' }}>Коллекция</span>
                <strong style={{ textAlign: 'right' }}>
                  {listing.gift.collection || 'Не указана'}
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 12,
                  marginBottom: 15,
                }}
              >
                <span style={{ color: '#888888' }}>Модель</span>
                <strong style={{ textAlign: 'right' }}>
                  {listing.gift.model || 'Не указана'}
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 12,
                }}
              >
                <span style={{ color: '#888888' }}>Продавец</span>
                <strong style={{ textAlign: 'right' }}>
                  {listing.seller.displayName ||
                    (listing.seller.username
                      ? `@${listing.seller.username}`
                      : 'Не указан')}
                </strong>
              </div>
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
