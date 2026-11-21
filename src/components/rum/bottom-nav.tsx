
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
    <nav
      aria-label="Основная навигация"
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        width: '100%',
        maxWidth: 560,
        padding: '9px 8px max(12px, env(safe-area-inset-bottom))',
        background: 'rgba(12, 12, 12, 0.96)',
        borderTop: '1px solid #29251c',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      {items.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href ||
              pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              minHeight: 43,
              color: active ? '#D8B45A' : '#77736b',
              textDecoration: 'none',
              fontWeight: active ? 800 : 600,
              transition: 'color 160ms ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span
              style={{
                fontSize: item.icon === '+' ? 25 : 22,
                lineHeight: '24px',
                fontWeight: 500,
              }}
            >
              {item.icon}
            </span>

            <span
              style={{
                fontSize: 10,
                letterSpacing: 0.15,
              }}
            >
              {item.label}
            </span>

            <span
              style={{
                width: 14,
                height: 2,
                marginTop: 1,
                borderRadius: 5,
                background: active ? '#D8B45A' : 'transparent',
              }}
            />
          </Link>
        )
      })}
    </nav>
  )
}
