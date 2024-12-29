"use client"

import { useState } from 'react'
import { useEditor } from '@/context/editor-context'
import { Button } from '@/components/ui/button'
import { Type, ImageIcon, Square, LayoutGrid, List, Share2, ShoppingBag, FileText, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'add', icon: Plus, label: 'Add Element' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'image', icon: ImageIcon, label: 'Image' },
  { id: 'button', icon: Square, label: 'Button' },
  { id: 'gallery', icon: LayoutGrid, label: 'Gallery' },
  { id: 'list', icon: List, label: 'List' },
  { id: 'social', icon: Share2, label: 'Social' },
  { id: 'store', icon: ShoppingBag, label: 'Store' },
  { id: 'blog', icon: FileText, label: 'Blog' }
]

export function Sidebar() {
  const { state, dispatch } = useEditor()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'add') {
      dispatch({ type: 'TOGGLE_ELEMENT_PANEL' })
    } else {
      setActiveCategory(activeCategory === categoryId ? null : categoryId)
    }
  }

  return (
    <div className="w-16 bg-background border-r flex flex-col items-center py-4 gap-4">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full w-12 h-12",
            activeCategory === category.id && "bg-primary text-primary-foreground"
          )}
          onClick={() => handleCategoryClick(category.id)}
        >
          <category.icon className="w-5 h-5" />
          <span className="sr-only">{category.label}</span>
        </Button>
      ))}
    </div>
  )
}

