
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/cart'

const DELIVERY_FEE = 3

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#151511',
  color: '#f2eee4',
  fontSize: 13,
  borderRadius: 12,
  padding: '13px 14px',
  outline: 'none',
  border: '1px solid #302d24',
  resize: 'none',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: '#a18b58',
  fontWeight: 700,
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clear } = useCartStore()
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const grandTotal = total() + DELIVERY_FEE

  const handleSubmit = async () => {
    if (address.trim().length < 10) {
      setError('Адрес слишком короткий. Укажите минимум 10 символов.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const initData = window.Telegram?.WebApp?.initData ?? ''

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData,
          items,
          delivery_address: address.trim(),
          delivery_note: note.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Не удалось создать заказ')
        setLoading(false)
        return
      }

      clear()

      router.push(
        `/pay/${data.order.id}?uri=${encodeURIComponent(data.paymentUri)}&memo=${encodeURIComponent(data.memo)}`
      )
    } catch {
      setError('Ошибка сети. Попробуйте ещё раз.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[100svh] flex-col bg-[#080807] text-[#f2eee4]">
      <header className="flex items-center gap-4 border-b border-[#302d24] bg-[#11110e] px-4 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xl text-[#c0b69f]"
          aria-label="Назад"
        >
          ←
        </button>

        <div>
          <div className="text-[9px] font-black tracking-[2px] text-[#a18b58]">
            RUM MARKET
          </div>
          <h1 className="mt-1 text-base font-black">
            Оформление заказа
          </h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-6 px-4 py-6">
        <section>
          <div className="mb-4">
            <div className="text-[9px] font-black tracking-[2px] text-[#a18b58]">
              ШАГ 01
            </div>
            <h2 className="mt-2 text-lg font-black">
              Доставка
            </h2>
            <p className="mt-1 text-xs text-[#918b7d]">
              Укажи адрес получения заказа.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span style={labelStyle}>
                Адрес доставки *
              </span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Улица, дом, район, город..."
                rows={3}
                style={inputStyle}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span style={labelStyle}>
                Примечание курьеру
              </span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Квартира, домофон и другие детали..."
                style={inputStyle}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-[#302d24] bg-[#151511] p-4">
          <div className="mb-4">
            <div className="text-[9px] font-black tracking-[2px] text-[#a18b58]">
              ШАГ 02
            </div>
            <h2 className="mt-2 text-lg font-black">
              Твой заказ
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex justify-between gap-3 text-xs"
              >
                <span className="text-[#c0b69f]">
                  {item.name} ×{item.qty}
                </span>
                <span className="font-semibold text-[#f2eee4]">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between border-t border-[#302d24] pt-4 text-xs">
            <span className="text-[#918b7d]">
              Доставка
            </span>
            <span>${DELIVERY_FEE.toFixed(2)}</span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#302d24] pt-4">
            <span className="text-sm font-bold">
              Итого
            </span>
            <span className="text-xl font-black text-[#d8b45a]">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-3 text-xs leading-5 text-red-300">
            {error}
          </div>
        )}

        <p className="text-center text-[10px] leading-5 text-[#77736b]">
          Проверь адрес и состав заказа перед подтверждением.
        </p>
      </div>

      <footer className="sticky bottom-0 border-t border-[#302d24] bg-[#11110e] p-4">
        <div className="mx-auto max-w-[560px]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#d8b45a] text-xs font-black tracking-wide text-[#17130a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'ОБРАБАТЫВАЕМ ЗАКАЗ...'
              : `ПОДТВЕРДИТЬ · $${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </footer>
    </main>
  )
}
