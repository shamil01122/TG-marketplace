import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import TelegramInit from '@/components/telegram-init'

export const metadata: Metadata = {
  title: 'RUM — Telegram Gifts Marketplace',
  description: 'Покупай, продавай и собирай коллекционные подарки Telegram.',
  applicationName: 'RUM',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#080808',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className="min-h-screen w-full"
        style={{
          background: 'var(--bg)',
          margin: 0,
          padding: 0,
        }}
      >
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <TelegramInit />
        {children}
      </body>
    </html>
  )
}
