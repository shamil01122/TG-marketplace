
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

  const panelStyle = {
    background: '#1b1b1b',
    border: '1px solid #333333',
    borderRadius: 18,
  } as const

  const formatPrice = (price: string) =>
    Number(price).toLocaleString('ru-RU', {
      maximumFractionDigits: 4,
    })

  return (
    <main style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#f2f2f2',
      padding: '22px 18px 110px',
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <Link href="/" style={{
            color: '#f2f2f2',
            textDecoration: 'none',
            fontSize: 25,
            fontWeight: 900,
            letterSpacing: 2,
          }}>
            RUM
          </Link>

          <Link href="/catalog" style={{
            color: '#f2f2f2',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 700,
          }}>
            Каталог →
          </Link>
        </header>

        <h1 style={{
          fontSize: 29,
          fontWeight: 900,
          margin: '0 0 8px',
        }}>
          Избранное <span style={{ color: '#bdbdbd' }}>♥</span>
        </h1>

        <p style={{
          color: '#bdbdbd',
          fontSize: 14,
          marginBottom: 25,
        }}>
          Сохранённые объявления RUM
        </p>

        {loading ? (
          <section style={{
            ...panelStyle,
            padding: 35,
            textAlign: 'center',
            color: '#bdbdbd',
          }}>
            Загружаем избранное…
          </section>
        ) : error ? (
          <section style={{
            ...panelStyle,
            padding: 30,
            textAlign: 'center',
            color: '#e0a0a0',
          }}>
            {error}
          </section>
        ) : favorites.length === 0 ? (
          <section style={{
            ...panelStyle,
            padding: '55px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 55 }}>♡</div>

            <h2 style={{
              fontSize: 19,
              fontWeight: 800,
              margin: '15px 0 8px',
            }}>
              Пока здесь пусто
            </h2>

            <p style={{
              color: '#bdbdbd',
              fontSize: 13,
              lineHeight: 1.6,
              marginBottom: 22,
            }}>
              Добавляй объявления в избранное с помощью сердечка в каталоге.
            </p>

            <Link href="/catalog" style={{
              display: 'inline-block',
              background: '#383838',
              color: '#f2f2f2',
              borderRadius: 13,
              padding: '13px 22px',
              textDecoration: 'none',
              fontWeight: 800,
            }}>
              Открыть каталог
            </Link>
          </section>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 15,
            }}>
              <strong style={{ fontSize: 13, color: '#bdbdbd' }}>
                Сохранено: {favorites.length}
              </strong>

              <button
                onClick={clear}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#d2a18e',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Очистить всё
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 13,
            }}>
              {favorites.map((listing) => (
                <article key={listing.id} style={{
                  ...panelStyle,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: 135,
                    background: '#202020',
                    display: 'grid',
                    placeItems: 'center',
                    padding: 10,
                  }}>
                    {listing.gift.imageUrl ? (
                      <img
                        src={listing.gift.imageUrl}
                        alt={listing.gift.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 55 }}>🎁</span>
                    )}
                  </div>

                  <div style={{ padding: 12 }}>
                    <strong style={{
                      display: 'block',
                      fontSize: 14,
                      marginBottom: 5,
                    }}>
                      {listing.gift.name}
                    </strong>

                    <p style={{
                      color: '#bdbdbd',
                      fontSize: 11,
                      margin: '0 0 9px',
                    }}>
                      {[listing.gift.collection, listing.gift.model]
                        .filter(Boolean)
                        .join(' · ') || 'Telegram-подарок'}
                    </p>

                    <strong style={{ fontSize: 15 }}>
                      {formatPrice(listing.priceTon)} TON
                    </strong>

                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        marginTop: 12,
                        padding: 9,
                        border: '1px solid #333333',
                        borderRadius: 10,
                        background: '#1b1b1b',
                        color: '#d2a18e',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      ♥ Убрать
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {favoriteItems.length > favorites.length && (
              <p style={{
                color: '#999999',
                fontSize: 11,
                lineHeight: 1.6,
                marginTop: 18,
              }}>
                Некоторые сохранённые объявления больше не активны и не отображаются.
              </p>
            )}
          </>
        )}
      </div>

      <RumBottomNav />
    </main>
  )
}
