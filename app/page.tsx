// app/page.tsx
import RSSFeed from '@/components/RSSFeed'
import { ThemeProvider } from 'next-themes'

export default function Home() {
  return (
    <ThemeProvider attribute="class">
      <main className="h-full">
        <RSSFeed />
      </main>
    </ThemeProvider>
  )
}