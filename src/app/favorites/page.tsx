
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
  background: 'linear-gradient(145deg, #191916, #10100e)',
  border: '1px solid #302d24',
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
        background: '#080807',
        color: '#f2eee4',
        padding: '22px 15px 115px',
      }}
    >
      <style jsx>{`
        .favorite-card {
          transition:
            border-color 160ms ease,
            background 160ms ease,
            transform 160ms ease;
        }

        .favorite-card:active {
          transform: scale(0.985);
        }

        .favorite-remove {
          transition: background 160ms ease, color 160ms ease;
        }

        @media (hover: hover) {
          .favorite-card:hover {
            border-color: #65532e !important;
          }

          .favorite-remove:hover {
            background: #302619 !important;
            color: #e6c574 !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 27,
          }}
        >
          <Link
            href="/"
            style={{
              color: '#f3eee2',
              textDecoration: 'none',
              fontSize: 25,
              fontWeight: 950,
              letterSpacing: 4,
            }}
          >
            RUM
          </Link>

          <Link
            href="/catalog"
            style={{
              color: '#d8b45a',
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 800,
              background: '#211d13',
              border: '1px solid #51452c',
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
            padding: '23px 20px',
            marginBottom: 25,
            background:
              'radial-gradient(ellipse at 85% 0%, #302619 0%, transparent 55%), linear-gradient(145deg, #191916, #0b0b09 75%)',
          }}
        >
          <div
            style={{
              color: '#a18b58',
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
              fontSize: 31,
              fontWeight: 950,
              letterSpacing: -1.2,
              margin: '0 0 9px',
              color: '#f5f0e5',
            }}
          >
            Избранное{' '}
            <span style={{ color: '#d8b45a' }}>♥</span>
          </h1>

          <p
            style={{
              color: '#999487',
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
              color: '#a49d8d',
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
              color: '#d2cabb',
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
                border: '1px solid #806a3d',
                borderRadius: 12,
                background: '#d8b45a',
                color: '#17130a',
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
              padding: '45px 22px',
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
                borderRadius: 23,
                background: '#211d13',
                border: '1px solid #51452c',
                fontSize: 37,
                color: '#d8b45a',
              }}
            >
              ♡
            </div>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 900,
                margin: '0 0 9px',
                color: '#f2eee4',
              }}
            >
              Пока здесь пусто
            </h2>

            <p
              style={{
                color: '#999487',
                fontSize: 12,
                lineHeight: 1.7,
                margin: '0 auto 23px',
                maxWidth: 280,
              }}
            >
              Сохраняй понравившиеся объявления с помощью сердечка
              в каталоге. Они появятся здесь.
            </p>

            <Link
              href="/catalog"
              style={{
                display: 'inline-block',
                background: '#d8b45a',
                color: '#17130a',
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
                marginBottom: 15,
              }}
            >
              <div>
                <div
                  style={{
                    color: '#a18b58',
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: 2,
                    marginBottom: 5,
                  }}
                >
                  SAVED ITEMS
                </div>

                <strong style={{ fontSize: 15, color: '#f2eee4' }}>
                  Сохранено: {favorites.length}
                </strong>
              </div>

              <button
                onClick={clear}
                style={{
                  border: '1px solid #393326',
                  background: '#171610',
                  color: '#b6ad9a',
                  borderRadius: 30,
                  padding: '9px 13px',
                  fontSize: 10,
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
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 11,
              }}
            >
              {favorites.map((listing) => (
                <article
                  key={listing.id}
                  className="favorite-card"
                  style={{
                    ...panelStyle,
                    overflow: 'hidden',
                    background: '#11110e',
                  }}
                >
                  <Link
                    href={`/rum/gift/${listing.id}`}
                    style={{
                      display: 'block',
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: '1 / 1',
                        background:
                          'radial-gradient(circle, #302a1c 0%, #191812 57%, #10100e 100%)',
                        display: 'grid',
                        placeItems: 'center',
                        padding: 10,
                        boxSizing: 'border-box',
                        position: 'relative',
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
                        <span style={{ fontSize: 45 }}>🎁</span>
                      )}

                      <span
                        style={{
                          position: 'absolute',
                          top: 9,
                          right: 9,
                          width: 27,
                          height: 27,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '50%',
                          background: '#17140e',
                          border: '1px solid #65532e',
                          color: '#d8b45a',
                          fontSize: 14,
                        }}
                      >
                        ♥
                      </span>
                    </div>
                  </Link>

                  <div style={{ padding: '12px 11px 11px' }}>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 850,
                        marginBottom: 5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#f2eee4',
                      }}
                    >
                      {listing.gift.name}
                    </strong>

                    <p
                      style={{
                        color: '#918b7d',
                        fontSize: 10,
                        margin: '0 0 12px',
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
                        borderTop: '1px solid #302d24',
                        paddingTop: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          color: '#918b7d',
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      >
                        ЦЕНА
                      </span>

                      <strong
                        style={{
                          fontSize: 12,
                          color: '#d8b45a',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatPrice(listing.priceTon)} TON
                      </strong>
                    </div>

                    <button
                      className="favorite-remove"
                      onClick={() => toggleFavorite(listing.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        marginTop: 11,
                        padding: '10px 5px',
                        border: '1px solid #393326',
                        borderRadius: 10,
                        background: '#1b1912',
                        color: '#c4bda9',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: 10,
                      }}
                    >
                      ♥ Убрать
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {favoriteItems.length > favorites.length && (
              <p
                style={{
                  color: '#817b6d',
                  fontSize: 11,
                  lineHeight: 1.7,
                  marginTop: 19,
                  textAlign: 'center',
                }}
              >
                Некоторые сохранённые объявления больше не активны
                и не отображаются.
              </p>
            )}
          </>
        )}
      </div>

      <RumBottomNav />
    </main>
  )
}
