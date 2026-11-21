
'use client'

import Link from 'next/link'
import RumBottomNav from '@/components/rum/bottom-nav'
import { useRumCart } from '@/lib/rum/cart'

export default function RumCartPage() {
  const items = useRumCart((state) => state.items)
  const removeGift = useRumCart((state) => state.removeGift)
  const clear = useRumCart((state) => state.clear)

  const total = items.reduce((sum, item) => sum + item.priceTon, 0)

  const formatPrice = (price: number) =>
    price.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#080807',
        padding: '22px 15px 125px',
        color: '#f2eee4',
      }}
    >
      <style jsx>{`
        .cart-item {
          transition: border-color 160ms ease, transform 160ms ease;
        }

        .cart-item:active {
          transform: scale(0.99);
        }

        .remove-button:hover {
          color: #e4c477 !important;
        }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 30,
          }}
        >
          <Link
            href="/catalog"
            style={{
              color: '#c0ad7d',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            ← Каталог
          </Link>

          <Link
            href="/"
            style={{
              color: '#f3eee2',
              textDecoration: 'none',
              fontSize: 24,
              fontWeight: 950,
              letterSpacing: 4,
            }}
          >
            RUM
          </Link>

          <span style={{ width: 48 }} />
        </header>

        <div style={{ marginBottom: 25 }}>
          <div
            style={{
              color: '#a18b58',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 2.5,
              marginBottom: 10,
            }}
          >
            YOUR SELECTION
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 950,
              letterSpacing: -1,
              margin: '0 0 8px',
            }}
          >
            Корзина
          </h1>

          <p style={{ color: '#928d80', fontSize: 13, margin: 0 }}>
            Твои выбранные объявления
          </p>
        </div>

        {items.length === 0 ? (
          <section
            style={{
              textAlign: 'center',
              padding: '52px 20px',
              background: 'linear-gradient(145deg, #191916, #10100e)',
              border: '1px solid #302d24',
              borderRadius: 20,
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                margin: '0 auto',
                display: 'grid',
                placeItems: 'center',
                borderRadius: 24,
                background: '#211d13',
                border: '1px solid #51452c',
                fontSize: 38,
              }}
            >
              🎁
            </div>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 850,
                margin: '18px 0 8px',
              }}
            >
              Корзина пока пуста
            </h2>

            <p
              style={{
                color: '#928d80',
                fontSize: 12,
                lineHeight: 1.6,
                marginBottom: 23,
              }}
            >
              Выбери интересный подарок в каталоге RUM.
            </p>

            <Link
              href="/catalog"
              style={{
                display: 'inline-block',
                background: '#d8b45a',
                padding: '13px 22px',
                borderRadius: 12,
                color: '#17130a',
                textDecoration: 'none',
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              Перейти в каталог
            </Link>
          </section>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 13,
              }}
            >
              <strong style={{ fontSize: 14 }}>
                Выбрано: {items.length}
              </strong>

              <button
                onClick={clear}
                style={{
                  color: '#a49b88',
                  background: 'transparent',
                  border: '1px solid #393326',
                  borderRadius: 30,
                  padding: '8px 12px',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Очистить всё
              </button>
            </div>

            <div style={{ display: 'grid', gap: 11 }}>
              {items.map((item) => (
                <article
                  key={item.listingId}
                  className="cart-item"
                  style={{
                    display: 'flex',
                    gap: 13,
                    padding: 12,
                    background: 'linear-gradient(145deg, #191916, #11110e)',
                    border: '1px solid #302d24',
                    borderRadius: 17,
                    alignItems: 'center',
                  }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{
                        width: 82,
                        height: 82,
                        flexShrink: 0,
                        borderRadius: 13,
                        objectFit: 'contain',
                        background: '#211f18',
                        border: '1px solid #393326',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 82,
                        height: 82,
                        flexShrink: 0,
                        borderRadius: 13,
                        background: '#211f18',
                        border: '1px solid #393326',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 34,
                      }}
                    >
                      🎁
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 850,
                        color: '#f2eee4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </strong>

                    <p
                      style={{
                        color: '#928d80',
                        fontSize: 11,
                        margin: '5px 0 9px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {[item.collection, item.model]
                        .filter(Boolean)
                        .join(' · ') || 'Telegram-подарок'}
                    </p>

                    <strong
                      style={{
                        color: '#d8b45a',
                        fontSize: 14,
                      }}
                    >
                      {formatPrice(item.priceTon)} TON
                    </strong>

                    <div style={{ marginTop: 8 }}>
                      <button
                        className="remove-button"
                        onClick={() => removeGift(item.listingId)}
                        style={{
                          color: '#8d8678',
                          background: 'none',
                          border: 0,
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        Удалить из корзины
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <section
              style={{
                background: 'linear-gradient(145deg, #191916, #10100e)',
                border: '1px solid #51452c',
                borderRadius: 19,
                padding: 19,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  color: '#a18b58',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 2,
                  marginBottom: 13,
                }}
              >
                ORDER SUMMARY
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 14,
                  color: '#c3bcad',
                }}
              >
                <span>Количество подарков</span>
                <strong>{items.length}</strong>
              </div>

              <div
                style={{
                  borderTop: '1px solid #393326',
                  marginTop: 15,
                  paddingTop: 15,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 800 }}>
                  Итого
                </span>

                <strong
                  style={{
                    fontSize: 21,
                    fontWeight: 950,
                    color: '#d8b45a',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatPrice(total)} TON
                </strong>
              </div>

              <div
                style={{
                  background: '#0d0d0a',
                  border: '1px solid #393326',
                  borderRadius: 12,
                  padding: 12,
                  marginTop: 16,
                  color: '#a49b88',
                  fontSize: 11,
                  lineHeight: 1.65,
                }}
              >
                Корзина пока служит списком выбранных объявлений.
                Проверка актуальной цены, покупка и TON-платежи ещё
                не подключены. Не отправляй оплату продавцам напрямую.
              </div>

              <Link
                href="/catalog"
                style={{
                  display: 'block',
                  marginTop: 15,
                  padding: 14,
                  borderRadius: 12,
                  background: '#d8b45a',
                  color: '#17130a',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                Продолжить выбор
              </Link>
            </section>
          </>
        )}
      </div>

      <RumBottomNav />
    </main>
  )
}
