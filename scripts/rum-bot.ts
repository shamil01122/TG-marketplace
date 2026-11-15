import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { Bot, InlineKeyboard } from 'grammy'

const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN не найден')
}

const bot = new Bot(token)

bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('🎁 Открыть RUM', 'open_rum')

  await ctx.reply(
    'Добро пожаловать в RUM! 🎁\n\nТвой мир Telegram-подарков.',
    { reply_markup: keyboard },
  )
})

bot.callbackQuery('open_rum', async (ctx) => {
  await ctx.answerCallbackQuery({
    text: 'RUM скоро откроется!',
  })
})

bot.catch((error) => {
  console.error('RUM bot error:', error)
})

bot.start()
console.log('RUM bot запущен!')
