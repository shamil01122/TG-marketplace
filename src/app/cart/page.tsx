
'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart'
import { CartItemRow } from '@/components/cart-item'

const DELIVERY_FEE = 3

export default function CartPage() {
  const router = useRouter()
  const { items, total } = useCartStore()

  if (items.length === 0) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center gap-5 bg-[#080807] px-6 text-center text-[#f2eee4]">
        <Link
          href="/"
          className="absolute left-5 top-6 text-xl font-black tracking-[4px] text-[#f2eee4] no-underline"
        >
          RUM
        </Link>

        <div className="grid h-20 w-20 place-items-center rounded-3xl border border-[#51452c] bg-[#211d13] text-4xl">
          🛒
        </div>

        <div>
          <h1 className="text-xl font-black">Корзина пуста</h1>
          <p className="mt-2 text-sm text-[#918b7d]">
            Добавь товары, чтобы оформить заказ.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/catalog')}
          className="rounded-xl bg-[#d8b45a] px-6 py-3.5 text-xs font-black text-[#17130a]"
        >
          Перейти в каталог
        </button>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-xs font-semibold text-[#a18b58]"
        >
          На главную
        </button>
      </main>
    )
  }

  const subtotal = total()
  const grandTotal = subtotal + DELIVERY_FEE

  return (
    <main className="flex min-h-[100svh] flex-col bg-[#080807] text-[#f2eee4]">
      <header className="flex items-center justify-between border-b border-[#302d24] bg-[#11110e] px-4 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xl text-[#c0b69f]"
          aria-label="Назад"
        >
          ←
        </button>

        <Link
          href="/"
          className="text-xl font-black tracking-[4px] text-[#f2eee4] no-underline"
        >
          RUM
        </Link>

        <span className="text-[10px] font-semibold text-[#918b7d]">
          {items.length} шт.
        </span>
      </header>

      <div className="mx-auto w-full max-w-[560px] flex-1">
        <section className="px-4 pb-5 pt-6">
          <div className="text-[9px] font-black tracking-[2px] text-[#a18b58]">
            YOUR ORDER
          </div>

          <h1 className="mt-2 text-2xl font-black">
            Корзина
          </h1>

          <p className="mt-1 text-xs text-[#918b7d]">
            Проверь товары перед оформлением заказа.
          </p>
        </section>

        <section className="mx-4 overflow-hidden rounded-2xl border border-[#302d24] bg-[#151511]">
          {items.map((item, index) => (
            <div
              key={item.product_id}
              className={
                index !== items.length - 1
                  ? 'border-b border-[#302d24]'
                  : ''
              }
            >
              <CartItemRow item={item} />
            </div>
          ))}
        </section>

        <section className="mx-4 mt-4 rounded-2xl border border-[#302d24] bg-[#151511] p-4">
          <div className="mb-4 text-[10px] font-black tracking-[2px] text-[#a18b58]">
            СТОИМОСТЬ ЗАКАЗА
          </div>

          <div className="flex justify-between gap-3 text-xs text-[#a49b88]">
            <span>Товары</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="mt-3 flex justify-between gap-3 text-xs text-[#a49b88]">
            <span>Доставка</span>
            <span>${DELIVERY_FEE.toFixed(2)}</span>
          </div>

          <div className="mt-4 flex justify-between gap-3 border-t border-[#393326] pt-4">
            <span className="text-sm font-bold">Итого</span>
            <span className="text-lg font-black text-[#d8b45a]">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </section>

        <div className="mx-4 mt-4 rounded-xl border border-[#51452c] bg-[#211d13] p-3 text-[10px] leading-5 text-[#b9a77e]">
          Стоимость указана в долларах. Это корзина старого магазина, отдельно от каталога Telegram-подарков RUM.
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-[#302d24] bg-[#11110e] p-4">
        <div className="mx-auto max-w-[560px]">
          <button
            type="button"
            onClick={() => router.push('/checkout')}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#d8b45a] text-xs font-black tracking-wide text-[#17130a]"
          >
            ПЕРЕЙТИ К ОФОРМЛЕНИЮ · ${grandTotal.toFixed(2)}
          </button>
        </div>
      </footer>
    </main>
  )
}
