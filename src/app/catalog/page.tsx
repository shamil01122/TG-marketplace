
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
    modelRarity: string
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

const gold = '#D8B45A'
const muted = '#85827A'

const panelStyle = {
  background: '#111110',
  border: '1px solid #292821',
  borderRadius: 15,
} as const

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
    padding: '12px 10px',
    color: '#E9E5DA',
    fontSize: 11,
    outline: 'none',
    background: '#141411',
  } as const

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#080807',
        color: '#F2F0E9',
        paddingBottom: 105,
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          padding: '12px 13px 30px',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 19,
            padding: '5px 1px',
          }}
        >
          <a
            href="/"
            style={{
              color: '#F4E9CC',
              textDecoration: 'none',
              fontSize: 24,
              fontWeight: 950,
              letterSpacing: 3,
            }}
          >
            RUM<span style={{ color: gold }}>.</span>
          </a>

          <a
            href="/rum-cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              color: '#E8E1D0',
              background: '#171611',
              border: '1px solid #393323',
              borderRadius: 30,
              padding: '9px 13px',
              textDecoration: 'none',
              fontWeight: 750,
            }}
          >
            <span>🛒</span>
            Корзина
            <span style={{ color: gold, fontWeight: 900 }}>
              {cartCount}
            </span>
          </a>
        </header>

        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 15,
          }}
        >
          <div>
            <div
              style={{
                color: gold,
                fontSize: 9,
                fontWeight: 850,
                letterSpacing: 2,
                marginBottom: 5,
              }}
            >
              RUM MARKETPLACE
            </div>
            <h1
              style={{
                fontSize: 27,
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: -0.8,
                fontWeight: 900,
              }}
            >
              Все подарки
            </h1>
          </div>

          <span
            style={{
              color: '#85827A',
              fontSize: 10,
              whiteSpace: 'nowrap',
              paddingBottom: 3,
            }}
          >
            {loading ? 'Загрузка…' : `${filtered.length} лотов`}
          </span>
        </div>

        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: 11,
              fontSize: 20,
              color: gold,
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
              padding: '13px 14px 13px 42px',
              border: '1px solid #302D24',
              borderRadius: 11,
              background: '#12120F',
              color: '#F2F0E9',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 7,
            overflowX: 'auto',
            paddingBottom: 9,
            marginBottom: 8,
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
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: active ? gold : '#302E27',
                  background: active ? gold : '#12120F',
                  color: active ? '#17140D' : '#AAA69B',
                  padding: '9px 13px',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 850,
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
            gap: 8,
            marginBottom: 17,
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
              color: '#99958A',
              fontSize: 12,
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
              color: '#D0C9B8',
              fontSize: 12,
            }}
          >
            {error}
            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'block',
                margin: '17px auto 0',
                padding: '11px 19px',
                borderRadius: 9,
                border: `1px solid ${gold}`,
                background: gold,
                color: '#17140D',
                fontWeight: 850,
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
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 10,
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

                const giftBackground =
                  centerColor && edgeColor
                    ? `radial-gradient(circle at 50% 42%, ${centerColor} 0%, ${edgeColor} 100%)`
                    : 'radial-gradient(circle, #29271F 0%, #171611 60%, #0D0D0B 100%)'

                return (
                  <article
                    key={listing.id}
                    style={{
                      ...panelStyle,
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#11110F',
                      borderColor: '#302D24',
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
                        right: 8,
                        top: 8,
                        width: 32,
                        height: 32,
                        borderRadius: 50,
                        border: '1px solid #FFFFFF38',
                        background: '#11110FCC',
                        backdropFilter: 'blur(8px)',
                        color: isFavorite ? gold : '#E4E0D5',
                        fontSize: 17,
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
                          height: 174,
                          background: giftBackground,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          padding: 9,
                          overflow: 'hidden',
                          boxShadow: centerColor
                            ? `inset 0 0 28px ${centerColor}25`
                            : 'inset 0 0 25px #FFFFFF08',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                              'linear-gradient(180deg, #FFFFFF0A 0%, transparent 48%, #00000030 100%)',
                            pointerEvents: 'none',
                          }}
                        />

                        {gift.imageUrl ? (
                          <img
                            src={gift.imageUrl}
                            alt={gift.name}
                            loading="lazy"
                            style={{
                              position: 'relative',
                              zIndex: 1,
                              width: '90%',
                              height: '90%',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 7px 13px #00000065)',
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 53 }}>🎁</span>
                        )}

                        {gift.number !== null && (
                          <span
                            style={{
                              position: 'absolute',
                              right: 7,
                              bottom: 7,
                              zIndex: 2,
                              background: '#090908D9',
                              border: '1px solid #FFFFFF35',
                              borderRadius: 6,
                              padding: '5px 7px',
                              color: '#FFFFFF',
                              fontSize: 8,
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
                              left: 7,
                              bottom: 7,
                              zIndex: 2,
                              background: '#090908D9',
                              border: '1px solid #FFFFFF30',
                              borderRadius: 6,
                              padding: '5px 7px',
                              color: '#F0E8D5',
                              fontSize: 7,
                              fontWeight: 850,
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

                      <div style={{ padding: '11px 10px 12px' }}>
                        <div
                          style={{
                            fontWeight: 850,
                            fontSize: 12,
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
                            color: muted,
                            fontSize: 9,
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
                              gap: 5,
                              padding: '5px 7px',
                              marginBottom: 9,
                              borderRadius: 5,
                              background: '#D8B45A12',
                              border: '1px solid #D8B45A35',
                              color: '#DCC27D',
                              fontSize: 7,
                              fontWeight: 850,
                              maxWidth: '100%',
                              overflow: 'hidden',
                            }}
                          >
                            <span>✧</span>
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {gift.modelRarity || 'Редкая модель'}
                            </span>
                            {modelRarity && (
                              <span
                                style={{
                                  color: '#F0D78F',
                                  flexShrink: 0,
                                }}
                              >
                                {modelRarity}
                              </span>
                            )}
                          </div>
                        )}

                        <div
                          style={{
                            borderTop: '1px solid #302D24',
                            paddingTop: 9,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              color: '#77746B',
                              fontSize: 8,
                              fontWeight: 850,
                              letterSpacing: 1,
                            }}
                          >
                            ЦЕНА
                          </span>
                          <strong
                            style={{
                              fontSize: 14,
                              color: gold,
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
                  color: '#AAA69B',
                  marginTop: 5,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>⌕</div>
                <div
                  style={{
                    color: '#F2F0E9',
                    fontWeight: 850,
                    marginBottom: 8,
                  }}
                >
                  {listings.length === 0
                    ? 'Пока нет объявлений'
                    : 'Ничего не найдено'}
                </div>
                <div style={{ fontSize: 11, lineHeight: 1.7 }}>
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
            borderTop: '1px solid #29271F',
            marginTop: 25,
            paddingTop: 16,
            textAlign: 'center',
            color: '#706D63',
            fontSize: 9,
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
