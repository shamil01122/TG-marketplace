'use client'

import RumBottomNav from '@/components/rum/bottom-nav'
import { useMemo, useState } from 'react'
import { useRumCart } from '@/lib/rum/cart'
import { useRumFavorites } from '@/lib/rum/favorites'
type Gift = {
  id: number
  name: string
  model: string
  emoji: string
  price: number
  rarity: string
  category: 'rare' | 'limited' | 'popular'
  color: string
  number: string
}

const gifts: Gift[] = [
  { id: 1, name: 'Plush Pepe', model: 'Коллекционная серия', emoji: '🐸', price: 125, rarity: 'Легендарный', category: 'rare', color: '#b8d6b1', number: '#0081' },
  { id: 2, name: "Durov's Cap", model: 'Особый экземпляр', emoji: '🧢', price: 48, rarity: 'Редкий', category: 'limited', color: '#c5c4e9', number: '#0248' },
  { id: 3, name: 'Toy Bear', model: 'Медовая серия', emoji: '🧸', price: 32, rarity: 'Редкий', category: 'popular', color: '#e8c8a9', number: '#1032' },
  { id: 4, name: 'Evil Rabbit', model: 'Тёмная коллекция', emoji: '🐰', price: 89, rarity: 'Эпический', category: 'rare', color: '#d4b6c8', number: '#0089' },
  { id: 5, name: 'Jelly Bunny', model: 'Весенняя серия', emoji: '🐇', price: 19, rarity: 'Обычный', category: 'popular', color: '#b9d8dc', number: '#2019' },
  { id: 6, name: 'Love Candle', model: 'Романтическая серия', emoji: '🕯️', price: 56, rarity: 'Редкий', category: 'limited', color: '#e9c2bd', number: '#0056' },
  { id: 7, name: 'Diamond Ring', model: 'Ювелирная коллекция', emoji: '💍', price: 210, rarity: 'Легендарный', category: 'rare', color: '#b8cde8', number: '#0210' },
  { id: 8, name: 'Golden Duck', model: 'Золотая серия', emoji: '🦆', price: 74, rarity: 'Эпический', category: 'limited', color: '#e8d59e', number: '#0074' },
]

const categories = [
  { id: 'all', label: 'Все подарки' },
  { id: 'rare', label: 'Редкие' },
  { id: 'limited', label: 'Лимитированные' },
  { id: 'popular', label: 'Популярные' },
] as const

export default function CatalogPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('recommended')
  const [priceFilter, setPriceFilter] = useState('all')
  const favorites = useRumFavorites((state) => state.items)
  const toggleFavorite = useRumFavorites((state) => state.toggleFavorite)
  const [selected, setSelected] = useState<Gift | null>(null)
const addGift = useRumCart((state) => state.addGift)
const cartCount = useRumCart((state) => state.itemCount())
  const filtered = useMemo(() => {
    let result = gifts.filter((gift) => {
      const matchesSearch = `${gift.name} ${gift.model}`.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || gift.category === category
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'under50' && gift.price < 50) ||
        (priceFilter === '50to100' && gift.price >= 50 && gift.price <= 100) ||
        (priceFilter === 'over100' && gift.price > 100)
      return matchesSearch && matchesCategory && matchesPrice
    })

    if (sort === 'cheap') result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'expensive') result = [...result].sort((a, b) => b.price - a.price)
    return result
  }, [search, category, sort, priceFilter])

  const panelStyle = {
    background: '#1b1b1b',
    border: '1px solid #333333',
    borderRadius: 18,
  } as const

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#f2f2f2', paddingBottom: 100 }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '22px 18px 40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <a href="/" style={{ color: '#f2f2f2', textDecoration: 'none', fontSize: 25, fontWeight: 900, letterSpacing: 2 }}>
            RUM
          </a>
                      <a
              href="/rum-cart"
              style={{
                fontSize: 13,
                color: '#f2f2f2',
                background: '#383838',
                borderRadius: 30,
                padding: '10px 16px',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              🛒 Корзина ({cartCount})
            </a>
        </header>

        <section style={{ ...panelStyle, padding: '25px 22px', marginBottom: 22, background: 'linear-gradient(120deg, #202020, #202020)' }}>
          <div style={{ color: '#bdbdbd', fontSize: 11, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>МИР TELEGRAM-ПОДАРКОВ</div>
          <h1 style={{ fontSize: 'clamp(30px, 6vw, 46px)', lineHeight: 1.05, margin: '0 0 12px', letterSpacing: -1.5 }}>
            Найди свой<br />редкий экземпляр.
          </h1>
          <p style={{ color: '#bdbdbd', fontSize: 14, margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
            Исследуй коллекции, открывай необычные подарки и собирай свою коллекцию.
          </p>
        </section>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <h2 style={{ fontSize: 22, margin: 0, letterSpacing: -0.6 }}>Каталог подарков</h2>
          <span style={{ color: '#888888', fontSize: 12 }}>{filtered.length} предметов</span>
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 15, top: 13, fontSize: 17 }}>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск подарков..."
            aria-label="Поиск подарков"
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px 15px 14px 43px', border: '1px solid #333333', borderRadius: 14, background: '#1b1b1b', fontSize: 14, outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 5, marginBottom: 13 }}>
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => setCategory(item.id)}
              style={{ whiteSpace: 'nowrap', border: '1px solid', borderColor: category === item.id ? '#bdbdbd' : '#333333', background: category === item.id ? '#bdbdbd' : '#1b1b1b', color: category === item.id ? '#f2f2f2' : '#bdbdbd', padding: '10px 15px', borderRadius: 30, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 9, marginBottom: 19 }}>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Сортировка" style={{ ...panelStyle, flex: 1, minWidth: 0, padding: '11px 9px', color: '#f2f2f2', fontSize: 12 }}>
            <option value="recommended">Сначала интересные</option>
            <option value="cheap">Сначала дешевле</option>
            <option value="expensive">Сначала дороже</option>
          </select>
          <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)} aria-label="Фильтр по цене" style={{ ...panelStyle, flex: 1, minWidth: 0, padding: '11px 9px', color: '#f2f2f2', fontSize: 12 }}>
            <option value="all">Любая цена</option>
            <option value="under50">До 50 TON</option>
            <option value="50to100">50–100 TON</option>
            <option value="over100">От 100 TON</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 215px), 1fr))', gap: 14 }}>
          {filtered.map((gift) => (
            <article key={gift.id} style={{ ...panelStyle, overflow: 'hidden', position: 'relative' }}>
              <button
                onClick={() => toggleFavorite(gift)}
                aria-label="Добавить в избранное"
                style={{ position: 'absolute', zIndex: 1, right: 11, top: 11, width: 34, height: 34, borderRadius: 50, border: '1px solid #444444', background: '#252525', fontSize: 18, cursor: 'pointer' }}
              >
                {favorites.some((item) => item.id === gift.id) ? '♥' : '♡'}
              </button>
              <button onClick={() => setSelected(gift)} style={{ width: '100%', border: 0, padding: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'inherit' }}>
                <div style={{ height: 175, background: `linear-gradient(145deg, #202020, #171717)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ fontSize: 82, filter: 'drop-shadow(0 12px 10px #00000018)' }}>{gift.emoji}</span>
                  <span style={{ position: 'absolute', left: 11, bottom: 10, background: '#252525', borderRadius: 20, padding: '5px 9px', color: '#d0d0d0', fontSize: 10, fontWeight: 800 }}>{gift.rarity}</span>
                  <span style={{ position: 'absolute', right: 11, bottom: 10, color: '#bdbdbd', fontSize: 10 }}>{gift.number}</span>
                </div>
                <div style={{ padding: '14px 14px 15px' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{gift.name}</div>
                  <div style={{ color: '#888888', fontSize: 11, marginBottom: 14 }}>{gift.model}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#bdbdbd', fontSize: 10 }}>ДЕМО-ЦЕНА</span>
                    <strong style={{ fontSize: 16 }}>{gift.price} TON</strong>
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ ...panelStyle, textAlign: 'center', padding: 35, color: '#bdbdbd' }}>
            Ничего не найдено. Попробуй изменить поиск или фильтры.
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#888888', fontSize: 11, lineHeight: 1.6, marginTop: 25 }}>
          Демонстрационный каталог RUM. Подарки, номера и цены условные — это не реальные объявления и не предложения о продаже.
        </p>
      </div>

            {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10,
            background: '#080807dd',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 12,
          }}
        >
          <section
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#1b1b1b',
              borderRadius: 24,
              padding: 22,
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#999999', fontSize: 11, fontWeight: 800 }}>
                КАРТОЧКА ПОДАРКА
              </span>
              <button
                onClick={() => setSelected(null)}
                style={{ border: 0, background: '#333333', borderRadius: 30, width: 32, height: 32, fontSize: 18, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ height: 180, borderRadius: 18, background: `linear-gradient(145deg, #202020, #171717)`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 92, margin: '14px 0' }}>
              {selected.emoji}
            </div>

            <h2 style={{ margin: '0 0 5px', fontSize: 25 }}>{selected.name}</h2>
            <p style={{ color: '#bdbdbd', margin: '0 0 17px', fontSize: 13 }}>
              {selected.model} · {selected.number}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ color: '#bdbdbd' }}>Редкость: {selected.rarity}</span>
              <strong style={{ fontSize: 19 }}>{selected.price} TON</strong>
            </div>

            <div style={{ background: '#252525', borderRadius: 12, padding: 13, color: '#bdbdbd', fontSize: 12, lineHeight: 1.5 }}>
              Демонстрационный предмет. Покупка и реальные платежи пока не подключены.
            </div>

            <button
              onClick={() => {
                addGift({
                  giftId: String(selected.id),
                  name: selected.name,
                  priceTon: selected.price,
                  image: selected.emoji,
                  collection: selected.model,
                  model: selected.model,
                  rarity: selected.rarity,
                })
                setSelected(null)
              }}
              style={{
                width: '100%',
                marginTop: 16,
                padding: 15,
                border: 0,
                borderRadius: 14,
                background: '#383838',
                color: '#f2f2f2',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Добавить в корзину · {selected.price} TON
            </button>
          </section>
        </div>
      )}
      <RumBottomNav />
    </main>
  )
}
