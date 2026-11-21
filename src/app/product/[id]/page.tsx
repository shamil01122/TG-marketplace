
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { InferSelectModel } from 'drizzle-orm'
import type { products } from '@/lib/db/schema'
import { useCartStore } from '@/lib/cart'

type Product = InferSelectModel<typeof products>

const EMOJI: Record<string, string> = {
  preroll: '🌿',
  gummy: '🍬',
  oil: '💧',
  other: '📦',
}

const CATEGORY_NAMES: Record<string, string> = {
  preroll: 'Преролл',
  gummy: 'Жевательные конфеты',
  oil: 'Масло',
  other: 'Другое',
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError('')

    fetch('/api/products')
      .then((response) => {
        if (!response.ok) throw new Error('Не удалось загрузить товары')
        return response.json()
      })
      .then((products: Product[]) => {
        if (cancelled) return

        const found = products.find((item) => item.id === id) ?? null
        setProduct(found)

        if (!found) setError('Этот товар не найден.')
      })
      .catch(() => {
        if (!cancelled) {
          setError('Не удалось загрузить товар. Проверь подключение и попробуй ещё раз.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const handleAdd = () => {
    if (!product) return

    for (let i = 0; i < qty; i++) {
      addItem(product)
    }

    router.back()
  }

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#080807] text-sm text-[#a18b58]">
        Загружаем товар...
      </main>
    )
  }

  if (!product) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center gap-5 bg-[#080807] px-6 text-center text-[#f2eee4]">
        <div className="text-5xl">📦</div>

        <h1 className="text-xl font-black">
          Товар недоступен
        </h1>

        <p className="max-w-xs text-sm leading-6 text-[#918b7d]">
          {error || 'Не удалось найти этот товар.'}
        </p>

        <button
          type="button"
          onClick={() => router.push('/catalog')}
          className="rounded-xl bg-[#d8b45a] px-6 py-3 text-xs font-black text-[#17130a]"
        >
          Вернуться в каталог
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-semibold text-[#a18b58]"
        >
          Назад
        </button>
      </main>
    )
  }

  const category = CATEGORY_NAMES[product.category] ?? product.category

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

        <span className="text-lg font-black tracking-[4px]">
          RUM
        </span>

        <button
          type="button"
          onClick={() => router.push('/cart')}
          className="text-xs font-semibold text-[#d8b45a]"
        >
          Корзина
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-4 pb-6">
        <div className="pb-4 pt-6">
          <div className="text-[9px] font-black tracking-[2px] text-[#a18b58]">
            RUM MARKET
          </div>

          <h1 className="mt-2 text-2xl font-black leading-tight">
            {product.name}
          </h1>
        </div>

        <div className="relative flex aspect-square max-h-[390px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#302d24] bg-[#151511]">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-8xl">
              {EMOJI[product.category] ?? '📦'}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="rounded-full border border-[#51452c] bg-[#211d13] px-3 py-1.5 text-[10px] font-bold text-[#d8b45a]">
            {category}
          </span>

          <span className="text-[10px] font-semibold tracking-wide text-[#77736b]">
            RUM COLLECTION
          </span>
        </div>

        <section className="mt-5">
          <h2 className="text-[10px] font-black tracking-[2px] text-[#a18b58]">
            О ТОВАРЕ
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#c0b69f]">
            {product.description || 'Описание товара пока не добавлено.'}
          </p>
        </section>

        <div className="mt-auto pt-8">
          <div className="flex items-center justify-between border-t border-[#302d24] py-5">
            <div>
              <div className="text-[9px] font-bold tracking-[1.5px] text-[#918b7d]">
                ЦЕНА
              </div>

              <div className="mt-1 text-2xl font-black text-[#d8b45a]">
                ${Number(product.price_usd).toFixed(2)}
              </div>
            </div>

            <div>
              <div className="mb-2 text-right text-[9px] font-bold tracking-[1.5px] text-[#918b7d]">
                КОЛИЧЕСТВО
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="h-9 w-9 rounded-xl border border-[#393326] bg-[#151511] text-lg font-bold text-[#f2eee4] disabled:opacity-40"
                  aria-label="Уменьшить количество"
                >
                  −
                </button>

                <span className="w-5 text-center text-sm font-bold">
                  {qty}
                </span>

                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="h-9 w-9 rounded-xl bg-[#d8b45a] text-lg font-bold text-[#17130a]"
                  aria-label="Увеличить количество"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#d8b45a] text-xs font-black tracking-wide text-[#17130a]"
          >
            ДОБАВИТЬ В КОРЗИНУ · ${(Number(product.price_usd) * qty).toFixed(2)}
            <span>🛒</span>
          </button>
        </div>
      </div>
    </main>
  )
}
