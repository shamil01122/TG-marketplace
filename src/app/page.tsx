import RumBottomNav from '@/components/rum/bottom-nav'
import Link from 'next/link'
import TelegramAuth from '@/components/telegram-auth'

const categories = [
  { name: 'Все подарки', icon: '✳' },
  { name: 'Редкие', icon: '💎' },
  { name: 'Новые', icon: '✨' },
  { name: 'Коллекции', icon: '🎁' },
]

const gifts = [
  { name: 'Plush Pepe', collection: 'Plush Pepe', price: '125 TON', rarity: 'Редкий', emoji: '🐸', bg: 'bg-[#d8edbd]' },
  { name: 'Durov’s Cap', collection: 'Caps', price: '48 TON', rarity: 'Популярный', emoji: '🧢', bg: 'bg-[#d9e5f7]' },
  { name: 'Signet Ring', collection: 'Jewelry', price: '32 TON', rarity: 'Коллекционный', emoji: '💍', bg: 'bg-[#f4dfbd]' },
  { name: 'Magic Potion', collection: 'Potions', price: '19 TON', rarity: 'Новый', emoji: '🧪', bg: 'bg-[#e8d9f5]' },
]

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-[520px] bg-[#f7f8f5] pb-24 text-[#171914]">
      <TelegramAuth />
      <header className="flex items-center justify-between px-5 pb-5 pt-7">
        <div>
          <div className="text-[32px] font-black tracking-[-0.09em]">RUM<span className="text-[#a4ce37]">.</span></div>
          <div className="text-[10px] font-semibold tracking-[0.18em] text-[#85877f]">GIFTS MARKETPLACE</div>
        </div>
        <div className="rounded-2xl border border-[#e8eae3] bg-white px-4 py-2.5">
          <div className="text-[10px] text-[#85877f]">Мой баланс</div>
          <div className="text-sm font-bold">— TON</div>
        </div>
      </header>

      <section className="px-5">
        <div className="rounded-[26px] bg-[#1b1d18] p-5 text-white">
          <div className="text-xs font-semibold tracking-[0.16em] text-[#b8c0a9]">ТВОЯ КОЛЛЕКЦИЯ НАЧИНАЕТСЯ ЗДЕСЬ</div>
          <h1 className="mt-3 text-[30px] font-black leading-[1.05] tracking-[-0.05em]">
            Найди подарок.<br />Поймай редкость.
          </h1>
          <p className="mt-3 max-w-[260px] text-sm leading-5 text-[#b8bdb1]">
            Исследуй мир коллекционных подарков Telegram.
          </p>
          <Link href="/catalog" className="mt-5 inline-flex rounded-xl bg-[#c9ef62] px-5 py-3 text-sm font-bold text-[#20251a]">
            Открыть каталог <span className="ml-2">↗</span>
          </Link>
          <div className="pointer-events-none float-right -mt-20 mr-1 text-[76px]">🎁</div>
        </div>
      </section>

      <section className="px-5 pt-6">
        <Link href="/catalog" className="flex items-center gap-3 rounded-2xl border border-[#e8eae3] bg-white px-4 py-3.5 text-sm text-[#85877f]">
          <span className="text-lg">⌕</span>
          Поиск подарков и коллекций
          <span className="ml-auto text-xs">→</span>
        </Link>
      </section>

      <section className="pt-6">
        <div className="mb-3 flex items-center justify-between px-5">
          <h2 className="text-lg font-extrabold tracking-tight">Категории</h2>
          <Link href="/catalog" className="text-xs font-semibold text-[#7e9e2b]">Все →</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 pb-1">
          {categories.map((category, index) => (
            <Link key={category.name} href="/catalog" className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${index === 0 ? 'bg-[#c9ef62] text-[#20251a]' : 'border border-[#e8eae3] bg-white'}`}>
              <span>{category.icon}</span>{category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pt-7">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Популярные подарки</h2>
            <p className="mt-0.5 text-xs text-[#85877f]">Знакомство с коллекциями</p>
          </div>
          <Link href="/catalog" className="text-xs font-semibold text-[#7e9e2b]">Каталог →</Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {gifts.map((gift) => (
            <Link href="/catalog" key={gift.name} className="overflow-hidden rounded-[20px] border border-[#e8eae3] bg-white">
              <div className={`relative flex aspect-[1.12/1] items-center justify-center ${gift.bg}`}>
                <span className="text-[76px] drop-shadow-sm">{gift.emoji}</span>
                <span className="absolute left-2.5 top-2.5 rounded-lg bg-white/80 px-2 py-1 text-[9px] font-bold">{gift.rarity}</span>
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-extrabold">{gift.name}</div>
                <div className="mt-0.5 text-[11px] text-[#85877f]">{gift.collection}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-black">{gift.price}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c9ef62] text-sm">↗</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-[#999b92]">Демонстрационные карточки · Не реальные объявления</p>
      </section>

      <RumBottomNav />
    </main>
  )
}
