// components/RSSFeed.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Newspaper, Search, UserX, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface RSSItem {
  id: string
  title: string
  url: string
  content_html?: string
  date_published: string
  isObituary?: boolean
}

export default function RSSFeed() {
  const [articles, setArticles] = useState<RSSItem[]>([])
  const [obituaries, setObituaries] = useState<RSSItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [readItems, setReadItems] = useState<Set<string>>(new Set())
  const [newItems, setNewItems] = useState<Set<string>>(new Set())
  const [searchText, setSearchText] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [lastVisit, setLastVisit] = useState<Date | null>(TEST_LAST_VISIT)

  useEffect(() => {
    fetchRSS()
    fetchObituaries()
    loadFavorites()
    loadReadItems()
    loadLastVisit()
    
    // Update last visit time
    const now = new Date()
    localStorage.setItem('LastVisit', now.toISOString())
    setLastVisit(now)

    return () => {
      // Save last visit time when component unmounts
      localStorage.setItem('LastVisit', new Date().toISOString())
    }
  }, [])

  const fetchRSS = async () => {
    try {
      const response = await fetch('/api/rss')
      const data = await response.json()
      setArticles(data.items)
      checkNewItems(data.items)
    } catch (error) {
      console.error('Error fetching RSS:', error)
    }
  }

  const fetchObituaries = async () => {
    try {
      const response = await fetch('/api/obituaries')
      const data = await response.json()
      const formattedObituaries = data.items.map((item: RSSItem) => ({
        ...item,
        title: item.title.replace(/^Avis de décès : /, ''),
        isObituary: true
      }))
      setObituaries(formattedObituaries)
      checkNewItems(formattedObituaries)
    } catch (error) {
      console.error('Error fetching obituaries:', error)
    }
  }

  const checkNewItems = (items: RSSItem[]) => {
    if (lastVisit) {
      const newItemsSet = new Set(
        items
          .filter(item => new Date(item.date_published) > lastVisit)
          .map(item => item.id)
      )
      setNewItems(prev => new Set([...prev, ...newItemsSet]))
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

  const markAsRead = (item: RSSItem) => {
    setReadItems(prev => {
      const newReadItems = new Set(prev)
      newReadItems.add(item.id)
      saveReadItems(newReadItems)
      return newReadItems
    })
  }

  const saveReadItems = (readItems: Set<string>) => {
    localStorage.setItem('ReadItems', JSON.stringify(Array.from(readItems)))
  }

  const loadReadItems = () => {
    const savedReadItems = localStorage.getItem('ReadItems')
    if (savedReadItems) {
      setReadItems(new Set(JSON.parse(savedReadItems)))
    }
  }

  const loadLastVisit = () => {
    const savedLastVisit = localStorage.getItem('LastVisit')
    if (savedLastVisit) {
      setLastVisit(new Date(savedLastVisit))
    }
  }

  const isFavorite = (item: RSSItem) => favorites.has(item.id)
  const isRead = (item: RSSItem) => readItems.has(item.id)
  const isNew = (item: RSSItem) => newItems.has(item.id)

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'Date inconnue'
    }

    const date = new Date(dateString)
    const now = new Date()
    const timeRegex = /^(\d{1,2})[Hh](\d{2})?$/
    const dateRegex = /^(\d{1,2})\/(\d{1,2})$/

    // Check if it's a time string (e.g., "11H00" or "11h")
    const timeMatch = dateString.match(timeRegex)
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0')
      const minutes = timeMatch[2] ? timeMatch[2] : '00'
      return `Aujourd'hui à ${hours}H${minutes}`
    }

    // Check if it's a date string (e.g., "21/07")
    const dateMatch = dateString.match(dateRegex)
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10)
      const month = parseInt(dateMatch[2], 10) - 1 // JavaScript months are 0-indexed
      const formattedDate = new Date(now.getFullYear(), month, day)
      return `Le ${formattedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}`
    }

    // If it's neither a time nor a date string, format as before
    if (date.toDateString() === now.toDateString()) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return `Le ${date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}`
    }
  }

  const filteredArticles = articles.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  )

  const filteredObituaries = obituaries.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  )

  const filteredFavorites = [...articles, ...obituaries].filter(item => 
    isFavorite(item) && item.title.toLowerCase().includes(searchText.toLowerCase())
  )

  const renderItems = (items: RSSItem[]) => (
    items.map(item => (
      <Card key={item.id} className={`mb-4 ${isRead(item) ? 'bg-gray-100' : ''}`}>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            {item.title}
            {isRead(item) && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
            {isNew(item) && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">Nouveau</span>}
          </h2>
          <p className="text-sm text-gray-500 mb-3">{formatDate(item.date_published)}</p>
          <div className="flex justify-between items-center">
            <Link 
              href={`/reader/${encodeURIComponent(item.url)}`} 
              className="w-full mr-2"
              onClick={() => markAsRead(item)}
            >
              <Button variant="outline" className="w-full">
                {isRead(item) ? 'Relire' : 'Lire'}
              </Button>
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
    ))
  )

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
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="articles">
            <Newspaper className="mr-2 h-4 w-4" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="obituaries">
            <UserX className="mr-2 h-4 w-4" />
            Décès
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="mr-2 h-4 w-4" />
            Favoris
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          {renderItems(filteredArticles)}
        </TabsContent>

        <TabsContent value="obituaries">
          {renderItems(filteredObituaries)}
        </TabsContent>

        <TabsContent value="favorites">
          {renderItems(filteredFavorites)}
        </TabsContent>
      </Tabs>
    </div>
  )
}