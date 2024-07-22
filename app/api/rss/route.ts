// app/api/rss/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://politepol.com/fd/Nf0d2zuxXs0H.json')
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching RSS:', error)
    return NextResponse.json({ error: 'Error fetching RSS' }, { status: 500 })
  }
}