
'use client'

import { useEffect, useState } from 'react'
import RumBottomNav from '@/components/rum/bottom-nav'

interface Profile {
  username: string
  displayName: string
  avatarUrl: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rum_profile')
      if (saved) setProfile(JSON.parse(saved))
    } catch {
      console.error('RUM: Не удалось загрузить профиль')
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#101114] text-white px-5 py-8 pb-28">
      <header className="flex items-center justify-between mb-8">
        <a href="/" className="text-xl font-black tracking-widest">RUM</a>
        <span className="text-sm text-gray-400">Профиль</span>
      </header>

      <section className="rounded-3xl bg-[#1b1d22] p-6 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#30333b] text-4xl">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Аватар"
              className="h-full w-full object-cover"
            />
          ) : (
            '👤'
          )}
        </div>

        <h1 className="text-xl font-bold">
          {profile?.displayName || 'Пользователь RUM'}
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          {profile?.username ? `@${profile.username}` : 'Telegram-профиль'}
        </p>

        <div className="mt-6 rounded-2xl bg-[#252830] p-4">
          <p className="text-sm text-gray-400">Баланс</p>
          <p className="mt-1 text-2xl font-bold">— TON</p>
          <p className="mt-1 text-xs text-gray-500">
            Подключение кошелька будет позже
          </p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">Мой аккаунт</h2>

        <div className="space-y-2">
          {[
            ['🎁', 'Мои подарки'],
            ['🏷️', 'Мои объявления'],
            ['❤️', 'Избранное'],
            ['🛒', 'Мои покупки'],
            ['💎', 'Мои продажи'],
            ['📜', 'История сделок'],
          ].map(([icon, title]) => (
            <div
              key={title}
              className="flex items-center justify-between rounded-2xl bg-[#1b1d22] p-4"
            >
              <span>{icon} {title}</span>
              <span className="text-gray-500">›</span>
            </div>
          ))}
        </div>
      </section>

      <RumBottomNav />
    </main>
  )
}
