
'use client'

import { useEffect } from 'react'

export default function TelegramAuth() {
  useEffect(() => {
    let cancelled = false

    async function authenticate() {
      for (let attempt = 0; attempt < 20; attempt++) {
        if (cancelled) return

        const initData = window.Telegram?.WebApp?.initData

        if (initData) {
          try {
            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ initData }),
            })

            if (!response.ok) {
              console.error('RUM: Telegram authentication failed:', response.status)
              return
            }

            const data = await response.json()

            if (!cancelled) {
              localStorage.setItem('rum_profile', JSON.stringify(data.profile))
              console.info('RUM: Profile authenticated')
            }

            return
          } catch (error) {
            console.error('RUM: Authentication connection error:', error)
            return
          }
        }

        await new Promise(resolve => setTimeout(resolve, 500))
      }

      console.error('RUM: Telegram initData not available')
    }

    authenticate()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
