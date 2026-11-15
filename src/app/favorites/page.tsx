'use client'
import RumBottomNav from '@/components/rum/bottom-nav'

import Link from 'next/link'
import { useRumFavorites } from '@/lib/rum/favorites'

export default function FavoritesPage() {
  const items = useRumFavorites((state) => state.items)
  const toggleFavorite = useRumFavorites((state) => state.toggleFavorite)
  const clear = useRumFavorites((state) => state.clear)

  return (
    <main style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#f2eee5',
      padding: '22px 18px 40px',
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <Link href="/" style={{
            color: '#f2eee5',
            textDecoration: 'none',
            fontSize: 25,
            fontWeight: 900,
            letterSpacing: 2,
          }}>
            RUM
          </Link>
          <Link href="/catalog" style={{
            color: '#f2eee5',
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
          Твои любимые коллекционные подарки
        </p>

        {items.length === 0 ? (
          <section style={{
            background: '#1b1b1b',
            borderRadius: 22,
            padding: '55px 20px',
            textAlign: 'center',
            border: '1px solid #333333',
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
              Нажимай на сердечко у понравившихся подарков в каталоге.
            </p>
            <Link href="/catalog" style={{
              display: 'inline-block',
              background: '#383838',
              color: '#f2eee5',
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
                Сохранено подарков: {items.length}
              </strong>
              <button onClick={clear} style={{
                border: 0,
                background: 'transparent',
                color: '#d2a18e',
                fontSize: 12,
                cursor: 'pointer',
              }}>
                Очистить всё
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 13,
            }}>
              {items.map((gift) => (
                <article key={gift.id} style={{
                  background: '#1b1b1b',
                  border: '1px solid #333333',
                  borderRadius: 18,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: 135,
                    background: `linear-gradient(145deg, #494034, #201e19)`,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 65,
                  }}>
                    {gift.emoji}
                  </div>
                  <div style={{ padding: 12 }}>
                    <strong style={{
                      display: 'block',
                      fontSize: 14,
                      marginBottom: 5,
                    }}>
                      {gift.name}
                    </strong>
                    <p style={{
                      color: '#bdbdbd',
                      fontSize: 11,
                      margin: '0 0 9px',
                    }}>
                      {gift.rarity}
                    </p>
                    <strong style={{ fontSize: 15 }}>
                      {gift.price} TON
                    </strong>
                    <button
                      onClick={() => toggleFavorite(gift)}
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
          </>
        )}

        <p style={{
          color: '#bdbdbd',
          fontSize: 11,
          textAlign: 'center',
          marginTop: 25,
        }}>
          Цены и карточки пока демонстрационные.
        </p>
      </div>
      <RumBottomNav />
    </main>
  )
}
