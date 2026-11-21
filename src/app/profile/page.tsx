
'use client'

import { useEffect, useState } from 'react'
import RumBottomNav from '@/components/rum/bottom-nav'

interface Profile {
  username: string
  displayName: string
  avatarUrl: string
}

const panelStyle = {
  background: 'linear-gradient(145deg, #191919, #101010)',
  border: '1px solid #292929',
  borderRadius: 22,
} as const

const menuItems = [
  {
    icon: '🎁',
    title: 'Мои подарки',
    description: 'Твои уникальные Telegram-подарки',
    href: '/sell',
  },
  {
    icon: '📋',
    title: 'Мои сделки',
    description: 'История покупок, продаж и резервов',
    href: '/rum/deals',
  },
  {
    icon: '❤️',
    title: 'Избранное',
    description: 'Подарки, которые тебе понравились',
    href: '/favorites',
  },
  {
    icon: '🛒',
    title: 'Корзина',
    description: 'Подарки, которые ты добавил',
    href: '/rum-cart',
  },
  {
    icon: '💎',
    title: 'Каталог RUM',
    description: 'Открыть коллекции и NFT-подарки',
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
            username: typeof parsed.username === 'string' ? parsed.username : '',
            displayName: typeof parsed.displayName === 'string' ? parsed.displayName : '',
            avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : '',
          })
        }
      }
    } catch {
      console.error('RUM: Не удалось загрузить профиль')
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#050505] px-5 pt-7 pb-32 text-white">
      <style jsx>{`
        .menu-card {
          transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
        }
        .menu-card:active {
          transform: scale(0.985);
        }
        @media (hover: hover) {
          .menu-card:hover {
            background: #222222 !important;
            border-color: #454545 !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[560px]">
        <header className="mb-8 flex items-center justify-between">
          <a
            href="/"
            className="text-2xl font-black tracking-[5px] text-white no-underline"
          >
            RUM
          </a>

          <span className="rounded-full border border-[#303030] bg-[#151515] px-4 py-2 text-xs font-semibold text-gray-400">
            Личный кабинет
          </span>
        </header>

        <section
          style={panelStyle}
          className="relative overflow-hidden p-6 text-center"
        >
          <div
            className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-white opacity-[0.045] blur-[65px]"
          />

          <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[#444444] bg-[#292929] text-5xl shadow-[0_10px_40px_#00000088]">
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
            <div className="mb-2 text-[10px] font-extrabold tracking-[2px] text-gray-500">
              RUM MEMBER
            </div>

            <h1 className="text-2xl font-black tracking-tight">
              {profile?.displayName || 'Пользователь RUM'}
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              {profile?.username
                ? `@${profile.username}`
                : 'Telegram-профиль'}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#343434] bg-[#202020] px-3 py-2 text-[10px] font-bold tracking-wide text-gray-300">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              УЧАСТНИК RUM
            </div>
          </div>
        </section>

        <section
          style={panelStyle}
          className="mt-5 overflow-hidden p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold tracking-[1.8px] text-gray-500">
                TON WALLET
              </div>

              <div className="mt-2 text-2xl font-black">
                — <span className="text-base text-gray-400">TON</span>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Кошелёк пока не подключён
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#383838] bg-[#242424] text-2xl">
              💎
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#303030] bg-[#0b0b0b] px-3 py-3 text-center text-[11px] leading-5 text-gray-500">
            Подключение TON-кошелька появится в одном из следующих обновлений.
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black">Мой аккаунт</h2>
            <span className="text-[10px] font-bold tracking-widest text-gray-600">
              ACCOUNT
            </span>
          </div>

          <div className="space-y-3">
            {menuItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="menu-card flex items-center gap-4 rounded-2xl border border-[#292929] bg-[#151515] p-4 no-underline"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#333333] bg-[#222222] text-2xl">
                  {item.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">
                    {item.title}
                  </div>
                  <div className="mt-1 text-[11px] leading-4 text-gray-500">
                    {item.description}
                  </div>
                </div>

                <span className="text-2xl font-light text-gray-600">
                  ›
                </span>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-8 text-center">
          <div className="text-[10px] font-black tracking-[5px] text-gray-600">
            RUM
          </div>
          <p className="mt-2 text-[10px] text-gray-700">
            Unique Telegram Gifts Marketplace
          </p>
        </div>
      </div>

      <RumBottomNav />
    </main>
  )
}
