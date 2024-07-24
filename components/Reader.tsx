// components/Reader.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useTheme } from 'next-themes'

interface ReaderProps {
  url: string
}

interface Article {
  title: string
  content: string
  byline: string | null
}

export default function Reader({ url }: ReaderProps) {
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { theme, systemTheme } = useTheme()

  const fetchArticle = useCallback(async (articleUrl: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/readability?url=${encodeURIComponent(articleUrl)}`)
      const data = await response.json()
      setArticle(data)
    } catch (error) {
      console.error('Error fetching article:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticle(url)
  }, [fetchArticle, url])

  useEffect(() => {
    if (article) {
      const content = document.getElementById('article-content')
      if (content) {
        // Clean up content
        content.innerHTML = content.innerHTML
          .replace(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/g, '') // Remove dates
          .replace(/\d+ lectures?/g, '') // Remove read counts
          .replace(/\*\*IMPRIMER L'ARTICLE/g, '') // Remove print button
          .replace(/> [^<>]+ > [^<>]+/g, '') // Remove breadcrumbs
          .replace(/Pour nous rejoindre\./g, '') // Remove "Pour nous rejoindre"
          .replace(/https:\/\/www\.autun-infos\.com\/img\/home-blue\.png/g, '') // Remove home image
          .replace(/https:\/\/www\.autun-infos\.com\/img\/icon_print.png/g, '') // Remove print icon
          .replace(/IMPRIMER L'ARTICLE/g, '') // Remove "IMPRIMER L'ARTICLE"

        // Handle "Cliquez ici pour" and "Cliquez-ici pour" links
        const links = content.getElementsByTagName('a');
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          if (link.textContent?.toLowerCase().includes('cliquez ici pour') || link.textContent?.toLowerCase().includes('cliquez-ici pour')) {
            link.onclick = (e) => {
              e.preventDefault();
              fetchArticle(link.href);
            };
          }
        }

        // Replace other links with buttons
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          if (!link.textContent?.toLowerCase().includes('cliquez ici pour') && !link.textContent?.toLowerCase().includes('cliquez-ici pour')) {
            const button = document.createElement('button');
            button.innerHTML = link.innerHTML;
            button.className = 'styled-button';
            button.onclick = (e) => {
              e.preventDefault();
              window.open(link.href, '_blank');
            };
            link.parentNode?.replaceChild(button, link);
          }
        }

        // Style images
        const images = content.getElementsByTagName('img')
        for (let i = 0; i < images.length; i++) {
          const img = images[i]
          img.className = 'rounded-lg shadow-lg my-4 mx-auto'
          img.style.maxWidth = '100%'
        }
      }
    }
  }, [article, fetchArticle])

  // Determine the current theme
  const currentTheme = theme === 'system' ? systemTheme : theme

  if (isLoading) {
    return <div className="p-4 text-center text-gray-900 dark:text-gray-200">Chargement de l'article...</div>
  }

  if (!article) {
    return <div className="p-4 text-center text-gray-900 dark:text-gray-200">Impossible de charger l'article.</div>
  }

  const BackButton = () => (
    <Link href="/">
      <Button variant="outline" className="mb-4 flex items-center">
        <ChevronLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200">
      <div className="p-4 max-w-4xl mx-auto">
        <BackButton />
        <article className="prose prose-sm sm:prose lg:prose-lg mx-auto p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
            {article.title}
          </h1>
          {article.byline && (
            <p className="text-sm mb-6 text-center italic text-gray-500 dark:text-gray-400">
              {article.byline}
            </p>
          )}
          <div 
            id="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }} 
            className="text-base leading-relaxed space-y-6 text-gray-800 dark:text-gray-300"
          />
        </article>
        <div className="mt-6">
          <BackButton />
        </div>
      </div>
    </div>
  )
}