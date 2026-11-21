
'use client'

import { useCallback, useEffect, useState } from 'react'
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
  pending: 'border-yellow-900 bg-yellow-950/40 text-yellow-400',
  payment_pending: 'border-yellow-900 bg-yellow-950/40 text-yellow-400',
  paid: 'border-blue-900 bg-blue-950/40 text-blue-400',
  transferring: 'border-blue-900 bg-blue-950/40 text-blue-400',
  completed: 'border-green-900 bg-green-950/40 text-green-400',
  cancelled: 'border-[#393939] bg-[#222222] text-gray-400',
  disputed: 'border-red-900 bg-red-950/40 text-red-400',
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

  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-32 pt-7 text-white">
      <style jsx>{`
        .deal-card {
          transition: border-color 160ms ease, transform 160ms ease;
        }
        .deal-card:active {
          transform: scale(0.99);
        }
      `}</style>

      <div className="mx-auto max-w-[560px]">
        <header className="mb-7 flex items-center justify-between">
          <a
            href="/profile"
            className="text-sm font-semibold text-gray-400 no-underline"
          >
            ‹ Назад
          </a>

          <a
            href="/"
            className="text-2xl font-black tracking-[5px] text-white no-underline"
          >
            RUM
          </a>

          <button
            type="button"
            onClick={() => void loadDeals()}
            disabled={loading}
            className="rounded-full border border-[#333333] bg-[#171717] px-3 py-2 text-xs font-semibold text-gray-300 disabled:opacity-50"
          >
            Обновить
          </button>
        </header>

        <section className="mb-7">
          <div className="text-[10px] font-extrabold tracking-[2px] text-gray-500">
            RUM MARKETPLACE
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Мои сделки
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            История покупок, продаж и резервов уникальных подарков.
          </p>
        </section>

        <section className="mb-5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-xl border px-2 py-3 text-xs font-bold ${
              filter === 'all'
                ? 'border-white bg-white text-black'
                : 'border-[#303030] bg-[#151515] text-gray-400'
            }`}
          >
            Все
          </button>

          <button
            type="button"
            onClick={() => setFilter('buyer')}
            className={`rounded-xl border px-2 py-3 text-xs font-bold ${
              filter === 'buyer'
                ? 'border-white bg-white text-black'
                : 'border-[#303030] bg-[#151515] text-gray-400'
            }`}
          >
            Покупки
          </button>

          <button
            type="button"
            onClick={() => setFilter('seller')}
            className={`rounded-xl border px-2 py-3 text-xs font-bold ${
              filter === 'seller'
                ? 'border-white bg-white text-black'
                : 'border-[#303030] bg-[#151515] text-gray-400'
            }`}
          >
            Продажи
          </button>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-[#292929] bg-[#151515] px-5 py-12 text-center">
            <div className="text-sm font-semibold text-gray-300">
              Загружаем сделки...
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Пожалуйста, подожди
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/60 bg-[#190d0d] p-5 text-center">
            <div className="text-sm font-bold text-red-300">
              Не удалось загрузить историю
            </div>
            <p className="mt-2 text-xs leading-5 text-red-200/70">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadDeals()}
              className="mt-4 rounded-xl bg-white px-5 py-3 text-xs font-bold text-black"
            >
              Попробовать снова
            </button>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="rounded-2xl border border-[#292929] bg-[#151515] px-5 py-12 text-center">
            <div className="text-4xl">📋</div>
            <h2 className="mt-4 text-base font-bold">
              {deals.length === 0
                ? 'Пока нет сделок'
                : 'Здесь пока пусто'}
            </h2>
            <p className="mx-auto mt-2 max-w-[260px] text-xs leading-5 text-gray-500">
              {deals.length === 0
                ? 'Когда ты зарезервируешь или продашь подарок, история появится здесь.'
                : 'В этой категории пока нет сделок.'}
            </p>
            <a
              href="/catalog"
              className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-xs font-bold text-black no-underline"
            >
              Открыть каталог
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDeals.map((deal) => (
              <article
                key={deal.id}
                className="deal-card overflow-hidden rounded-2xl border border-[#292929] bg-[#151515] p-4"
              >
                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#333333] bg-[#222222]">
                    {deal.imageUrl ? (
                      <img
                        src={deal.imageUrl}
                        alt={deal.giftName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">
                        🎁
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-extrabold tracking-widest text-gray-500">
                        {deal.role === 'buyer' ? 'ПОКУПКА' : 'ПРОДАЖА'}
                      </span>

                      <span
                        className={`rounded-full border px-2 py-1 text-[9px] font-bold ${
                          statusStyles[deal.status] ||
                          statusStyles.pending
                        }`}
                      >
                        {statusLabels[deal.status] || deal.status}
                      </span>
                    </div>

                    <h2 className="mt-2 truncate text-sm font-black">
                      {deal.giftName}
                    </h2>

                    <p className="mt-1 truncate text-[11px] text-gray-500">
                      {deal.collection || 'Коллекция не указана'}
                      {deal.number ? ` #${deal.number}` : ''}
                    </p>

                    <div className="mt-3 text-lg font-black">
                      {deal.amountTon}{' '}
                      <span className="text-xs font-bold text-gray-500">
                        TON
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#292929] pt-3">
                  <div className="flex justify-between gap-3 text-[10px]">
                    <span className="text-gray-500">Дата сделки</span>
                    <span className="text-right text-gray-300">
                      {formatDate(deal.createdAt)}
                    </span>
                  </div>

                  {deal.expiresAt && (
                    <div className="mt-2 flex justify-between gap-3 text-[10px]">
                      <span className="text-gray-500">Резерв до</span>
                      <span className="text-right text-gray-300">
                        {formatDate(deal.expiresAt)}
                      </span>
                    </div>
                  )}

                  {deal.paidAt && (
                    <div className="mt-2 flex justify-between gap-3 text-[10px]">
                      <span className="text-gray-500">Оплачено</span>
                      <span className="text-right text-gray-300">
                        {formatDate(deal.paidAt)}
                      </span>
                    </div>
                  )}

                  {deal.completedAt && (
                    <div className="mt-2 flex justify-between gap-3 text-[10px]">
                      <span className="text-gray-500">Завершено</span>
                      <span className="text-right text-gray-300">
                        {formatDate(deal.completedAt)}
                      </span>
                    </div>
                  )}

                  {deal.role === 'buyer' && (
                    <div className="mt-2 flex justify-between gap-3 text-[10px]">
                      <span className="text-gray-500">Продавец</span>
                      <span className="text-right text-gray-300">
                        {deal.sellerDisplayName ||
                          (deal.sellerUsername
                            ? `@${deal.sellerUsername}`
                            : 'Профиль продавца')}
                      </span>
                    </div>
                  )}

                  {deal.status === 'payment_pending' && (
                    <div className="mt-3 rounded-xl border border-yellow-900/50 bg-yellow-950/20 p-3 text-[10px] leading-5 text-yellow-200/80">
                      Подарок зарезервирован. Оплата и передача NFT пока не подключены.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-7 text-center text-[10px] leading-5 text-gray-600">
          История отображает зарегистрированные сделки RUM.
          Завершение покупки требует отдельного подтверждения оплаты и передачи NFT.
        </p>
      </div>

      <RumBottomNav />
    </main>
  )
}
