
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
  const [checkingTelegram, setCheckingTelegram] = useState(false)
  const [telegramError, setTelegramError] = useState('')
  const [brokenImages, setBrokenImages] = useState<string[]>([])

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
      setError('')
    } catch {
      setError('Не удалось загрузить подарки. Попробуй ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  async function checkTelegramGifts() {
    setCheckingTelegram(true)
    setTelegramError('')
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/rum/my-gifts/sync', {
        method: 'POST',
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось получить подарки')
      }

      setBrokenImages([])
      await loadGifts()
      setMessage('Инвентарь успешно обновлён!')
    } catch (err) {
      setTelegramError(
        err instanceof Error ? err.message : 'Ошибка проверки Telegram',
      )
    } finally {
      setCheckingTelegram(false)
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

    const numericPrice = Number(price)

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError('Укажи корректную цену в TON.')
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

  const selectedGiftData = gifts.find((gift) => gift.id === selectedGift)

  return (
    <main style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#f2f2f2',
      padding: '22px 18px 105px',
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30,
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

          <Link href="/rum-cart" style={{
            color: '#f2f2f2',
            textDecoration: 'none',
            fontSize: 13,
          }}>
            🛒 Корзина
          </Link>
        </header>

        <section style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #292929, #111111)',
          border: '1px solid #414141',
          borderRadius: 25,
          padding: 25,
          marginBottom: 24,
        }}>
          <div style={{
            position: 'absolute',
            right: -25,
            top: -30,
            fontSize: 130,
            opacity: 0.08,
          }}>
            💎
          </div>

          <div style={{
            display: 'inline-block',
            padding: '6px 11px',
            background: '#383838',
            borderRadius: 20,
            color: '#d6d6d6',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1,
            marginBottom: 17,
          }}>
            RUM MARKETPLACE
          </div>

          <h1 style={{
            position: 'relative',
            fontSize: 30,
            fontWeight: 900,
            margin: '0 0 10px',
          }}>
            Продай свой NFT
          </h1>

          <p style={{
            position: 'relative',
            color: '#bdbdbd',
            fontSize: 14,
            lineHeight: 1.6,
            margin: 0,
          }}>
            Выбирай уникальные Telegram-подарки и создавай
            объявления для покупателей RUM.
          </p>
        </section>

        <section style={{
          background: '#151515',
          border: '1px solid #303030',
          borderRadius: 22,
          padding: 19,
          marginBottom: 18,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <div>
              <h2 style={{
                fontSize: 20,
                fontWeight: 900,
                margin: 0,
              }}>
                Мои NFT
              </h2>

              <p style={{
                color: '#858585',
                fontSize: 12,
                margin: '5px 0 0',
              }}>
                Выбери подарок для объявления
              </p>
            </div>

            <div style={{
              background: '#292929',
              border: '1px solid #414141',
              borderRadius: 12,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 800,
            }}>
              {gifts.length} NFT
            </div>
          </div>

          <button
            type="button"
            onClick={checkTelegramGifts}
            disabled={checkingTelegram}
            style={{
              width: '100%',
              padding: 14,
              marginBottom: 17,
              border: '1px solid #454545',
              borderRadius: 13,
              background: '#252525',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
              opacity: checkingTelegram ? 0.6 : 1,
            }}
          >
            {checkingTelegram
              ? 'Проверяем Telegram...'
              : '↻  Обновить мои NFT'}
          </button>

          {telegramError && (
            <p style={{
              color: '#e18b7e',
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              {telegramError}
            </p>
          )}

          {loading && (
            <p style={{ color: '#aaa', textAlign: 'center', padding: 20 }}>
              Загружаем NFT...
            </p>
          )}

          {!loading && !error && gifts.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '30px 10px',
              background: '#1d1d1d',
              borderRadius: 17,
            }}>
              <div style={{ fontSize: 48 }}>🎁</div>

              <h3 style={{ fontSize: 16, fontWeight: 800 }}>
                Пока нет доступных NFT
              </h3>

              <p style={{
                color: '#999',
                fontSize: 13,
                lineHeight: 1.6,
              }}>
                Проверь свои подарки в Telegram. Доступные NFT
                появятся здесь после синхронизации.
              </p>
            </div>
          )}

          {!loading && gifts.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}>
              {gifts.map((gift) => {
                const isSelected = selectedGift === gift.id
                const imageBroken = brokenImages.includes(gift.id)

                return (
                  <button
                    key={gift.id}
                    type="button"
                    onClick={() => setSelectedGift(gift.id)}
                    style={{
                      minWidth: 0,
                      padding: 9,
                      borderRadius: 17,
                      border: isSelected
                        ? '2px solid #dedede'
                        : '1px solid #363636',
                      background: isSelected ? '#292929' : '#1c1c1c',
                      color: '#f2f2f2',
                      textAlign: 'left',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1 / 1',
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: '#292929',
                      display: 'grid',
                      placeItems: 'center',
                      marginBottom: 11,
                    }}>
                      {gift.imageUrl && !imageBroken ? (
                        <img
                          src={gift.imageUrl}
                          alt={gift.name}
                          onError={() => {
                            setBrokenImages((current) =>
                              current.includes(gift.id)
                                ? current
                                : [...current, gift.id],
                            )
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 48 }}>🎁</span>
                      )}

                      {isSelected && (
                        <span style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 25,
                          height: 25,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '50%',
                          background: '#f2f2f2',
                          color: '#111',
                          fontWeight: 900,
                          fontSize: 14,
                        }}>
                          ✓
                        </span>
                      )}
                    </div>

                    <div style={{
                      fontSize: 14,
                      fontWeight: 900,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {gift.name}
                    </div>

                    <div style={{
                      color: '#999',
                      fontSize: 11,
                      marginTop: 5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {gift.collection || 'Telegram Gifts'}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 12,
                      paddingTop: 9,
                      borderTop: '1px solid #363636',
                    }}>
                      <span style={{
                        color: '#aaa',
                        fontSize: 10,
                      }}>
                        {gift.model || 'Уникальная модель'}
                      </span>

                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: isSelected ? '#fff' : '#999',
                      }}>
                        {isSelected ? 'ВЫБРАНО' : 'ВЫБРАТЬ'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {selectedGiftData && (
            <div style={{
              marginTop: 20,
              padding: 17,
              background: '#202020',
              border: '1px solid #444',
              borderRadius: 17,
            }}>
              <div style={{
                fontSize: 11,
                color: '#999',
                fontWeight: 800,
                letterSpacing: 1,
                marginBottom: 8,
              }}>
                ВЫСТАВЛЕНИЕ NFT
              </div>

              <div style={{
                fontSize: 17,
                fontWeight: 900,
                marginBottom: 15,
              }}>
                {selectedGiftData.name}
              </div>

              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 9,
              }}>
                Твоя цена
              </label>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#111',
                border: '1px solid #444',
                borderRadius: 13,
                padding: '0 13px',
              }}>
                <input
                  type="number"
                  min="0.000000001"
                  step="0.000000001"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Например, 10"
                  style={{
                    width: '100%',
                    minWidth: 0,
                    padding: '15px 0',
                    background: 'transparent',
                    border: 0,
                    outline: 'none',
                    color: '#fff',
                    fontSize: 17,
                  }}
                />

                <strong style={{
                  color: '#d6d6d6',
                  fontSize: 15,
                }}>
                  TON
                </strong>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={createListing}
                style={{
                  width: '100%',
                  marginTop: 13,
                  padding: 16,
                  border: '1px solid #777',
                  borderRadius: 13,
                  background: '#dedede',
                  color: '#111',
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Создаём объявление...' : 'Выставить на продажу →'}
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
              color: '#bdbdbd',
              fontSize: 13,
              marginTop: 15,
            }}>
              ✓ {message}
            </p>
          )}
        </section>

        <section style={{
          background: '#151515',
          border: '1px solid #303030',
          borderRadius: 20,
          padding: 20,
        }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 900,
            margin: '0 0 10px',
          }}>
            Как это работает
          </h2>

          {[
            ['01', 'Подключи Telegram', 'Войди через Telegram в RUM.'],
            ['02', 'Выбери NFT', 'Выбери доступный подарок из своего инвентаря.'],
            ['03', 'Укажи цену', 'Назначь стоимость в TON и создай объявление.'],
          ].map(([number, title, description]) => (
            <div key={number} style={{
              display: 'flex',
              gap: 14,
              padding: '13px 0',
              borderBottom: number === '03' ? 0 : '1px solid #333',
            }}>
              <span style={{
                color: '#aaa',
                fontSize: 13,
                fontWeight: 900,
              }}>
                {number}
              </span>

              <div>
                <strong style={{ fontSize: 14 }}>{title}</strong>

                <p style={{
                  color: '#999',
                  fontSize: 12,
                  lineHeight: 1.5,
                  margin: '5px 0 0',
                }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </section>

        <p style={{
          color: '#777',
          fontSize: 11,
          textAlign: 'center',
          lineHeight: 1.6,
          marginTop: 20,
        }}>
          Создание объявления пока не означает передачу подарка.
          Передача NFT покупателю и оплата TON пока не реализованы.
        </p>

        <Link href="/catalog" style={{
          display: 'block',
          textAlign: 'center',
          background: '#252525',
          border: '1px solid #414141',
          color: '#f2f2f2',
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
