'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Order = {
  order_number: string | number
  status: string
  total_usd: string | number
  items?: Array<{
    product_id: string
    name: string
    qty: number
    price: number
  }>
  ton_tx_hash?: string | null
}

export default function ConfirmPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadOrder = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`/api/orders/${orderId}/status`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error === 'Not found'
              ? 'Заказ не найден.'
              : 'Не удалось проверить статус заказа.'
          )
        }

        if (!cancelled) {
          setOrder(data.order ?? null)
          if (!data.order) setError('Информация о заказе недоступна.')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка сети. Попробуйте ещё раз.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadOrder()
    return () => {
      cancelled = true
    }
  }, [orderId])

  const isPaid = order?.status === 'paid'
  const isPending = order?.status === 'pending_payment'
  const isRejected = order?.status === 'rejected'

  return (
    <main className="flex min-h-[100svh] flex-col bg-[#080807] text-[#f2eee4]">
      <header className="border-b border-[#302d24] bg-[#11110e] px-4 py-4">
        <div className="text-lg font-black tracking-[4px]">RUM</div>
        <div className="mt-1 text-[9px] font-bold tracking-[2px] text-[#a18b58]">
          СТАТУС ЗАКАЗА
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center gap-6 px-4 py-10 text-center">
        {loading ? (
          <>
            <div className="grid h-20 w-20 place-items-center rounded-full border border-[#51452c] bg-[#211d13] text-3xl text-[#d8b45a]">…</div>
            <div>
              <h1 className="text-xl font-black">Проверяем заказ</h1>
              <p className="mt-2 text-sm text-[#918b7d]">Получаем актуальную информацию об оплате.</p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="grid h-20 w-20 place-items-center rounded-full border border-red-900/60 bg-red-950/30 text-3xl text-red-300">!</div>
            <div>
              <h1 className="text-xl font-black">Не удалось проверить заказ</h1>
              <p className="mt-2 text-sm leading-6 text-[#918b7d]">{error}</p>
            </div>
            <button type="button" onClick={() => window.location.reload()} className="rounded-xl border border-[#51452c] px-6 py-3 text-xs font-bold text-[#d8b45a]">
              Повторить проверку
            </button>
          </>
        ) : isPaid ? (
          <>
            <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-[#d8b45a] bg-[#211d13] text-4xl text-[#d8b45a]">✓</div>
            <div>
              <div className="text-[9px] font-black tracking-[2px] text-[#a18b58]">PAYMENT CONFIRMED</div>
              <h1 className="mt-2 text-2xl font-black">Оплата получена!</h1>
              <p className="mt-2 text-sm text-[#918b7d]">Платёж подтверждён в сети TON.</p>
            </div>
          </>
        ) : isPending ? (
          <>
            <div className="grid h-20 w-20 place-items-center rounded-full border border-[#51452c] bg-[#211d13] text-3xl text-[#d8b45a]">…</div>
            <div>
              <h1 className="text-xl font-black">Ожидаем оплату</h1>
              <p className="mt-2 text-sm leading-6 text-[#918b7d]">Транзакция пока не найдена. Статус заказа ещё не подтверждён.</p>
            </div>
            <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-[#d8b45a] px-6 py-3 text-xs font-black text-[#17130a]">
              Проверить оплату
            </button>
          </>
        ) : isRejected ? (
          <>
            <div className="grid h-20 w-20 place-items-center rounded-full border border-red-900/60 bg-red-950/30 text-3xl text-red-300">!</div>
            <div>
              <h1 className="text-xl font-black">Заказ отклонён</h1>
              <p className="mt-2 text-sm leading-6 text-[#918b7d]">Время ожидания оплаты истекло. Обратись в поддержку, если ты уже отправил платёж.</p>
            </div>
          </>
        ) : (
          <>
            <div className="grid h-20 w-20 place-items-center rounded-full border border-[#51452c] bg-[#211d13] text-3xl text-[#d8b45a]">i</div>
            <div>
              <h1 className="text-xl font-black">Статус заказа обновлён</h1>
              <p className="mt-2 text-sm text-[#918b7d]">Текущий статус: {order?.status}</p>
            </div>
          </>
        )}

        {order && (
          <section className="w-full rounded-2xl border border-[#302d24] bg-[#151511] p-4 text-left">
            <div className="mb-4 text-[9px] font-black tracking-[2px] text-[#a18b58]">ИНФОРМАЦИЯ О ЗАКАЗЕ</div>
            <div className="mb-4 text-xs text-[#918b7d]">Заказ №{order.order_number}</div>
            <div className="flex flex-col gap-3">
              {(order.items ?? []).map((item) => (
                <div key={item.product_id} className="flex justify-between gap-3 text-xs">
                  <span className="text-[#c0b69f]">{item.name} ×{item.qty}</span>
                  <span className="text-[#f2eee4]">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-[#302d24] pt-4">
              <span className="text-sm font-bold">Итого</span>
              <span className="text-lg font-black text-[#d8b45a]">${Number(order.total_usd).toFixed(2)} USDT</span>
            </div>
            {order.ton_tx_hash && (
              <div className="mt-4 border-t border-[#302d24] pt-3">
                <div className="text-[9px] font-bold tracking-[1px] text-[#918b7d]">ХЕШ ТРАНЗАКЦИИ</div>
                <p className="mt-2 break-all font-mono text-[10px] text-[#c0b69f]">{order.ton_tx_hash}</p>
              </div>
            )}
          </section>
        )}

        {isPaid && <p className="text-xs leading-6 text-[#918b7d]">Информация о заказе передана магазину.</p>}
      </div>

      <footer className="border-t border-[#302d24] bg-[#11110e] p-4">
        <button type="button" onClick={() => router.push('/catalog')} className="mx-auto flex h-14 w-full max-w-[560px] items-center justify-center rounded-xl border border-[#51452c] text-xs font-black tracking-wide text-[#d8b45a]">
          ВЕРНУТЬСЯ В КАТАЛОГ
        </button>
      </footer>
    </main>
  )
}
