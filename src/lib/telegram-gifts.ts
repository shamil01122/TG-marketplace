import 'server-only'
import { Bot } from 'grammy'

export async function getTelegramNftGifts(telegramUserId: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN не настроен')
  }

  const bot = new Bot(token)
  const allGifts = []
  let offset: string | undefined

  do {
    const result = await bot.api.getUserGifts(telegramUserId, {
      limit: 100,
      ...(offset ? { offset } : {}),
    })

    allGifts.push(
      ...result.gifts
        .filter((item) => item.type === 'unique')
        .map((item) => ({
          name: item.gift.name,
          baseName: item.gift.base_name,
          number: item.gift.number,
          model: item.gift.model.name,
          symbol: item.gift.symbol.name,
modelStickerFileId: item.gift.model.sticker.file_id,
symbolStickerFileId: item.gift.symbol.sticker.file_id,
          backdrop: item.gift.backdrop.name,
          sendDate: item.send_date,
          isFromBlockchain: item.gift.is_from_blockchain === true,
          isBurned: item.gift.is_burned === true,
        })),
    )

    offset = result.next_offset || undefined
  } while (offset)

  return allGifts
}