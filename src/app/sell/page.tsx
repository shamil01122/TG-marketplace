'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import RumBottomNav from '@/components/rum/bottom-nav'

type Gift = {
  id: string
  name: string
  collection: string
  model: string
  imageUrl: string
  status: string
}

export default function SellPage() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [selectedGift, setSelectedGift] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadGifts() {
    try {
      const response = await fetch('/api/rum/my-gifts', {
        cache: 'no-store',
      })

      if (response.status === 401) {
        setError('Открой RUM через Telegram и авторизуйся.')
        return
      }

      if (!response.ok) {
        throw new Error('Не удалось загрузить подарки')
      }

      const data: Gift[] = await response.json()
      setGifts(data)
    } catch {
      setError('Не удалось загрузить подарки. Попробуй ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGifts()
  }, [])

  async function createListing() {
    if (!selectedGift || !price) {
      setError('Выбери подарок и укажи цену.')
      return
    }

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/rum/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: selectedGift,
          priceTon: price,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось создать объявление')
      }

      setGifts((current) =>
        current.filter((gift) => gift.id !== selectedGift),
      )
      setSelectedGift('')
      setPrice('')
      setMessage('Объявление создано!')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Произошла ошибка',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#f2eee5',
      padding: '22px 18px 105px',
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 35,
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
          <Link href="/rum-cart" style={{
            color: '#f2eee5',
            textDecoration: 'none',
            fontSize: 13,
          }}>
            🛒 Корзина
          </Link>
        </header>

        <div style={{
          background: '#202020',
          color: '#f2eee5',
          borderRadius: 24,
          padding: 25,
          marginBottom: 25,
        }}>
          <div style={{ fontSize: 36, marginBottom: 15 }}>💎</div>
          <h1 style={{
            fontSize: 29,
            fontWeight: 900,
            margin: '0 0 10px',
          }}>
            Продай свой подарок
          </h1>
          <p style={{
            color: '#bdbdbd',
            fontSize: 14,
            lineHeight: 1.6,
            margin: 0,
          }}>
            Выставляй коллекционные Telegram-подарки на продажу
            и находи покупателей в RUM.
          </p>
        </div>

        <section style={{
          background: '#1b1b1b',
          border: '1px solid #333333',
          borderRadius: 20,
          padding: 22,
          marginBottom: 18,
        }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 15px' }}>
            Мои подарки
          </h2>

          {loading && <p>Загружаем подарки...</p>}

          {!loading && !error && gifts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 5px' }}>
              <div style={{ fontSize: 45 }}>🎁</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                Пока нет доступных подарков
              </h3>
              <p style={{
                color: '#bdbdbd',
                fontSize: 13,
                lineHeight: 1.6,
              }}>
                Здесь появятся подарки, зарегистрированные в RUM
                и принадлежащие твоему профилю.
              </p>
            </div>
          )}

          {!loading && gifts.length > 0 && (
            <div style={{ display: 'grid', gap: 12 }}>
              {gifts.map((gift) => (
                <button
                  key={gift.id}
                  type="button"
                  onClick={() => setSelectedGift(gift.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
                    width: '100%',
                    padding: 12,
                    borderRadius: 14,
                    border: selectedGift === gift.id
                      ? '2px solid #bdbdbd'
                      : '1px solid #333333',
                    background: selectedGift === gift.id
                      ? '#f3f8ee'
                      : '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#f2eee5',
                  }}
                >
                  <div style={{
                    width: 58,
                    height: 58,
                    borderRadius: 12,
                    background: '#252525',
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    fontSize: 27,
                  }}>
                    {gift.imageUrl
                      ? <img
                          src={gift.imageUrl}
                          alt={gift.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      : '🎁'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{gift.name}</strong>
                    <p style={{
                      color: '#bdbdbd',
                      fontSize: 12,
                      margin: '5px 0 0',
                    }}>
                      {gift.collection || gift.model || 'Коллекционный подарок'}
                    </p>
                  </div>
                  <span style={{ fontSize: 19 }}>
                    {selectedGift === gift.id ? '✓' : '○'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {selectedGift && (
            <div style={{ marginTop: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
              }}>
                Цена в TON
              </label>
              <input
                type="number"
                min="0.000000001"
                step="0.000000001"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Например, 10"
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid #444444',
                  fontSize: 16,
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                disabled={submitting}
                onClick={createListing}
                style={{
                  width: '100%',
                  marginTop: 13,
                  padding: 15,
                  border: 0,
                  borderRadius: 13,
                  background: '#383838',
                  color: '#f2eee5',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Создаём...' : 'Выставить на продажу'}
              </button>
            </div>
          )}

          {error && (
            <p style={{
              color: '#e18b7e',
              fontSize: 13,
              lineHeight: 1.5,
              marginTop: 15,
            }}>
              {error}
            </p>
          )}

          {message && (
            <p style={{
              color: '#b7c98b',
              fontSize: 13,
              marginTop: 15,
            }}>
              {message}
            </p>
          )}
        </section>

        <section style={{
          background: '#1b1b1b',
          border: '1px solid #333333',
          borderRadius: 20,
          padding: 22,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 12px' }}>
            Как это работает
          </h2>
          {[
            ['01', 'Подключи Telegram', 'Войди через Telegram в RUM.'],
            ['02', 'Выбери подарок', 'Выбери доступный подарок из своего профиля RUM.'],
            ['03', 'Назначь цену', 'Укажи стоимость в TON и создай объявление.'],
          ].map(([number, title, description]) => (
            <div key={number} style={{
              display: 'flex',
              gap: 14,
              padding: '13px 0',
              borderBottom: number === '03' ? 0 : '1px solid #333333',
            }}>
              <span style={{
                color: '#bdbdbd',
                fontSize: 14,
                fontWeight: 900,
              }}>{number}</span>
              <div>
                <strong style={{ fontSize: 14 }}>{title}</strong>
                <p style={{
                  color: '#bdbdbd',
                  fontSize: 12,
                  margin: '5px 0 0',
                }}>{description}</p>
              </div>
            </div>
          ))}
        </section>

        <p style={{
          color: '#bdbdbd',
          fontSize: 11,
          textAlign: 'center',
          lineHeight: 1.5,
          marginTop: 20,
        }}>
          Создание объявления пока не означает передачу подарка.
          Проверка владения в Telegram и оплата TON ещё не подключены.
        </p>

        <Link href="/catalog" style={{
          display: 'block',
          textAlign: 'center',
          background: '#383838',
          color: '#f2eee5',
          borderRadius: 14,
          padding: 15,
          marginTop: 18,
          textDecoration: 'none',
          fontWeight: 800,
        }}>
          Перейти в каталог
        </Link>
      </div>
      <RumBottomNav />
    </main>
  )
}
