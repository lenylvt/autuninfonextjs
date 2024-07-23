// app/api/rss/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Ajout d'un paramètre timestamp pour éviter la mise en cache
    const timestamp = new Date().getTime()
    const response = await fetch(`https://politepol.com/fd/Nf0d2zuxXs0H.json?_=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching RSS:', error)
    return NextResponse.json({ error: 'Error fetching RSS' }, { status: 500 })
  }
}