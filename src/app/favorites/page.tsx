
'use client'

import RumBottomNav from '@/components/rum/bottom-nav'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRumFavorites } from '@/lib/rum/favorites'

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

const panelStyle = {
  background: '#101010',
  border: '1px solid #292929',
  borderRadius: 19,
} as const

export default function FavoritesPage() {
  const favoriteItems = useRumFavorites((state) => state.items)
  const toggleFavorite = useRumFavorites((state) => state.toggleFavorite)
  const clear = useRumFavorites((state) => state.clear)

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

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
          throw new Error('Сервер вернул неверный формат данных')
        }

        if (!cancelled) {
          setListings(data)
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

    loadListings()

    return () => {
      cancelled = true
    }
  }, [])

  const favoriteIds = new Set(
    favoriteItems.map((item) => item.listingId),
  )

  const favorites = listings.filter((listing) =>
    favoriteIds.has(listing.id),
  )

  const formatPrice = (price: string) =>
    Number(price).toLocaleString('ru-RU', {
      maximumFractionDigits: 4,
    })

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
            marginBottom: 35,
          }}
        >
          <Link
            href="/"
            style={{
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: 26,
              fontWeight: 950,
              letterSpacing: 3,
            }}
          >
            RUM
          </Link>

          <Link
            href="/catalog"
            style={{
              color: '#cccccc',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 800,
              background: '#151515',
              border: '1px solid #303030',
              borderRadius: 30,
              padding: '10px 15px',
            }}
          >
            Каталог →
          </Link>
        </header>

        <section
          style={{
            ...panelStyle,
            padding: '23px 21px',
            marginBottom: 28,
            background:
              'linear-gradient(145deg, #191919, #0b0b0b 75%)',
          }}
        >
          <div
            style={{
              color: '#888888',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 2.5,
              marginBottom: 12,
            }}
          >
            YOUR COLLECTION
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 950,
              letterSpacing: -1.2,
              margin: '0 0 9px',
            }}
          >
            Избранное <span style={{ color: '#ffffff' }}>♥</span>
          </h1>

          <p
            style={{
              color: '#999999',
              fontSize: 13,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Твоя подборка интересных подарков и редких экземпляров.
          </p>
        </section>

        {loading ? (
          <section
            style={{
              ...panelStyle,
              padding: 38,
              textAlign: 'center',
              color: '#999999',
              fontSize: 13,
            }}
          >
            Загружаем избранное…
          </section>
        ) : error ? (
          <section
            style={{
              ...panelStyle,
              padding: 30,
              textAlign: 'center',
              color: '#cccccc',
              fontSize: 13,
            }}
          >
            {error}

            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'block',
                margin: '16px auto 0',
                padding: '11px 18px',
                border: 0,
                borderRadius: 12,
                background: '#ffffff',
                color: '#000000',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Повторить
            </button>
          </section>
        ) : favorites.length === 0 ? (
          <section
            style={{
              ...panelStyle,
              padding: '48px 22px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 18px',
                borderRadius: 24,
                background: '#1b1b1b',
                border: '1px solid #333333',
                fontSize: 37,
                color: '#ffffff',
              }}
            >
              ♡
            </div>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 900,
                margin: '0 0 9px',
              }}
            >
              Пока здесь пусто
            </h2>

            <p
              style={{
                color: '#999999',
                fontSize: 12,
                lineHeight: 1.7,
                margin: '0 auto 23px',
                maxWidth: 280,
              }}
            >
              Сохраняй понравившиеся объявления с помощью сердечка в каталоге.
              Они появятся здесь.
            </p>

            <Link
              href="/catalog"
              style={{
                display: 'inline-block',
                background: '#ffffff',
                color: '#000000',
                borderRadius: 13,
                padding: '14px 23px',
                textDecoration: 'none',
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              Открыть каталог
            </Link>
          </section>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    color: '#777777',
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: 2,
                    marginBottom: 5,
                  }}
                >
                  SAVED ITEMS
                </div>

                <strong style={{ fontSize: 15 }}>
                  Сохранено: {favorites.length}
                </strong>
              </div>

              <button
                onClick={clear}
                style={{
                  border: '1px solid #303030',
                  background: '#151515',
                  color: '#aaaaaa',
                  borderRadius: 30,
                  padding: '9px 13px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Очистить всё
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(min(100%, 215px), 1fr))',
                gap: 13,
              }}
            >
              {favorites.map((listing) => (
                <article
                  key={listing.id}
                  style={{
                    ...panelStyle,
                    overflow: 'hidden',
                    background: '#0d0d0d',
                  }}
                >
                  <Link
                    href="/catalog"
                    style={{
                      display: 'block',
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      style={{
                        height: 135,
                        background:
                          'radial-gradient(circle, #242424 0%, #141414 60%, #0b0b0b 100%)',
                        display: 'grid',
                        placeItems: 'center',
                        padding: 10,
                        boxSizing: 'border-box',
                      }}
                    >
                      {listing.gift.imageUrl ? (
                        <img
                          src={listing.gift.imageUrl}
                          alt={listing.gift.name}
                          style={{
                            display: 'block',
                            width: 105,
                            height: 105,
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 45 }}>🎁</span>
                      )}
                    </div>
                  </Link>

                  <div style={{ padding: '14px 13px 13px' }}>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 850,
                        marginBottom: 6,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {listing.gift.name}
                    </strong>

                    <p
                      style={{
                        color: '#888888',
                        fontSize: 10,
                        margin: '0 0 13px',
                        minHeight: 15,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {[listing.gift.collection, listing.gift.model]
                        .filter(Boolean)
                        .join(' · ') || 'Telegram-подарок'}
                    </p>

                    <div
                      style={{
                        borderTop: '1px solid #282828',
                        paddingTop: 11,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          color: '#777777',
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      >
                        ЦЕНА
                      </span>

                      <strong style={{ fontSize: 14 }}>
                        {formatPrice(listing.priceTon)} TON
                      </strong>
                    </div>

                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        marginTop: 13,
                        padding: 11,
                        border: '1px solid #353535',
                        borderRadius: 11,
                        background: '#191919',
                        color: '#dddddd',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: 11,
                      }}
                    >
                      ♥ Убрать из избранного
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {favoriteItems.length > favorites.length && (
              <p
                style={{
                  color: '#777777',
                  fontSize: 11,
                  lineHeight: 1.7,
                  marginTop: 19,
                  textAlign: 'center',
                }}
              >
                Некоторые сохранённые объявления больше не активны и не
                отображаются.
              </p>
            )}
          </>
        )}
      </div>

      <RumBottomNav />
    </main>
  )
}
