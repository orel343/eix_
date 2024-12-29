'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { db, doc, getDoc, setDoc, updateDoc } from '@/lib/firebase'
import { EditorProvider } from '@/context/editor-context'
import { EditorLayout } from '@/components/editor/layout'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const defaultEditorState = {
  pages: {
    home: { 
      id: 'home',
      name: 'Home',
      elements: [],
      products: [],
      settings: {
        background: 'white',
        styles: {}
      }
    }
  }
}

export default function EditorPage() {
  const [site, setSite] = useState(null)
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const siteId = pathname ? pathname.split('/')[2] : null

  useEffect(() => {
    if (!loading && user) {
      if (siteId) {
        fetchSite()
      }
    } else if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, siteId])

  const fetchSite = async () => {
    if (!user || !siteId) return
    try {
      const siteRef = doc(db, 'users', user.uid, 'sites', siteId)
      const siteSnap = await getDoc(siteRef)
      if (siteSnap.exists()) {
        setSite({ id: siteSnap.id, ...siteSnap.data() })
      } else {
        // Create new site if it doesn't exist
        const newSite = {
          id: siteId,
          name: 'New Site',
          ...defaultEditorState
        }
        await setDoc(siteRef, newSite)
        setSite(newSite)
      }
    } catch (error) {
      console.error('Error fetching site:', error)
    }
  }

  const saveSite = async (updates) => {
    if (!user || !siteId) return
    try {
      const siteRef = doc(db, 'users', user.uid, 'sites', siteId)
      await updateDoc(siteRef, updates)
      setSite(prevSite => ({ ...prevSite, ...updates }))
    } catch (error) {
      console.error('Error saving site:', error)
      throw error
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!site) {
    return <div>Site not found</div>
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <EditorProvider 
        initialSite={site}
        onSave={saveSite}
      >
        <EditorLayout />
      </EditorProvider>
    </DndProvider>
  )
}

