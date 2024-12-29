"use client"

import { useState } from 'react'
import { useEditor } from '@/context/editor-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Save, Eye, Globe, ChevronDown, Undo, Redo } from 'lucide-react'


export function TopBar() {
  const { site, state, dispatch, saveSite } = useEditor()
  const [isPublishing, setIsPublishing] = useState(false)

  if (!site) {
    return null;
  }

  const handleSave = async () => {
    try {
      await saveSite()
    } catch (error) {
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const response = await fetch(`/api/sites/${site.id}/publish`, {
        method: 'POST',
      })
      const data = await response.json()
      if (response.ok) {
        dispatch({ type: 'UPDATE_SITE', payload: { publishedUrl: data.url } })
      } else {
        throw new Error(data.message || 'Failed to publish')
      }
    } catch (error) {
    } finally {
      setIsPublishing(false)
    }
  }

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/sites/${site.id}/preview`, '_blank')
  }

  return (
    <div className="h-14 border-b px-4 flex items-center justify-between bg-background">
      <div className="flex items-center space-x-4">
        <Input
          value={site?.name || ''}
          onChange={(e) => dispatch({ type: 'UPDATE_SITE', payload: { name: e.target.value } })}
          className="w-48"
        />
        <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'UNDO' })}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'REDO' })}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={handlePreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm">
              <Globe className="mr-2 h-4 w-4" />
              Publish
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Publish Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? 'Publishing...' : 'Publish Now'}
            </DropdownMenuItem>
            {site.publishedUrl && (
              <DropdownMenuItem onClick={() => window.open(site.publishedUrl, '_blank')}>
                View Live Site
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

