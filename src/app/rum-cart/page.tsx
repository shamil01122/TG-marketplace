
'use client'

import Link from 'next/link'
import RumBottomNav from '@/components/rum/bottom-nav'
import { useRumCart } from '@/lib/rum/cart'

export default function RumCartPage() {
  const items = useRumCart((state) => state.items)
  const removeGift = useRumCart((state) => state.removeGift)
  const updateQty = useRumCart((state) => state.updateQty)
  const clear = useRumCart((state) => state.clear)

  const total = items.reduce(
    (sum, item) => sum + item.priceTon * item.qty,
    0,
  )

  return (
    <main style={{ minHeight: '100vh', background: '#f7f8f5', padding: 20, paddingBottom: 110, color: '#20251f' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <Link href="/catalog" style={{ color: '#68715f', textDecoration: 'none' }}>← Каталог</Link>
        <strong style={{ fontSize: 23, letterSpacing: 3 }}>RUM</strong>
      </header>

      <h1 style={{ fontSize: 29, fontWeight: 800, marginBottom: 8 }}>Корзина</h1>
      <p style={{ color: '#858d7e', marginBottom: 24 }}>Твои выбранные подарки</p>

      {items.length === 0 ? (
        <section style={{ textAlign: 'center', padding: '65px 15px', background: '#fff', borderRadius: 22 }}>
          <div style={{ fontSize: 55 }}>🎁</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '15px 0 8px' }}>Корзина пока пуста</h2>
          <p style={{ color: '#858d7e', marginBottom: 22 }}>Выбери подарок в каталоге RUM</p>
          <Link href="/catalog" style={{ display: 'inline-block', background: '#c9f04a', padding: '13px 22px', borderRadius: 13, color: '#20251f', textDecoration: 'none', fontWeight: 800 }}>
            Перейти в каталог
          </Link>
        </section>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 13 }}>
            {items.map((item) => (
              <article key={item.giftId} style={{ display: 'flex', gap: 14, padding: 15, background: '#fff', borderRadius: 18, alignItems: 'center' }}>
                <div style={{ width: 75, height: 75, flexShrink: 0, borderRadius: 15, background: '#eef0e9', display: 'grid', placeItems: 'center', fontSize: 38 }}>
                  {item.image}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{item.name}</strong>
                  <p style={{ color: '#858d7e', fontSize: 12, margin: '5px 0' }}>{item.rarity}</p>
                  <strong>{item.priceTon} TON</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 9 }}>
                    <button onClick={() => updateQty(item.giftId, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.giftId, item.qty + 1)}>+</button>
                    <button onClick={() => removeGift(item.giftId)} style={{ marginLeft: 8, color: '#b45b51' }}>Удалить</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section style={{ background: '#fff', borderRadius: 18, padding: 18, marginTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
              <span>Итого</span>
              <span>{total.toFixed(2)} TON</span>
            </div>
            <p style={{ color: '#858d7e', fontSize: 12, lineHeight: 1.5, marginTop: 12 }}>
              Демонстрационная корзина. Реальные покупки и платежи пока не подключены.
            </p>
            <button onClick={clear} style={{ marginTop: 12, color: '#b45b51', background: 'none', border: 0, cursor: 'pointer' }}>
              Очистить корзину
            </button>
          </section>
        </>
      )}
      <RumBottomNav />
    </main>
  )
}
