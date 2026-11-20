
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
        .map((item) => {
          const gift = item.gift

          const fileId =
            gift.model.sticker.thumbnail?.file_id ||
            gift.symbol.sticker.thumbnail?.file_id

          return {
            telegramGiftId: `${gift.name}:${gift.number}`,
            name: gift.name,
            baseName: gift.base_name,
            number: gift.number,

            model: gift.model.name,
            modelRarity: gift.model.rarity ?? null,
            modelRarityPerMille: gift.model.rarity_per_mille,

            symbol: gift.symbol.name,
            symbolRarityPerMille: gift.symbol.rarity_per_mille,

            backdrop: gift.backdrop.name,
            backdropCenterColor: gift.backdrop.colors.center_color,
            backdropEdgeColor: gift.backdrop.colors.edge_color,
            backdropSymbolColor: gift.backdrop.colors.symbol_color,
            backdropTextColor: gift.backdrop.colors.text_color,
            backdropRarityPerMille: gift.backdrop.rarity_per_mille,

            modelStickerFileId: gift.model.sticker.file_id,
            modelThumbnailFileId: gift.model.sticker.thumbnail?.file_id,
            symbolStickerFileId: gift.symbol.sticker.file_id,
            symbolThumbnailFileId: gift.symbol.sticker.thumbnail?.file_id,

            imageUrl: fileId
              ? `/api/rum/telegram-file?file_id=${encodeURIComponent(fileId)}`
              : '',

            sendDate: item.send_date,
            isFromBlockchain: gift.is_from_blockchain === true,
            isBurned: gift.is_burned === true,
          }
        }),
    )

    offset = result.next_offset || undefined
  } while (offset)

  return allGifts
}
