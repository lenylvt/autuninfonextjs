// components/RSSFeed.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Newspaper, Search } from 'lucide-react'
import Link from 'next/link'

interface RSSItem {
  id: string
  title: string
  url: string
  content_html: string
  date_published: string
}

export default function RSSFeed() {
  const [items, setItems] = useState<RSSItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [searchText, setSearchText] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    fetchRSS()
    loadFavorites()
  }, [])

  const fetchRSS = async () => {
    try {
      const response = await fetch('/api/rss')
      const data = await response.json()
      setItems(data.items)
    } catch (error) {
      console.error('Error fetching RSS:', error)
    }
  }

  const toggleFavorite = (item: RSSItem) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(item.id)) {
        newFavorites.delete(item.id)
      } else {
        newFavorites.add(item.id)
      }
      saveFavorites(newFavorites)
      return newFavorites
    })
  }

  const saveFavorites = (favorites: Set<string>) => {
    localStorage.setItem('Favorites', JSON.stringify(Array.from(favorites)))
  }

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('Favorites')
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)))
    }
  }

  const isFavorite = (item: RSSItem) => favorites.has(item.id)

  const formatDate = (dateString: string, timeString: string) => {
    if (!dateString || !timeString) {
      return 'Date inconnue'
    }

    const date = new Date(dateString)
    const today = new Date()
    
    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${timeString}`
    } else {
      return `${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${timeString}`
    }
  }

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  )

  const filteredFavorites = filteredItems.filter(item => isFavorite(item))

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Autun Infos</h1>
        <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
          <Search className="h-6 w-6" />
        </Button>
      </div>

      {showSearch && (
        <Input
          type="text"
          placeholder="Rechercher"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="mb-4"
        />
      )}

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="articles">
            <Newspaper className="mr-2 h-4 w-4" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="mr-2 h-4 w-4" />
            Favoris
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          {filteredItems.map(item => (
            <Card key={item.id} className="mb-4">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
                <p className="text-sm text-gray-500 mb-3">{formatDate(item.date_published, item.content_html)}</p>
                <div className="flex justify-between items-center">
                  <Link href={`/reader/${encodeURIComponent(item.url)}`} className="w-full mr-2">
                    <Button variant="outline" className="w-full">Lire</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(item)}
                  >
                    <Star className={`h-6 w-6 ${isFavorite(item) ? 'fill-yellow-400' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="favorites">
          {filteredFavorites.map(item => (
            <Card key={item.id} className="mb-4">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
                <p className="text-sm text-gray-500 mb-3">{formatDate(item.date_published, item.content_html)}</p>
                <div className="flex justify-between items-center">
                  <Link href={`/reader/${encodeURIComponent(item.url)}`} className="w-full mr-2">
                    <Button variant="outline" className="w-full">Lire</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(item)}
                  >
                    <Star className="h-6 w-6 fill-yellow-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}