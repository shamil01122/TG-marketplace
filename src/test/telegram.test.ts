import { createHmac } from 'crypto'
import { describe, it, expect } from 'vitest'
import { parseTelegramUser, validateInitData } from '@/lib/telegram'

const TEST_TOKEN = '123456:TEST_TOKEN_FOR_UNIT_TESTS'

function createSignedInitData(user: object, authDate = Math.floor(Date.now() / 1000)) {
  const params = new URLSearchParams()
  params.set('auth_date', String(authDate))
  params.set('user', JSON.stringify(user))

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = createHmac('sha256', 'WebAppData')
    .update(TEST_TOKEN)
    .digest()

  const hash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  params.set('hash', hash)
  return params.toString()
}

describe('Telegram authentication', () => {
  it('rejects empty initData', () => {
    expect(parseTelegramUser('', TEST_TOKEN)).toBeNull()
  })

  it('accepts correctly signed initData', () => {
    const user = { id: 123, first_name: 'Test', username: 'testuser' }
    const initData = createSignedInitData(user)

    expect(validateInitData(initData, TEST_TOKEN)).toBe(true)
    expect(parseTelegramUser(initData, TEST_TOKEN)?.id).toBe(123)
  })

  it('rejects a forged hash', () => {
    const initData = createSignedInitData({ id: 123, first_name: 'Test' })
      .replace(/hash=[^&]+/, `hash=${'a'.repeat(64)}`)

    expect(parseTelegramUser(initData, TEST_TOKEN)).toBeNull()
  })

  it('rejects expired initData', () => {
    const oldDate = Math.floor(Date.now() / 1000) - 90000
    const initData = createSignedInitData(
      { id: 123, first_name: 'Test' },
      oldDate,
    )

    expect(validateInitData(initData, TEST_TOKEN)).toBe(false)
  })
})
