
'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import RumBottomNav from '@/components/rum/bottom-nav'

type DealStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'transferring'
  | 'completed'
  | 'cancelled'
  | 'disputed'

interface Deal {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  status: DealStatus
  amountTon: string
  transactionHash: string | null
  expiresAt: string | null
  paidAt: string | null
  completedAt: string | null
  createdAt: string | null
  giftId: string
  giftName: string
  collection: string
  number: number | null
  model: string
  imageUrl: string
  sellerUsername: string
  sellerDisplayName: string
  role: 'buyer' | 'seller'
}

const statusLabels: Record<DealStatus, string> = {
  pending: 'Ожидает обработки',
  payment_pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  transferring: 'Передача подарка',
  completed: 'Завершена',
  cancelled: 'Отменена',
  disputed: 'Спор',
}

const statusStyles: Record<DealStatus, string> = {
  pending: 'pending',
  payment_pending: 'pending',
  paid: 'progress',
  transferring: 'progress',
  completed: 'completed',
  cancelled: 'cancelled',
  disputed: 'disputed',
}

function formatDate(value: string | null) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RumDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all')

  const loadDeals = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/rum/deals', {
        method: 'GET',
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось загрузить сделки')
      }

      setDeals(Array.isArray(data.deals) ? data.deals : [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ошибка загрузки истории сделок',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDeals()
  }, [loadDeals])

  const filteredDeals = deals.filter((deal) => {
    if (filter === 'buyer') return deal.role === 'buyer'
    if (filter === 'seller') return deal.role === 'seller'
    return true
  })

  const filterOptions = [
    { value: 'all' as const, label: 'Все', count: deals.length },
    {
      value: 'buyer' as const,
      label: 'Покупки',
      count: deals.filter((deal) => deal.role === 'buyer').length,
    },
    {
      value: 'seller' as const,
      label: 'Продажи',
      count: deals.filter((deal) => deal.role === 'seller').length,
    },
  ]

  return (
    <main className="min-h-screen bg-[#080807] px-4 pb-32 pt-6 text-[#f2eee4]">
      <style jsx>{`
        .deal-card {
          transition:
            border-color 160ms ease,
            transform 160ms ease;
        }

        .deal-card:active {
          transform: scale(0.99);
        }

        .refresh-button {
          transition: border-color 160ms ease, color 160ms ease;
        }

        @media (hover: hover) {
          .deal-card:hover {
            border-color: #65532e !important;
          }

          .refresh-button:hover {
            border-color: #8a713d !important;
            color: #d8b45a !important;
          }
        }

        .status-pending {
          border-color: #65532e;
          background: #211d13;
          color: #d8b45a;
        }

        .status-progress {
          border-color: #384d5b;
          background: #131e25;
          color: #9dc6dc;
        }

        .status-completed {
          border-color: #405b42;
          background: #142016;
          color: #a5d3a2;
        }

        .status-cancelled {
          border-color: #393326;
          background: #1a1915;
          color: #a49b88;
        }

        .status-disputed {
          border-color: #68403a;
          background: #251513;
          color: #e2a39a;
        }
      `}</style>

      <div className="mx-auto max-w-[560px]">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/profile"
            className="text-xs font-bold text-[#b9ad91] no-underline"
          >
            ‹ Профиль
          </Link>

          <Link
            href="/"
            className="text-2xl font-black tracking-[5px] text-[#f3eee2] no-underline"
          >
            RUM
          </Link>

          <button
            type="button"
            onClick={() => void loadDeals()}
            disabled={loading}
            className="refresh-button rounded-full border border-[#393326] bg-[#171610] px-3 py-2 text-[10px] font-bold text-[#c0b69f] disabled:opacity-50"
          >
            ↻ Обновить
          </button>
        </header>

        <section className="mb-7">
          <div className="text-[10px] font-extrabold tracking-[2.5px] text-[#a18b58]">
            RUM MARKETPLACE
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#f3eee2]">
            Мои сделки
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#918b7d]">
            История покупок, продаж и резервов уникальных подарков.
          </p>
        </section>

        <section className="mb-5 rounded-2xl border border-[#302d24] bg-[#12120f] p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-[2px] text-[#a18b58]">
              ACTIVITY
            </span>
            <span className="text-[10px] text-[#918b7d]">
              Всего: {deals.length}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-xl border px-2 py-3 text-xs font-bold transition-colors ${
                  filter === option.value
                    ? 'border-[#d8b45a] bg-[#d8b45a] text-[#17130a]'
                    : 'border-[#393326] bg-[#191812] text-[#a49b88]'
                }`}
              >
                {option.label}
                <span
                  className={`ml-1 ${
                    filter === option.value
                      ? 'text-[#17130a]/70'
                      : 'text-[#817b6d]'
                  }`}
                >
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-[#302d24] bg-[#151511] px-5 py-12 text-center">
            <div className="text-sm font-semibold text-[#d0c8b7]">
              Загружаем сделки...
            </div>
            <div className="mt-2 text-xs text-[#817b6d]">
              Пожалуйста, подожди
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#68403a] bg-[#1b1110] p-5 text-center">
            <div className="text-sm font-bold text-[#e2a39a]">
              Не удалось загрузить историю
            </div>
            <p className="mt-2 text-xs leading-5 text-[#c18c83]">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadDeals()}
              className="mt-4 rounded-xl bg-[#d8b45a] px-5 py-3 text-xs font-bold text-[#17130a]"
            >
              Попробовать снова
            </button>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="rounded-2xl border border-[#302d24] bg-[#151511] px-5 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#51452c] bg-[#211d13] text-3xl">
              📋
            </div>

            <h2 className="mt-4 text-base font-bold text-[#f2eee4]">
              {deals.length === 0
                ? 'Пока нет сделок'
                : 'Здесь пока пусто'}
            </h2>

            <p className="mx-auto mt-2 max-w-[260px] text-xs leading-5 text-[#918b7d]">
              {deals.length === 0
                ? 'Когда ты зарезервируешь или продашь подарок, история появится здесь.'
                : 'В этой категории пока нет сделок.'}
            </p>

            <Link
              href="/catalog"
              className="mt-5 inline-flex rounded-xl bg-[#d8b45a] px-5 py-3 text-xs font-bold text-[#17130a] no-underline"
            >
              Открыть каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDeals.map((deal) => (
              <article
                key={deal.id}
                className="deal-card overflow-hidden rounded-2xl border border-[#302d24] bg-[#151511] p-3.5"
              >
                <div className="flex gap-3">
                  <div className="h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl border border-[#393326] bg-[#211f18]">
                    {deal.imageUrl ? (
                      <img
                        src={deal.imageUrl}
                        alt={deal.giftName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">
                        🎁
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-extrabold tracking-widest text-[#a18b58]">
                        {deal.role === 'buyer' ? 'ПОКУПКА' : 'ПРОДАЖА'}
                      </span>

                      <span
                        className={`status-${statusStyles[deal.status] || 'pending'} rounded-full border px-2 py-1 text-[9px] font-bold`}
                      >
                        {statusLabels[deal.status] || deal.status}
                      </span>
                    </div>

                    <h2 className="mt-2 truncate text-sm font-black text-[#f2eee4]">
                      {deal.giftName}
                    </h2>

                    <p className="mt-1 truncate text-[11px] text-[#918b7d]">
                      {deal.collection || 'Коллекция не указана'}
                      {deal.number ? ` #${deal.number}` : ''}
                    </p>

                    <div className="mt-2 text-lg font-black text-[#d8b45a]">
                      {deal.amountTon}{' '}
                      <span className="text-xs font-bold text-[#918b7d]">
                        TON
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#302d24] pt-3">
                  <div className="flex justify-between gap-3 text-[10px]">
                    <span className="text-[#918b7d]">Дата сделки</span>
                    <span className="text-right text-[#d0c8b7]">
                      {formatDate(deal.createdAt)}
                    </span>
                  </div>

                  {deal.expiresAt && (
                    <div className="mt-2 flex justify-between gap-3 text-[10px]">
                      <span className="text-[#918b7d]">Резерв до</span>
                      <span className="text-right text-[#d0c8b7]">
                        {formatDate(deal.expiresAt)}
                      </span>
                    </div>
                  )}

                  {deal.paidAt && (
                    <div className="mt-2 flex justify-between gap-3 text-[10px]">
                      <span className="text-[#918b7d]">Оплачено</span>
                      <span className="text-right text-[#d0c8b7]">
                        {formatDate(deal.paidAt)}
                      </span>
                    </div>
                  )}

                  {deal.completedAt && (
                    <div className="mt-2 flex justify-between gap-3 text-[10px]">
                      <span className="text-[#918b7d]">Завершено</span>
                      <span className="text-right text-[#d0c8b7]">
                        {formatDate(deal.completedAt)}
                      </span>
                    </div>
                  )}

                  {deal.role === 'buyer' && (
                    <div className="mt-2 flex justify-between gap-3 text-[10px]">
                      <span className="text-[#918b7d]">Продавец</span>
                      <span className="text-right text-[#d0c8b7]">
                        {deal.sellerDisplayName ||
                          (deal.sellerUsername
                            ? `@${deal.sellerUsername}`
                            : 'Профиль продавца')}
                      </span>
                    </div>
                  )}

                  {deal.status === 'payment_pending' && (
                    <div className="mt-3 rounded-xl border border-[#65532e] bg-[#211d13] p-3 text-[10px] leading-5 text-[#d8c28e]">
                      Подарок зарезервирован. Оплата и передача NFT пока не подключены.
                    </div>
                  )}

                  {deal.status === 'disputed' && (
                    <div className="mt-3 rounded-xl border border-[#68403a] bg-[#251513] p-3 text-[10px] leading-5 text-[#e2a39a]">
                      По этой сделке отмечен спор. Обратись в поддержку RUM.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-7 text-center text-[10px] leading-5 text-[#716c60]">
          История отображает зарегистрированные сделки RUM.
          Завершение покупки требует отдельного подтверждения оплаты и передачи NFT.
        </p>
      </div>

      <RumBottomNav />
    </main>
  )
}
