'use client'

import { useEffect } from 'react'

export default function TelegramAuth() {
  useEffect(() => {
    let cancelled = false

    async function authenticate() {
      const initData = window.Telegram?.WebApp?.initData

      if (!initData) return

      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        })

        if (!response.ok) {
          console.error('RUM: Telegram authentication failed')
          return
        }

        const data = await response.json()

        if (!cancelled) {
          localStorage.setItem('rum_profile', JSON.stringify(data.profile))
console.info('RUM: Profile authenticated')
        }
      } catch {
        console.error('RUM: Could not connect to authentication server')
      }
    }

    authenticate()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
