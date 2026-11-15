'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string
        ready: () => void
        expand: () => void
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
        }
      }
    }
  }
}

export default function TelegramInit() {
  const pathname = usePathname()

  useEffect(() => {
    const webApp = window.Telegram?.WebApp

    if (!webApp) return

    webApp.ready()
    webApp.expand()
    webApp.setHeaderColor('#f7f8f5')
    webApp.setBackgroundColor('#f7f8f5')

    const backButton = webApp.BackButton

    if (pathname !== '/') {
      backButton.show()
      const handleBack = () => window.history.back()
      backButton.onClick(handleBack)

      return () => {
        backButton.offClick(handleBack)
        backButton.hide()
      }
    }

    backButton.hide()
  }, [pathname])

  return null
}
