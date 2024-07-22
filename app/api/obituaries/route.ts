// app/api/obituaries/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://politepol.com/fd/rY91oXqaJXTF.json')
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching obituaries:', error)
    return NextResponse.json({ error: 'Error fetching obituaries' }, { status: 500 })
  }
}