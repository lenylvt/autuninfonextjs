// app/reader/[url]/page.tsx
import Reader from '@/components/Reader'

export default function ReaderPage({ params }: { params: { url: string } }) {
  return <Reader url={decodeURIComponent(params.url)} />
}