
'use client'

import { useEffect, useState } from 'react'
import RumBottomNav from '@/components/rum/bottom-nav'

interface Profile {
  username: string
  displayName: string
  avatarUrl: string
}

const panelStyle = {
  background: 'linear-gradient(145deg, #191916, #10100e)',
  border: '1px solid #302d24',
  borderRadius: 20,
} as const

const menuItems = [
  {
    icon: '🎁',
    title: 'Мои подарки',
    description: 'Твои уникальные Telegram-подарки',
    href: '/sell',
  },
  {
    icon: '▤',
    title: 'Мои сделки',
    description: 'История покупок, продаж и резервов',
    href: '/rum/deals',
  },
  {
    icon: '♡',
    title: 'Избранное',
    description: 'Подарки, которые тебе понравились',
    href: '/favorites',
  },
  {
    icon: '▣',
    title: 'Корзина',
    description: 'Подарки, которые ты добавил',
    href: '/rum-cart',
  },
  {
    icon: '◇',
    title: 'Каталог RUM',
    description: 'Коллекции и уникальные подарки',
    href: '/catalog',
  },
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rum_profile')

      if (saved) {
        const parsed = JSON.parse(saved)

        if (parsed && typeof parsed === 'object') {
          setProfile({
            username:
              typeof parsed.username === 'string' ? parsed.username : '',
            displayName:
              typeof parsed.displayName === 'string'
                ? parsed.displayName
                : '',
            avatarUrl:
              typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : '',
          })
        }
      }
    } catch {
      console.error('RUM: Не удалось загрузить профиль')
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#080807] px-4 pt-6 pb-32 text-white">
      <style jsx>{`
        .menu-card {
          transition:
            background 160ms ease,
            border-color 160ms ease,
            transform 160ms ease;
        }

        .menu-card:active {
          transform: scale(0.985);
        }

        @media (hover: hover) {
          .menu-card:hover {
            background: #201f1a !important;
            border-color: #65532e !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[560px]">
        <header className="mb-7 flex items-center justify-between">
          <a
            href="/"
            className="text-[25px] font-black tracking-[5px] text-[#f3eee2] no-underline"
          >
            RUM
          </a>

          <span className="rounded-full border border-[#393326] bg-[#171610] px-3 py-2 text-[10px] font-bold tracking-wide text-[#c5b994]">
            ЛИЧНЫЙ КАБИНЕТ
          </span>
        </header>

        <section
          style={panelStyle}
          className="relative overflow-hidden p-6 text-center"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-[#d8b45a] opacity-[0.09] blur-[65px]" />

          <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[#8a713d] bg-[#242116] text-4xl shadow-[0_10px_40px_#00000088]">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Аватар пользователя"
                className="h-full w-full object-cover"
              />
            ) : (
              '👤'
            )}
          </div>

          <div className="relative">
            <div className="mb-2 text-[10px] font-extrabold tracking-[2.5px] text-[#a18b58]">
              RUM MEMBER
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#f5f0e5]">
              {profile?.displayName || 'Пользователь RUM'}
            </h1>

            <p className="mt-2 text-sm text-[#918d82]">
              {profile?.username
                ? `@${profile.username}`
                : 'Telegram-профиль'}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#51452c] bg-[#211d13] px-3 py-2 text-[10px] font-bold tracking-wide text-[#d8b45a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d8b45a]" />
              УЧАСТНИК RUM
            </div>
          </div>
        </section>

        <section style={panelStyle} className="mt-4 overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold tracking-[2px] text-[#a18b58]">
                TON WALLET
              </div>

              <div className="mt-2 text-2xl font-black text-[#f2eee4]">
                — <span className="text-base text-[#928d80]">TON</span>
              </div>

              <p className="mt-1 text-xs text-[#858174]">
                Кошелёк пока не подключён
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#51452c] bg-[#211d13] text-2xl">
              💎
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#393326] bg-[#0b0b09] px-3 py-3 text-center text-[11px] leading-5 text-[#858174]">
            Подключение TON-кошелька появится в одном из следующих обновлений.
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#f2eee4]">
              Мой аккаунт
            </h2>

            <span className="text-[10px] font-bold tracking-[2px] text-[#8c784c]">
              ACCOUNT
            </span>
          </div>

          <div className="space-y-2.5">
            {menuItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="menu-card flex items-center gap-3 rounded-2xl border border-[#302d24] bg-[#151511] p-3.5 no-underline"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#423923] bg-[#211e15] text-xl text-[#d8b45a]">
                  {item.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#f0ece2]">
                    {item.title}
                  </div>

                  <div className="mt-1 text-[11px] leading-4 text-[#858174]">
                    {item.description}
                  </div>
                </div>

                <span className="pr-1 text-2xl font-light text-[#a18b58]">
                  ›
                </span>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-9 text-center">
          <div className="text-[11px] font-black tracking-[6px] text-[#a18b58]">
            RUM
          </div>

          <p className="mt-2 text-[10px] text-[#625e53]">
            Unique Telegram Gifts Marketplace
          </p>
        </div>
      </div>

      <RumBottomNav />
    </main>
  )
}
