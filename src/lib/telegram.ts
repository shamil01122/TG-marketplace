import { createHmac, timingSafeEqual } from 'crypto'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
photo_url?: string
}

export function validateInitData( initData: string, botToken: string, maxAgeSeconds = 8640): boolean {
  if (!initData || !botToken) return false

  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    const authDate = params.get('auth_date')

    if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) return false
    if (!authDate || !/^\d+$/.test(authDate)) return false

    const timestamp = Number(authDate)
    const now = Math.floor(Date.now() / 1000)

    if (!Number.isSafeInteger(timestamp)) return false
    if (timestamp > now + 30 || now - timestamp > maxAgeSeconds) return false

    params.delete('hash')

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest()

    const receivedHash = Buffer.from(hash, 'hex')

    return receivedHash.length === calculatedHash.length &&
      timingSafeEqual(receivedHash, calculatedHash)
  } catch {
    return false
  }
}

export function parseTelegramUser(
  initData: string,
  botToken = process.env.TELEGRAM_BOT_TOKEN,
): TelegramUser | null {
  if (!botToken || !validateInitData(initData, botToken)) return null

  try {
    const params = new URLSearchParams(initData)
    const userString = params.get('user')
    if (!userString) return null

    const user: unknown = JSON.parse(userString)

    if (
      typeof user !== 'object' ||
      user === null ||
      !('id' in user) ||
      !Number.isSafeInteger(user.id) ||
      typeof user.id !== 'number' ||
      !('first_name' in user) ||
      typeof user.first_name !== 'string'
    ) {
      return null
    }

    return user as TelegramUser
  } catch {
    return null
  }
}
