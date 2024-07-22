// app/page.tsx
import RSSFeed from '@/components/RSSFeed'

export default function Home() {
  return (
    <main className="h-full">
      <RSSFeed />
    </main>
  )
}