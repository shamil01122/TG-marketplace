
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

  const panelStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, #191919, #101010)',
    border: '1px solid #303030',
    borderRadius: 22,
    padding: 18,
    marginBottom: 17,
  }

  const mutedText: React.CSSProperties = {
    color: '#929292',
    fontSize: 12,
    lineHeight: 1.6,
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#f4f4f4',
      padding: '20px 15px 110px',
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 25,
        }}>
          <Link href="/" style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: 25,
            fontWeight: 950,
            letterSpacing: 2,
          }}>
            RUM
          </Link>

          <Link href="/rum-cart" style={{
            color: '#ddd',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 700,
            background: '#191919',
            border: '1px solid #333',
            borderRadius: 12,
            padding: '10px 13px',
          }}>
            🛒 Корзина
          </Link>
        </header>

        <section style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 100% 0%, #383838 0%, transparent 55%), linear-gradient(145deg, #242424, #101010)',
          border: '1px solid #414141',
          borderRadius: 25,
          padding: '24px 21px',
          marginBottom: 20,
        }}>
          <div style={{
            position: 'absolute',
            right: 8,
            top: 12,
            fontSize: 76,
            opacity: 0.1,
            pointerEvents: 'none',
          }}>
            💎
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 10px',
            background: '#363636',
            border: '1px solid #505050',
            borderRadius: 20,
            color: '#ddd',
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: 1.3,
            marginBottom: 17,
          }}>
            RUM MARKETPLACE
          </div>

          <h1 style={{
            position: 'relative',
            fontSize: 29,
            fontWeight: 950,
            letterSpacing: -0.8,
            margin: '0 0 9px',
          }}>
            Мои подарки
          </h1>

          <p style={{
            position: 'relative',
            color: '#aaa',
            fontSize: 13,
            lineHeight: 1.65,
            maxWidth: 310,
            margin: 0,
          }}>
            Твой NFT-инвентарь в RUM. Выбирай уникальные подарки и выставляй их на маркетплейс.
          </p>

          <div style={{
            display: 'flex',
            gap: 9,
            marginTop: 20,
          }}>
            <div style={{
              background: '#292929',
              border: '1px solid #444',
              borderRadius: 12,
              padding: '10px 13px',
            }}>
              <div style={{
                fontSize: 21,
                fontWeight: 900,
                lineHeight: 1.2,
              }}>
                {gifts.length}
              </div>
              <div style={{
                color: '#999',
                fontSize: 10,
                marginTop: 4,
              }}>
                ДОСТУПНО NFT
              </div>
            </div>

            <div style={{
              background: '#292929',
              border: '1px solid #444',
              borderRadius: 12,
              padding: '10px 13px',
            }}>
              <div style={{
                fontSize: 13,
                fontWeight: 850,
                lineHeight: 1.2,
              }}>
                TELEGRAM
              </div>
              <div style={{
                color: '#999',
                fontSize: 10,
                marginTop: 5,
              }}>
                ТВОЙ ИНВЕНТАРЬ
              </div>
            </div>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            marginBottom: 15,
          }}>
            <div>
              <h2 style={{
                fontSize: 19,
                fontWeight: 900,
                margin: 0,
                letterSpacing: -0.3,
              }}>
                Твои NFT
              </h2>
              <p style={{ ...mutedText, margin: '5px 0 0' }}>
                Выбери подарок для продажи
              </p>
            </div>

            <div style={{
              background: '#292929',
              border: '1px solid #454545',
              borderRadius: 11,
              padding: '8px 11px',
              fontSize: 12,
              fontWeight: 900,
              whiteSpace: 'nowrap',
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
              padding: 13,
              marginBottom: 16,
              border: '1px solid #414141',
              borderRadius: 13,
              background: checkingTelegram ? '#202020' : '#252525',
              color: '#eee',
              fontWeight: 800,
              fontSize: 12,
              cursor: checkingTelegram ? 'wait' : 'pointer',
              opacity: checkingTelegram ? 0.65 : 1,
            }}
          >
            {checkingTelegram
              ? '⏳ Проверяем Telegram...'
              : '↻  Синхронизировать инвентарь'}
          </button>

          {telegramError && (
            <div style={{
              background: '#2b1919',
              border: '1px solid #633a3a',
              borderRadius: 12,
              padding: 12,
              color: '#e7a19a',
              fontSize: 12,
              lineHeight: 1.5,
              marginBottom: 14,
            }}>
              {telegramError}
            </div>
          )}

          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '35px 10px',
              color: '#999',
              fontSize: 13,
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>◌</div>
              Загружаем твои NFT...
            </div>
          )}

          {!loading && !error && gifts.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '30px 17px',
              background: 'linear-gradient(145deg, #202020, #171717)',
              border: '1px solid #333',
              borderRadius: 17,
            }}>
              <div style={{ fontSize: 43, marginBottom: 12 }}>🎁</div>

              <h3 style={{
                fontSize: 16,
                fontWeight: 900,
                margin: '0 0 8px',
              }}>
                Пока здесь пусто
              </h3>

              <p style={{
                ...mutedText,
                margin: 0,
              }}>
                Уникальные подарки из Telegram появятся здесь после синхронизации инвентаря.
              </p>
            </div>
          )}

          {!loading && gifts.length > 0 && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 11,
              }}>
                {gifts.map((gift) => {
                  const isSelected = selectedGift === gift.id
                  const imageBroken = brokenImages.includes(gift.id)

                  return (
                    <button
                      key={gift.id}
                      type="button"
                      onClick={() => {
                        setSelectedGift(gift.id)
                        setError('')
                        setMessage('')
                      }}
                      style={{
                        minWidth: 0,
                        padding: 8,
                        borderRadius: 16,
                        border: isSelected
                          ? '1px solid #dedede'
                          : '1px solid #343434',
                        background: isSelected
                          ? 'linear-gradient(145deg, #303030, #202020)'
                          : '#191919',
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
                        borderRadius: 11,
                        overflow: 'hidden',
                        background: 'radial-gradient(circle, #383838, #202020 75%)',
                        display: 'grid',
                        placeItems: 'center',
                        marginBottom: 10,
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
                              width: '88%',
                              height: '88%',
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 43 }}>🎁</span>
                        )}

                        {isSelected && (
                          <span style={{
                            position: 'absolute',
                            top: 7,
                            right: 7,
                            width: 24,
                            height: 24,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '50%',
                            background: '#eee',
                            color: '#111',
                            fontWeight: 950,
                            fontSize: 13,
                          }}>
                            ✓
                          </span>
                        )}
                      </div>

                      <div style={{
                        fontSize: 13,
                        fontWeight: 900,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {gift.name}
                      </div>

                      <div style={{
                        color: '#999',
                        fontSize: 10,
                        marginTop: 4,
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
                        gap: 5,
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: '1px solid #353535',
                      }}>
                        <span style={{
                          color: '#999',
                          fontSize: 9,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {gift.model || 'Уникальная модель'}
                        </span>

                        <span style={{
                          color: isSelected ? '#fff' : '#999',
                          fontSize: 9,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                        }}>
                          {isSelected ? '✓ ВЫБРАН' : 'ВЫБРАТЬ'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {selectedGiftData && (
            <div style={{
              marginTop: 18,
              padding: 16,
              background: 'linear-gradient(145deg, #252525, #191919)',
              border: '1px solid #484848',
              borderRadius: 17,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 13,
              }}>
                <span style={{ fontSize: 17 }}>✦</span>
                <span style={{
                  fontSize: 10,
                  color: '#bbb',
                  fontWeight: 900,
                  letterSpacing: 1.2,
                }}>
                  НОВОЕ ОБЪЯВЛЕНИЕ
                </span>
              </div>

              <div style={{
                fontSize: 16,
                fontWeight: 900,
                marginBottom: 5,
              }}>
                {selectedGiftData.name}
              </div>

              <div style={{
                ...mutedText,
                marginBottom: 16,
              }}>
                {selectedGiftData.collection || 'Telegram Gifts'}
              </div>

              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 8,
              }}>
                Укажи стоимость NFT
              </label>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#101010',
                border: '1px solid #414141',
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
                  color: '#ddd',
                  fontSize: 14,
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
                  marginTop: 12,
                  padding: 15,
                  border: '1px solid #eee',
                  borderRadius: 13,
                  background: '#e5e5e5',
                  color: '#111',
                  fontWeight: 950,
                  fontSize: 13,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting
                  ? 'Создаём объявление...'
                  : 'Выставить на продажу →'}
              </button>
            </div>
          )}

          {error && (
            <div style={{
              color: '#e6a09a',
              background: '#2b1919',
              border: '1px solid #633a3a',
              borderRadius: 12,
              padding: 12,
              fontSize: 12,
              lineHeight: 1.5,
              marginTop: 14,
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              color: '#c9c9c9',
              background: '#202020',
              border: '1px solid #414141',
              borderRadius: 12,
              padding: 12,
              fontSize: 12,
              marginTop: 14,
            }}>
              ✓ {message}
            </div>
          )}
        </section>

        <section style={panelStyle}>
          <h2 style={{
            fontSize: 17,
            fontWeight: 900,
            margin: '0 0 7px',
          }}>
            Как это работает
          </h2>

          <p style={{
            ...mutedText,
            margin: '0 0 12px',
          }}>
            Всего три шага до публикации объявления
          </p>

          {[
            ['01', 'Синхронизация', 'Подключись через Telegram и обнови свой инвентарь.'],
            ['02', 'Выбор подарка', 'Выбери уникальный NFT, который хочешь выставить.'],
            ['03', 'Цена и объявление', 'Укажи стоимость в TON и создай объявление.'],
          ].map(([number, title, description], index) => (
            <div key={number} style={{
              display: 'flex',
              gap: 13,
              padding: '13px 0',
              borderBottom: index === 2 ? 0 : '1px solid #303030',
            }}>
              <div style={{
                width: 31,
                height: 31,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 10,
                background: '#292929',
                border: '1px solid #414141',
                color: '#ddd',
                fontSize: 11,
                fontWeight: 900,
              }}>
                {number}
              </div>

              <div>
                <strong style={{ fontSize: 13 }}>{title}</strong>
                <p style={{
                  ...mutedText,
                  margin: '4px 0 0',
                }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </section>

        <div style={{
          background: '#151515',
          border: '1px solid #303030',
          borderRadius: 15,
          padding: 14,
          marginTop: 18,
          color: '#858585',
          fontSize: 11,
          lineHeight: 1.7,
          textAlign: 'center',
        }}>
          Создание объявления пока не означает передачу подарка.
          Оплата TON и автоматическая передача NFT покупателю ещё не реализованы.
        </div>

        <Link href="/catalog" style={{
          display: 'block',
          textAlign: 'center',
          background: '#242424',
          border: '1px solid #414141',
          color: '#f2f2f2',
          borderRadius: 14,
          padding: 15,
          marginTop: 15,
          textDecoration: 'none',
          fontWeight: 850,
          fontSize: 13,
        }}>
          Перейти в каталог →
        </Link>
      </div>

      <RumBottomNav />
    </main>
  )
}
