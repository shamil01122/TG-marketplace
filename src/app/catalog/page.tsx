
'use client'

import RumBottomNav from '@/components/rum/bottom-nav'
import { useRouter } from 'next/navigation'
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
    number: number | null
    model: string
    modelRarity: string | null
    modelRarityPerMille: number | null
    backdrop: string
    backdropCenterColor: number | null
    backdropEdgeColor: number | null
    backdropSymbolColor: number | null
    backdropTextColor: number | null
    backdropRarityPerMille: number | null
    symbol: string
    symbolRarityPerMille: number | null
    imageUrl: string
  }
  seller: {
    username: string
    displayName: string
  }
}

const panelStyle = {
  background: '#111111',
  border: '1px solid #292929',
  borderRadius: 18,
} as const

const mutedText = '#858585'

function colorHex(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null

  return `#${(value >>> 0).toString(16).padStart(6, '0').slice(-6)}`
}

function formatRarity(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null

  return `${(value / 10).toLocaleString('ru-RU', {
    maximumFractionDigits: 2,
  })}%`
}

export default function CatalogPage() {
  const router = useRouter()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('recommended')
  const [priceFilter, setPriceFilter] = useState('all')

  const favorites = useRumFavorites((state) => state.items)
  const toggleFavorite = useRumFavorites((state) => state.toggleFavorite)
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
        gift.backdrop,
        gift.symbol,
        gift.number,
        seller.username,
        seller.displayName,
      ]
        .join(' ')
        .toLowerCase()

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
    } else if (sort === 'expensive') {
      result = [...result].sort(
        (a, b) => Number(b.priceTon) - Number(a.priceTon),
      )
    } else {
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
    }

    return result
  }, [listings, search, category, sort, priceFilter])

  const formatPrice = (price: string) =>
    Number(price).toLocaleString('ru-RU', {
      maximumFractionDigits: 4,
    })

  const selectStyle = {
    ...panelStyle,
    flex: 1,
    minWidth: 0,
    padding: '13px 12px',
    color: '#eeeeee',
    fontSize: 12,
    outline: 'none',
  } as const

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#f5f5f5',
        paddingBottom: 110,
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          padding: '22px 17px 40px',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 27,
          }}
        >
          <a
            href="/"
            style={{
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: 26,
              fontWeight: 950,
              letterSpacing: 3,
            }}
          >
            RUM
          </a>

          <a
            href="/rum-cart"
            style={{
              fontSize: 12,
              color: '#ffffff',
              background: '#171717',
              border: '1px solid #303030',
              borderRadius: 30,
              padding: '11px 15px',
              textDecoration: 'none',
              fontWeight: 800,
            }}
          >
            🛒 Корзина · {cartCount}
          </a>
        </header>

        <section
          style={{
            ...panelStyle,
            padding: '27px 22px',
            marginBottom: 29,
            background:
              'linear-gradient(145deg, #171717 0%, #0b0b0b 65%, #050505 100%)',
          }}
        >
          <div
            style={{
              color: '#999999',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 2.5,
              marginBottom: 15,
            }}
          >
            RUM MARKETPLACE
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 7vw, 45px)',
              lineHeight: 1.04,
              margin: '0 0 13px',
              letterSpacing: -1.7,
              fontWeight: 900,
            }}
          >
            Найди свой
            <br />
            редкий подарок.
          </h1>

          <p
            style={{
              color: '#999999',
              fontSize: 13,
              margin: 0,
              maxWidth: 390,
              lineHeight: 1.7,
            }}
          >
            Исследуй уникальные Telegram-подарки, открывай коллекции и
            находи редкие экземпляры.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              marginTop: 22,
              padding: '9px 12px',
              borderRadius: 30,
              background: '#202020',
              border: '1px solid #333333',
              color: '#cccccc',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ffffff',
              }}
            />
            УНИКАЛЬНЫЕ ПОДАРКИ
          </div>
        </section>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            marginBottom: 15,
          }}
        >
          <div>
            <div
              style={{
                color: '#777777',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 2,
                marginBottom: 5,
              }}
            >
              EXPLORE
            </div>
            <h2
              style={{
                fontSize: 23,
                margin: 0,
                letterSpacing: -0.7,
                fontWeight: 850,
              }}
            >
              Каталог
            </h2>
          </div>

          <span
            style={{
              color: '#888888',
              fontSize: 11,
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Загрузка…' : `${filtered.length} объявлений`}
          </span>
        </div>

        <div style={{ position: 'relative', marginBottom: 17 }}>
          <span
            style={{
              position: 'absolute',
              left: 16,
              top: 13,
              fontSize: 19,
              color: '#888888',
            }}
          >
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Найти подарок или коллекцию..."
            aria-label="Поиск подарков"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '15px 15px 15px 46px',
              border: '1px solid #292929',
              borderRadius: 15,
              background: '#101010',
              color: '#ffffff',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 7,
            marginBottom: 14,
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((item) => {
            const active = category === item.id

            return (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                style={{
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: active ? '#ffffff' : '#303030',
                  background: active ? '#ffffff' : '#101010',
                  color: active ? '#000000' : '#aaaaaa',
                  padding: '10px 15px',
                  borderRadius: 30,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 9,
            marginBottom: 22,
          }}
        >
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Сортировка"
            style={selectStyle}
          >
            <option value="recommended">Сначала новые</option>
            <option value="cheap">Сначала дешевле</option>
            <option value="expensive">Сначала дороже</option>
          </select>

          <select
            value={priceFilter}
            onChange={(event) => setPriceFilter(event.target.value)}
            aria-label="Фильтр по цене"
            style={selectStyle}
          >
            <option value="all">Любая цена</option>
            <option value="under50">До 50 TON</option>
            <option value="50to100">50–100 TON</option>
            <option value="over100">От 100 TON</option>
          </select>
        </div>

        {loading && (
          <div
            style={{
              ...panelStyle,
              textAlign: 'center',
              padding: 38,
              color: '#999999',
              fontSize: 13,
            }}
          >
            Загружаем подарки…
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              ...panelStyle,
              textAlign: 'center',
              padding: 30,
              color: '#cccccc',
              fontSize: 13,
            }}
          >
            {error}
            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'block',
                margin: '17px auto 0',
                padding: '11px 19px',
                borderRadius: 12,
                border: 0,
                background: '#ffffff',
                color: '#000000',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Повторить
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(min(100%, 215px), 1fr))',
                gap: 11,
              }}
            >
              {filtered.map((listing) => {
                const gift = listing.gift
                const isFavorite = favorites.some(
                  (item) => item.listingId === listing.id,
                )

                const centerColor = colorHex(gift.backdropCenterColor)
                const edgeColor = colorHex(gift.backdropEdgeColor)
                const modelRarity = formatRarity(
                  gift.modelRarityPerMille,
                )

                const giftBackground = centerColor && edgeColor
                  ? `radial-gradient(circle at 50% 42%, ${centerColor} 0%, ${edgeColor} 100%)`
                  : 'radial-gradient(circle, #242424 0%, #141414 58%, #0c0c0c 100%)'

                return (
                  <article
                    key={listing.id}
                    style={{
                      ...panelStyle,
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#0d0d0d',
                      borderColor: '#303030',
                      boxShadow: centerColor
                        ? `0 5px 18px ${centerColor}12`
                        : 'none',
                    }}
                  >
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      aria-label={
                        isFavorite
                          ? 'Убрать из избранного'
                          : 'Добавить в избранное'
                      }
                      style={{
                        position: 'absolute',
                        zIndex: 2,
                        right: 9,
                        top: 9,
                        width: 34,
                        height: 34,
                        borderRadius: 50,
                        border: '1px solid #ffffff35',
                        background: '#101010bb',
                        backdropFilter: 'blur(8px)',
                        color: isFavorite ? '#ffffff' : '#cccccc',
                        fontSize: 18,
                        cursor: 'pointer',
                      }}
                    >
                      {isFavorite ? '♥' : '♡'}
                    </button>

                    <button
                      onClick={() =>
                        router.push(`/rum/gift/${listing.id}`)
                      }
                      style={{
                        width: '100%',
                        border: 0,
                        padding: 0,
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'inherit',
                      }}
                    >
                      <div
                        style={{
                          height: 165,
                          background: giftBackground,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          padding: 12,
                          overflow: 'hidden',
                          boxShadow: centerColor
                            ? `inset 0 0 28px ${centerColor}25`
                            : 'inset 0 0 25px #ffffff06',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                              'linear-gradient(180deg, #ffffff08 0%, transparent 48%, #00000020 100%)',
                            pointerEvents: 'none',
                          }}
                        />

                        {gift.imageUrl ? (
                          <img
                            src={gift.imageUrl}
                            alt={gift.name}
                            style={{
                              position: 'relative',
                              zIndex: 1,
                              width: '86%',
                              height: '86%',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 5px 10px #00000035)',
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 58 }}>🎁</span>
                        )}

                        {gift.number !== null && (
                          <span
                            style={{
                              position: 'absolute',
                              right: 9,
                              bottom: 9,
                              zIndex: 2,
                              background: '#00000085',
                              border: '1px solid #ffffff35',
                              borderRadius: 20,
                              padding: '5px 8px',
                              color: '#ffffff',
                              fontSize: 9,
                              fontWeight: 850,
                            }}
                          >
                            № {gift.number}
                          </span>
                        )}

                        {gift.collection && (
                          <span
                            style={{
                              position: 'absolute',
                              left: 9,
                              bottom: 9,
                              zIndex: 2,
                              background: '#111111bb',
                              border: '1px solid #ffffff30',
                              borderRadius: 20,
                              padding: '5px 8px',
                              color: '#ffffff',
                              fontSize: 8,
                              fontWeight: 800,
                              maxWidth: '65%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {gift.collection}
                          </span>
                        )}
                      </div>

                      <div style={{ padding: '12px 12px 13px' }}>
                        <div
                          style={{
                            fontWeight: 850,
                            fontSize: 14,
                            marginBottom: 5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {gift.name}
                        </div>

                        <div
                          style={{
                            color: mutedText,
                            fontSize: 10,
                            marginBottom: 9,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {gift.model || 'Модель не указана'}
                        </div>

                        {(gift.modelRarity || modelRarity) && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 8px',
                              marginBottom: 10,
                              borderRadius: 20,
                              background: '#1c1c1c',
                              border: '1px solid #333333',
                              color: '#dddddd',
                              fontSize: 8,
                              fontWeight: 800,
                            }}
                          >
                            <span>✧</span>
                            <span>
                              {gift.modelRarity || 'Редкая модель'}
                            </span>
                            {modelRarity && (
                              <>
                                <span style={{ color: '#666666' }}>·</span>
                                <span style={{ color: '#ffffff' }}>
                                  {modelRarity}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        <div
                          style={{
                            borderTop: '1px solid #252525',
                            paddingTop: 10,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              color: '#777777',
                              fontSize: 9,
                              fontWeight: 800,
                              letterSpacing: 0.7,
                            }}
                          >
                            ЦЕНА
                          </span>
                          <strong
                            style={{
                              fontSize: 14,
                              color: '#ffffff',
                              whiteSpace: 'nowrap',
                            }}
                          >
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
              <div
                style={{
                  ...panelStyle,
                  textAlign: 'center',
                  padding: 35,
                  color: '#aaaaaa',
                  marginTop: 5,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>⌕</div>
                <div
                  style={{
                    color: '#ffffff',
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  {listings.length === 0
                    ? 'Пока нет объявлений'
                    : 'Ничего не найдено'}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                  {listings.length === 0
                    ? 'Загляни позже или выставь свой подарок на продажу.'
                    : 'Попробуй изменить поисковый запрос или фильтры.'}
                </div>
              </div>
            )}
          </>
        )}

        <div
          style={{
            borderTop: '1px solid #222222',
            marginTop: 27,
            paddingTop: 17,
            textAlign: 'center',
            color: '#666666',
            fontSize: 10,
            lineHeight: 1.8,
          }}
        >
          Цены устанавливают продавцы. Добавление в корзину пока не является
          покупкой. Оплата и передача подарков ещё не подключены.
        </div>
      </div>

      <RumBottomNav />
    </main>
  )
}
