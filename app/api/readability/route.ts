// app/api/readability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    const html = await response.text()
    const doc = new JSDOM(html, { url })
    const reader = new Readability(doc.window.document)
    const article = reader.parse()

    if (!article) {
      throw new Error('Unable to parse article')
    }

    return NextResponse.json({
      title: article.title,
      content: article.content,
      byline: article.byline
    })
  } catch (error) {
    console.error('Error fetching or parsing content:', error)
    return NextResponse.json({ error: 'Error fetching or parsing content' }, { status: 500 })
  }
}
