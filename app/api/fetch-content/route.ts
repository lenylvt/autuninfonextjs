// app/api/fetch-content/route.ts
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)
    
    // Remove unwanted elements
    $('script, style, iframe, img').remove()
    
    // Extract the main content (you might need to adjust this selector)
    const content = $('main').html() || $('article').html() || $('body').html()

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Error fetching content' }, { status: 500 })
  }
}