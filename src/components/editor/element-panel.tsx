"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useEditor } from '@/context/editor-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from "@/lib/utils"

const elements = {
  buttons: [
    { id: 'primary', label: 'Primary Button', variant: 'default' },
    { id: 'secondary', label: 'Secondary Button', variant: 'secondary' },
    { id: 'outline', label: 'Outline Button', variant: 'outline' },
    { id: 'ghost', label: 'Ghost Button', variant: 'ghost' }
  ],
  text: [
    { id: 'heading1', label: 'Heading 1', className: 'text-4xl font-bold' },
    { id: 'heading2', label: 'Heading 2', className: 'text-3xl font-bold' },
    { id: 'paragraph', label: 'Paragraph', className: 'text-base' }
  ],
  // Add more element categories here
}

export function ElementPanel() {
  const { state, dispatch } = useEditor()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('buttons')

  const handleAddElement = (element) => {
    if (!state.site.pages[state.state.selectedPage]) {
      console.error(`Selected page ${state.state.selectedPage} does not exist`)
      return
    }

    dispatch({
      type: 'ADD_ELEMENT',
      payload: {
        id: `${element.id}-${Date.now()}`,
        type: selectedCategory,
        content: element.label,
        className: element.className,
        props: {
          variant: element.variant
        }
      }
    })
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20 }}
      className="absolute top-0 right-0 w-80 h-full bg-background border-l shadow-lg"
    >
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search elements..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.keys(elements).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid gap-2">
          {elements[selectedCategory].map((element) => (
            <Button
              key={element.id}
              variant={element.variant || 'outline'}
              className={cn(
                "w-full justify-start",
                element.className
              )}
              onClick={() => handleAddElement(element)}
            >
              {element.label}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

