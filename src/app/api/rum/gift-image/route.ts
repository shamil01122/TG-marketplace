
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { Bot } from 'grammy'
import { db, rumGifts } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN

    if (!token) {
      return NextResponse.json(
        { error: 'Telegram не настроен' },
        { status: 500 },
      )
    }

    const fileId = request.nextUrl.searchParams.get('fileId')

    if (!fileId || fileId.length > 1024) {
      return NextResponse.json(
        { error: 'Некорректный file_id' },
        { status: 400 },
      )
    }

    const imageUrl = `/api/rum/gift-image?fileId=${encodeURIComponent(fileId)}`

    const [gift] = await db
      .select({ id: rumGifts.id })
      .from(rumGifts)
      .where(eq(rumGifts.imageUrl, imageUrl))
      .limit(1)

    if (!gift) {
      return NextResponse.json(
        { error: 'Изображение не зарегистрировано в RUM' },
        { status: 404 },
      )
    }

    const bot = new Bot(token)
    const file = await bot.api.getFile(fileId)

    if (!file.file_path) {
      return NextResponse.json(
        { error: 'Изображение не найдено' },
        { status: 404 },
      )
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/file/bot${token}/${file.file_path}`,
      { cache: 'no-store' },
    )

    if (!telegramResponse.ok) {
      return NextResponse.json(
        { error: 'Не удалось загрузить изображение' },
        { status: 502 },
      )
    }

    const contentType =
      telegramResponse.headers.get('content-type') || ''

    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Файл не является изображением' },
        { status: 415 },
      )
    }

    return new Response(telegramResponse.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('RUM gift image error:', error)

    return NextResponse.json(
      { error: 'Ошибка загрузки изображения' },
      { status: 502 },
    )
  }
}
