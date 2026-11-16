
'use client'

import RumBottomNav from '@/components/rum/bottom-nav'
import { useEffect, useMemo, useState } from 'react'
import { useRumCart } from '@/lib/rum/cart'
import { useRumFavorites } from '@/lib/rum/favorites'

type Listing = {
  id: string
  priceTon: string
  createdAt: string
  gift: {
    id: string
    name: string
    collection: string
    model: string
    backdrop: string
    symbol: string
    imageUrl: string
  }
  seller: {
    username: string
    displayName: string
  }
}

export default function CatalogPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('recommended')
  const [priceFilter, setPriceFilter] = useState('all')
  const [selected, setSelected] = useState<Listing | null>(null)

  const favorites = useRumFavorites((state) => state.items)
  const toggleFavorite = useRumFavorites((state) => state.toggleFavorite)
  const addGift = useRumCart((state) => state.addGift)
  const cartCount = useRumCart((state) => state.itemCount())

  useEffect(() => {
    let cancelled = false

    async function loadListings() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch('/api/rum/listings', {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Не удалось загрузить объявления')
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Сервер вернул неверный формат данных')
        }

        if (!cancelled) {
          setListings(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Не удалось загрузить каталог',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadListings()

    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    const collections = Array.from(
      new Set(
        listings
          .map((item) => item.gift.collection)
          .filter(Boolean),
      ),
    )

    return [
      { id: 'all', label: 'Все подарки' },
      ...collections.map((name) => ({ id: name, label: name })),
    ]
  }, [listings])

  const filtered = useMemo(() => {
    let result = listings.filter((listing) => {
      const gift = listing.gift
      const seller = listing.seller

      const searchText = [
        gift.name,
        gift.collection,
        gift.model,
        seller.username,
        seller.displayName,
      ].join(' ').toLowerCase()

      const matchesSearch = searchText.includes(search.toLowerCase())
      const matchesCategory =
        category === 'all' || gift.collection === category

      const price = Number(listing.priceTon)

      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'under50' && price < 50) ||
        (priceFilter === '50to100' && price >= 50 && price <= 100) ||
        (priceFilter === 'over100' && price > 100)

      return matchesSearch && matchesCategory && matchesPrice
    })

    if (sort === 'cheap') {
      result = [...result].sort(
        (a, b) => Number(a.priceTon) - Number(b.priceTon),
      )
    }

    if (sort === 'expensive') {
      result = [...result].sort(
        (a, b) => Number(b.priceTon) - Number(a.priceTon),
      )
    }

    return result
  }, [listings, search, category, sort, priceFilter])

  const panelStyle = {
    background: '#1b1b1b',
    border: '1px solid #333333',
    borderRadius: 18,
  } as const

  const formatPrice = (price: string) =>
    Number(price).toLocaleString('ru-RU', {
      maximumFractionDigits: 4,
    })

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
          <div style={{ color: '#bdbdbd', fontSize: 11, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>
            МИР TELEGRAM-ПОДАРКОВ
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 6vw, 46px)', lineHeight: 1.05, margin: '0 0 12px', letterSpacing: -1.5 }}>
            Найди свой<br />редкий экземпляр.
          </h1>

          <p style={{ color: '#bdbdbd', fontSize: 14, margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
            Исследуй реальные объявления, открывай коллекции и выбирай подарки.
          </p>
        </section>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <h2 style={{ fontSize: 22, margin: 0, letterSpacing: -0.6 }}>
            Каталог подарков
          </h2>
          <span style={{ color: '#888888', fontSize: 12 }}>
            {loading ? 'Загрузка…' : `${filtered.length} объявлений`}
          </span>
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 15, top: 13, fontSize: 17 }}>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск подарков..."
            aria-label="Поиск подарков"
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px 15px 14px 43px', border: '1px solid #333333', borderRadius: 14, background: '#1b1b1b', color: '#f2f2f2', fontSize: 14, outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 5, marginBottom: 13 }}>
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => setCategory(item.id)}
              style={{ whiteSpace: 'nowrap', border: '1px solid', borderColor: category === item.id ? '#bdbdbd' : '#333333', background: category === item.id ? '#bdbdbd' : '#1b1b1b', color: category === item.id ? '#080808' : '#bdbdbd', padding: '10px 15px', borderRadius: 30, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 9, marginBottom: 19 }}>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Сортировка"
            style={{ ...panelStyle, flex: 1, minWidth: 0, padding: '11px 9px', color: '#f2f2f2', fontSize: 12 }}
          >
            <option value="recommended">Сначала новые</option>
            <option value="cheap">Сначала дешевле</option>
            <option value="expensive">Сначала дороже</option>
          </select>

          <select
            value={priceFilter}
            onChange={(event) => setPriceFilter(event.target.value)}
            aria-label="Фильтр по цене"
            style={{ ...panelStyle, flex: 1, minWidth: 0, padding: '11px 9px', color: '#f2f2f2', fontSize: 12 }}
          >
            <option value="all">Любая цена</option>
            <option value="under50">До 50 TON</option>
            <option value="50to100">50–100 TON</option>
            <option value="over100">От 100 TON</option>
          </select>
        </div>

        {loading && (
          <div style={{ ...panelStyle, textAlign: 'center', padding: 35, color: '#bdbdbd' }}>
            Загружаем объявления…
          </div>
        )}

        {!loading && error && (
          <div style={{ ...panelStyle, textAlign: 'center', padding: 35, color: '#e0a0a0' }}>
            {error}
            <button
              onClick={() => window.location.reload()}
              style={{ display: 'block', margin: '15px auto 0', padding: '10px 16px', borderRadius: 12, border: 0, cursor: 'pointer' }}
            >
              Повторить
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 215px), 1fr))', gap: 14 }}>
              {filtered.map((listing) => {
                const gift = listing.gift
                const isFavorite = favorites.some(
                  (item) => item.listingId === listing.id,
                )

                return (
                  <article key={listing.id} style={{ ...panelStyle, overflow: 'hidden', position: 'relative' }}>
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                      style={{ position: 'absolute', zIndex: 1, right: 11, top: 11, width: 34, height: 34, borderRadius: 50, border: '1px solid #444444', background: '#252525', color: '#f2f2f2', fontSize: 18, cursor: 'pointer' }}
                    >
                      {isFavorite ? '♥' : '♡'}
                    </button>

                    <button
                      onClick={() => setSelected(listing)}
                      style={{ width: '100%', border: 0, padding: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'inherit' }}
                    >
                      <div style={{ height: 175, background: '#202020', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 15 }}>
                        {gift.imageUrl ? (
                          <img
                            src={gift.imageUrl}
                            alt={gift.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <span style={{ fontSize: 70 }}>🎁</span>
                        )}

                        {gift.collection && (
                          <span style={{ position: 'absolute', left: 11, bottom: 10, background: '#252525', borderRadius: 20, padding: '5px 9px', color: '#d0d0d0', fontSize: 10, fontWeight: 800 }}>
                            {gift.collection}
                          </span>
                        )}
                      </div>

                      <div style={{ padding: '14px 14px 15px' }}>
                        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
                          {gift.name}
                        </div>

                        <div style={{ color: '#888888', fontSize: 11, marginBottom: 14 }}>
                          {gift.model || 'Модель не указана'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#bdbdbd', fontSize: 10 }}>
                            ЦЕНА ПРОДАВЦА
                          </span>
                          <strong style={{ fontSize: 16 }}>
                            {formatPrice(listing.priceTon)} TON
                          </strong>
                        </div>
                      </div>
                    </button>
                  </article>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div style={{ ...panelStyle, textAlign: 'center', padding: 35, color: '#bdbdbd' }}>
                {listings.length === 0
                  ? 'Пока нет активных объявлений. Загляни позже или выставь свой подарок на продажу.'
                  : 'Ничего не найдено. Попробуй изменить поиск или фильтры.'}
              </div>
            )}
          </>
        )}

        <p style={{ textAlign: 'center', color: '#888888', fontSize: 11, lineHeight: 1.6, marginTop: 25 }}>
          Цены указаны продавцами. Добавление в корзину пока не является покупкой. Оплата и передача подарков ещё не подключены.
        </p>
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 10, background: '#080807dd', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 12 }}
        >
          <section
            onClick={(event) => event.stopPropagation()}
            style={{ width: '100%', maxWidth: 480, background: '#1b1b1b', borderRadius: 24, padding: 22, marginBottom: 10 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#999999', fontSize: 11, fontWeight: 800 }}>
                ОБЪЯВЛЕНИЕ ПРОДАВЦА
              </span>
              <button
                onClick={() => setSelected(null)}
                style={{ border: 0, background: '#333333', color: '#f2f2f2', borderRadius: 30, width: 32, height: 32, fontSize: 18, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ height: 180, borderRadius: 18, background: '#202020', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 15, margin: '14px 0' }}>
              {selected.gift.imageUrl ? (
                <img
                  src={selected.gift.imageUrl}
                  alt={selected.gift.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: 80 }}>🎁</span>
              )}
            </div>

            <h2 style={{ margin: '0 0 5px', fontSize: 25 }}>
              {selected.gift.name}
            </h2>

            <p style={{ color: '#bdbdbd', margin: '0 0 17px', fontSize: 13 }}>
              {[selected.gift.collection, selected.gift.model].filter(Boolean).join(' · ')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#bdbdbd' }}>Продавец</span>
              <strong>
                {selected.seller.displayName ||
                  (selected.seller.username ? `@${selected.seller.username}` : 'Не указан')}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ color: '#bdbdbd' }}>Цена</span>
              <strong style={{ fontSize: 19 }}>
                {formatPrice(selected.priceTon)} TON
              </strong>
            </div>

            <div style={{ background: '#252525', borderRadius: 12, padding: 13, color: '#bdbdbd', fontSize: 12, lineHeight: 1.5 }}>
              Это объявление из базы RUM. Добавление в корзину не резервирует подарок и не выполняет покупку.
            </div>

            <button
              onClick={() => {
                addGift({
                  listingId: selected.id,
                  name: selected.gift.name,
                  priceTon: Number(selected.priceTon),
                  imageUrl: selected.gift.imageUrl,
                  collection: selected.gift.collection,
                  model: selected.gift.model,
                })
                setSelected(null)
              }}
              style={{ width: '100%', marginTop: 16, padding: 15, border: 0, borderRadius: 14, background: '#383838', color: '#f2f2f2', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
            >
              Добавить в корзину · {formatPrice(selected.priceTon)} TON
            </button>
          </section>
        </div>
      )}

      <RumBottomNav />
    </main>
  )
}
