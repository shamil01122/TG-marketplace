import RumBottomNav from '@/components/rum/bottom-nav'
import Link from 'next/link'
import TelegramAuth from '@/components/telegram-auth'

const gifts = [
  { name: 'Plush Pepe', collection: 'PLUSH PEPE', price: '125 TON', rarity: 'RARE', emoji: '🐸', bg: 'from-[#414039] to-[#22221f]' },
  { name: 'Durov’s Cap', collection: 'CAPS', price: '48 TON', rarity: 'POPULAR', emoji: '🧢', bg: 'from-[#343a40] to-[#202124]' },
  { name: 'Signet Ring', collection: 'JEWELRY', price: '32 TON', rarity: 'COLLECTIBLE', emoji: '💍', bg: 'from-[#494034] to-[#25211d]' },
  { name: 'Magic Potion', collection: 'POTIONS', price: '19 TON', rarity: 'NEW', emoji: '🧪', bg: 'from-[#393044] to-[#211e27]' },
]

const categories = ['ALL GIFTS', 'RARE', 'NEW', 'COLLECTIONS']

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-[520px] overflow-hidden bg-[#080808] pb-24 text-[#f2eee5]">
      <TelegramAuth />

      <header className="flex items-center justify-between px-5 pb-6 pt-7">
        <div>
          <div className="text-[36px] font-black leading-none tracking-[-0.09em]">
            RUM
          </div>
          <div className="mt-2 text-[9px] font-bold tracking-[0.28em] text-[#8b8578]">
            GIFTS CULTURE
          </div>
        </div>
        <div className="rounded-xl border border-[#333333] bg-[#1b1b1b] px-4 py-2.5">
          <div className="text-[9px] tracking-widest text-[#8b8578]">YOUR BALANCE</div>
          <div className="mt-1 text-sm font-bold">— <span className="text-[#bdbdbd]">TON</span></div>
        </div>
      </header>

      <section className="px-4">
        <div className="relative overflow-hidden rounded-[26px] border border-[#444444] bg-gradient-to-br from-[#202020] via-[#1d1c18] to-[#151512] p-6">
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#383838]/10 blur-3xl" />
          <div className="relative">
            <div className="text-[10px] font-bold tracking-[0.22em] text-[#bdbdbd]">
              THE TELEGRAM GIFTS MARKET
            </div>
            <h1 className="mt-7 text-[43px] font-black uppercase leading-[0.94] tracking-[-0.065em]">
              YOUR GIFTS.<br />
              <span className="text-[#bdbdbd]">YOUR RULES.</span>
            </h1>
            <p className="mt-5 max-w-[250px] text-sm leading-6 text-[#bdbdbd]">
              Находи редкие подарки. Собирай свою коллекцию. Будь частью культуры.
            </p>
            <Link href="/catalog" className="mt-7 inline-flex items-center gap-4 rounded-xl bg-[#383838] px-5 py-3.5 text-xs font-black tracking-wider text-[#f2f2f2] transition hover:bg-[#d8b879]">
              EXPLORE MARKET <span className="text-base">↗</span>
            </Link>
          </div>
          <div className="pointer-events-none absolute bottom-5 right-3 rotate-[-12deg] text-[86px] opacity-80">
            🎁
          </div>
          <div className="absolute bottom-4 right-5 text-[8px] font-bold tracking-[0.2em] text-[#bdbdbd]/60">
            RUM 2026
          </div>
        </div>
      </section>

      <section className="px-5 pt-7">
        <Link href="/catalog" className="flex items-center gap-3 rounded-xl border border-[#343129] bg-[#1a1916] px-4 py-4 text-sm text-[#8f897d]">
          <span className="text-xl text-[#bdbdbd]">⌕</span>
          Search gifts & collections
          <span className="ml-auto text-lg">→</span>
        </Link>
      </section>

      <section className="pt-8">
        <div className="mb-4 flex items-center justify-between px-5">
          <h2 className="text-xs font-black tracking-[0.2em]">DISCOVER</h2>
          <span className="text-[9px] tracking-widest text-[#827b6e]">01 / CATEGORIES</span>
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 pb-1">
          {categories.map((category, index) => (
            <Link key={category} href="/catalog" className={`shrink-0 rounded-lg px-4 py-3 text-[9px] font-black tracking-widest ${index === 0 ? 'bg-[#383838] text-[#f2f2f2]' : 'border border-[#333333] bg-[#1b1b1b] text-[#bdbdbd]'}`}>
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="mb-2 text-[9px] font-bold tracking-[0.2em] text-[#bdbdbd]">CURATED SELECTION</div>
            <h2 className="text-2xl font-black tracking-[-0.05em]">Trending gifts<span className="text-[#bdbdbd]">.</span></h2>
          </div>
          <Link href="/catalog" className="pb-1 text-[10px] font-bold tracking-wider text-[#bdbdbd]">VIEW ALL ↗</Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {gifts.map((gift, index) => (
            <Link href="/catalog" key={gift.name} className="overflow-hidden rounded-2xl border border-[#343129] bg-[#1a1916]">
              <div className={`relative flex aspect-[1/1.05] items-center justify-center bg-gradient-to-br ${gift.bg}`}>
                <span className="text-[76px] drop-shadow-2xl">{gift.emoji}</span>
                <span className="absolute left-2.5 top-2.5 rounded-md border border-[#bdbdbd]/30 bg-[#202020]/80 px-2 py-1 text-[8px] font-bold tracking-wider text-[#d0d0d0]">
                  {gift.rarity}
                </span>
                <span className="absolute bottom-2.5 right-2.5 text-[9px] text-white/40">
                  0{index + 1}
                </span>
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-extrabold">{gift.name}</div>
                <div className="mt-1 text-[9px] font-semibold tracking-[0.15em] text-[#827b6e]">{gift.collection}</div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-black text-[#d0d0d0]">{gift.price}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#383838] text-sm text-[#f2f2f2]">↗</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-center text-[9px] tracking-wider text-[#706b60]">
          DEMO ITEMS · NOT REAL LISTINGS
        </p>
      </section>

      <section className="px-5 pb-5 pt-9">
        <Link href="/sell" className="flex items-center justify-between rounded-2xl border border-[#444444] bg-[#171717] p-5">
          <div>
            <div className="text-[9px] font-bold tracking-[0.2em] text-[#bdbdbd]">GOT SOMETHING RARE?</div>
            <div className="mt-2 text-xl font-black">Make it yours.</div>
            <div className="mt-1 text-xs text-[#999183]">List your gift on RUM</div>
          </div>
          <span className="text-3xl text-[#bdbdbd]">↗</span>
        </Link>
      </section>

      <RumBottomNav />
    </main>
  )
}
