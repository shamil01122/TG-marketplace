'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { icon: '⌂', label: 'Главная', href: '/' },
  { icon: '▦', label: 'Каталог', href: '/catalog' },
  { icon: '+', label: 'Продать', href: '/sell' },
  { icon: '♡', label: 'Избранное', href: '/favorites' },
  { icon: '○', label: 'Профиль', href: '/profile' },
]

export default function RumBottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      width: '100%',
      maxWidth: 520,
      padding: '10px 8px max(12px, env(safe-area-inset-bottom))',
      background: '#111111ed',
      borderTop: '1px solid #333333',
      backdropFilter: 'blur(12px)',
    }}>
      {items.map((item) => {
        const active = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              color: active ? '#ffffff' : '#999999',
              textDecoration: 'none',
              fontWeight: active ? 800 : 600,
            }}
          >
            <span style={{ fontSize: 22, lineHeight: '24px' }}>
              {item.icon}
            </span>
            <span style={{ fontSize: 10 }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
