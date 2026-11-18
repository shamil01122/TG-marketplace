
import { NextRequest, NextResponse } from 'next/server'
import { Bot } from 'grammy'
import { getRumSession } from '@/lib/rum/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getRumSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 },
      )
    }

    const fileId = request.nextUrl.searchParams.get('file_id')
    if (!fileId || fileId.length > 2048) {
      return NextResponse.json(
        { error: 'Некорректный file_id' },
        { status: 400 },
      )
    }

    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN не настроен')
    }

    const bot = new Bot(token)
    const file = await bot.api.getFile(fileId)

    if (!file.file_path) {
      throw new Error('Telegram не вернул путь к файлу')
    }

    const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`
    const imageResponse = await fetch(url)

    if (!imageResponse.ok) {
      throw new Error('Не удалось загрузить файл из Telegram')
    }

    const contentType =
      imageResponse.headers.get('content-type') || 'application/octet-stream'

    return new Response(await imageResponse.arrayBuffer(), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('RUM Telegram file error:', error)

    return NextResponse.json(
      { error: 'Не удалось получить изображение подарка' },
      { status: 502 },
    )
  }
}
