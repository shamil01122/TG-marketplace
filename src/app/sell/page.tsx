
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
    void loadGifts()
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
    <main className="min-h-screen bg-[#080807] px-4 pb-32 pt-6 text-[#f2eee4]">
      <style jsx>{`
        .luxury-panel {
          background: linear-gradient(145deg, #171710, #11110e);
          border: 1px solid #302d24;
          border-radius: 20px;
        }

        .gift-card {
          transition:
            border-color 160ms ease,
            background 160ms ease,
            transform 160ms ease;
        }

        .gift-card:active {
          transform: scale(0.98);
        }

        .gold-button {
          transition: background 160ms ease, opacity 160ms ease;
        }

        @media (hover: hover) {
          .gift-card:hover {
            border-color: #756039 !important;
          }

          .gold-button:hover:not(:disabled) {
            background: #e5c576 !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[560px]">
        <header className="mb-7 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black tracking-[5px] text-[#f3eee2] no-underline"
          >
            RUM
          </Link>

          <Link
            href="/rum-cart"
            className="rounded-xl border border-[#393326] bg-[#171610] px-3 py-2.5 text-xs font-bold text-[#c0b69f] no-underline"
          >
            🛒 Корзина
          </Link>
        </header>

        <section className="relative mb-5 overflow-hidden rounded-[24px] border border-[#51452c] bg-[radial-gradient(ellipse_at_100%_0%,#514329_0%,transparent_55%),linear-gradient(145deg,#242015,#11110e)] p-5">
          <div className="pointer-events-none absolute right-3 top-3 text-[76px] opacity-[0.12]">
            💎
          </div>

          <div className="relative mb-4 inline-flex rounded-full border border-[#756039] bg-[#302819] px-3 py-1.5 text-[9px] font-black tracking-[2px] text-[#d8b45a]">
            RUM MARKETPLACE
          </div>

          <h1 className="relative text-3xl font-black tracking-tight">
            Мои подарки
          </h1>

          <p className="relative mt-2 max-w-[310px] text-sm leading-6 text-[#aaa18e]">
            Твой NFT-инвентарь в RUM. Выбирай уникальные подарки и выставляй их на маркетплейс.
          </p>

          <div className="relative mt-5 flex gap-2">
            <div className="rounded-xl border border-[#51452c] bg-[#211d13] px-4 py-3">
              <div className="text-2xl font-black text-[#d8b45a]">
                {gifts.length}
              </div>
              <div className="mt-1 text-[9px] font-bold tracking-wider text-[#a99a77]">
                ДОСТУПНО NFT
              </div>
            </div>

            <div className="rounded-xl border border-[#51452c] bg-[#211d13] px-4 py-3">
              <div className="text-sm font-black tracking-wider text-[#e4d9bd]">
                TELEGRAM
              </div>
              <div className="mt-2 text-[9px] font-bold tracking-wider text-[#a99a77]">
                ТВОЙ ИНВЕНТАРЬ
              </div>
            </div>
          </div>
        </section>

        <section className="luxury-panel mb-5 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] font-black tracking-[2px] text-[#a18b58]">
                YOUR COLLECTION
              </div>
              <h2 className="mt-1 text-lg font-black">Твои NFT</h2>
              <p className="mt-1 text-xs text-[#918b7d]">
                Выбери подарок для продажи
              </p>
            </div>

            <div className="rounded-xl border border-[#51452c] bg-[#211d13] px-3 py-2 text-xs font-black text-[#d8b45a]">
              {gifts.length} NFT
            </div>
          </div>

          <button
            type="button"
            onClick={checkTelegramGifts}
            disabled={checkingTelegram}
            className="mb-4 w-full rounded-xl border border-[#65532e] bg-[#211d13] px-4 py-3.5 text-xs font-extrabold text-[#d8b45a] disabled:cursor-wait disabled:opacity-50"
          >
            {checkingTelegram
              ? '⏳ Проверяем Telegram...'
              : '↻  Синхронизировать инвентарь'}
          </button>

          {telegramError && (
            <div className="mb-4 rounded-xl border border-[#68403a] bg-[#251513] p-3 text-xs leading-5 text-[#e2a39a]">
              {telegramError}
            </div>
          )}

          {loading && (
            <div className="py-12 text-center">
              <div className="mb-3 text-3xl text-[#d8b45a]">◌</div>
              <div className="text-sm font-semibold text-[#c0b69f]">
                Загружаем твои NFT...
              </div>
            </div>
          )}

          {!loading && !error && gifts.length === 0 && (
            <div className="rounded-2xl border border-[#302d24] bg-[#11110e] px-5 py-9 text-center">
              <div className="text-4xl">🎁</div>
              <h3 className="mt-4 text-base font-black">
                Пока здесь пусто
              </h3>
              <p className="mx-auto mt-2 max-w-[270px] text-xs leading-5 text-[#918b7d]">
                Уникальные подарки из Telegram появятся здесь после синхронизации инвентаря.
              </p>
            </div>
          )}

          {!loading && gifts.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
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
                    className="gift-card min-w-0 overflow-hidden rounded-2xl border p-2 text-left"
                    style={{
                      borderColor: isSelected ? '#d8b45a' : '#393326',
                      background: isSelected
                        ? 'linear-gradient(145deg,#292316,#1b1912)'
                        : '#171610',
                    }}
                  >
                    <div className="relative mb-2 grid aspect-square place-items-center overflow-hidden rounded-xl bg-[radial-gradient(circle,#383124,#1b1a14_75%)]">
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
                          className="h-[88%] w-[88%] object-contain"
                        />
                      ) : (
                        <span className="text-4xl">🎁</span>
                      )}

                      {isSelected && (
                        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#d8b45a] text-xs font-black text-[#17130a]">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="truncate text-[13px] font-black text-[#f2eee4]">
                      {gift.name}
                    </div>

                    <div className="mt-1 truncate text-[10px] text-[#918b7d]">
                      {gift.collection || 'Telegram Gifts'}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-1 border-t border-[#393326] pt-2">
                      <span className="truncate text-[9px] text-[#918b7d]">
                        {gift.model || 'Уникальная модель'}
                      </span>

                      <span className="shrink-0 text-[9px] font-black text-[#d8b45a]">
                        {isSelected ? '✓ ВЫБРАН' : 'ВЫБРАТЬ'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {selectedGiftData && (
            <div className="mt-5 rounded-2xl border border-[#65532e] bg-[linear-gradient(145deg,#211d13,#171610)] p-4">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg text-[#d8b45a]">✦</span>
                <span className="text-[10px] font-black tracking-[2px] text-[#d8b45a]">
                  НОВОЕ ОБЪЯВЛЕНИЕ
                </span>
              </div>

              <div className="text-base font-black">
                {selectedGiftData.name}
              </div>

              <div className="mt-1 text-xs text-[#918b7d]">
                {selectedGiftData.collection || 'Telegram Gifts'}
              </div>

              <label
                htmlFor="listing-price"
                className="mb-2 mt-5 block text-xs font-bold text-[#c0b69f]"
              >
                Укажи стоимость NFT
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-[#51452c] bg-[#0d0d0b] px-3">
                <input
                  id="listing-price"
                  type="number"
                  min="0.000000001"
                  step="0.000000001"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Например, 10"
                  className="w-full min-w-0 bg-transparent py-4 text-lg font-bold text-[#f2eee4] outline-none placeholder:text-[#716c60]"
                />

                <strong className="text-sm font-black text-[#d8b45a]">
                  TON
                </strong>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={createListing}
                className="gold-button mt-3 w-full rounded-xl bg-[#d8b45a] px-4 py-4 text-sm font-black text-[#17130a] disabled:cursor-wait disabled:opacity-50"
              >
                {submitting
                  ? 'Создаём объявление...'
                  : 'Выставить на продажу →'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-[#68403a] bg-[#251513] p-3 text-xs leading-5 text-[#e2a39a]">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-4 rounded-xl border border-[#65532e] bg-[#211d13] p-3 text-xs text-[#d8c28e]">
              ✓ {message}
            </div>
          )}
        </section>

        <section className="luxury-panel p-4">
          <div className="text-[9px] font-black tracking-[2px] text-[#a18b58]">
            SELLING GUIDE
          </div>

          <h2 className="mt-1 text-lg font-black">
            Как это работает
          </h2>

          <p className="mt-1 text-xs text-[#918b7d]">
            Всего три шага до публикации объявления
          </p>

          {[
            ['01', 'Синхронизация', 'Подключись через Telegram и обнови свой инвентарь.'],
            ['02', 'Выбор подарка', 'Выбери уникальный NFT, который хочешь выставить.'],
            ['03', 'Цена и объявление', 'Укажи стоимость в TON и создай объявление.'],
          ].map(([number, title, description], index) => (
            <div
              key={number}
              className={`flex gap-3 py-4 ${
                index !== 2 ? 'border-b border-[#302d24]' : ''
              }`}
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#51452c] bg-[#211d13] text-[11px] font-black text-[#d8b45a]">
                {number}
              </div>

              <div>
                <strong className="text-sm font-bold">{title}</strong>
                <p className="mt-1 text-xs leading-5 text-[#918b7d]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-4 rounded-2xl border border-[#302d24] bg-[#11110e] p-4 text-center text-[10px] leading-5 text-[#817b6d]">
          Создание объявления пока не означает передачу подарка.
          Оплата TON и автоматическая передача NFT покупателю ещё не реализованы.
        </div>

        <Link
          href="/catalog"
          className="mt-4 block rounded-xl border border-[#51452c] bg-[#211d13] p-4 text-center text-sm font-extrabold text-[#d8b45a] no-underline"
        >
          Перейти в каталог →
        </Link>
      </div>

      <RumBottomNav />
    </main>
  )
}
