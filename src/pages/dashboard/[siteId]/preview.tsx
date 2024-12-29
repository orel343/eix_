'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { db, doc, getDoc } from '@/lib/firebase'

const PreviewPage = () => {
  const [previewState, setPreviewState] = useState(null)
  const [error, setError] = useState(null)
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const siteId = pathname ? pathname.split('/')[2] : null

  useEffect(() => {
    if (!loading && user && siteId) {
      fetchPreviewState()
    }
  }, [user, loading, siteId])

  const fetchPreviewState = async () => {
    if (!user || !siteId) return
    try {
      const editorStateRef = doc(db, 'users', user.uid, 'sites', siteId, 'editorState', 'latest')
      const editorStateSnap = await getDoc(editorStateRef)
      if (editorStateSnap.exists()) {
        setPreviewState(editorStateSnap.data())
      } else {
        setError('Preview state not found')
      }
    } catch (error) {
      console.error('Error fetching preview state:', error)
      setError('Failed to fetch preview state')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!previewState) {
    return <div>Preview not available</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {previewState.pages && previewState.pages.home && previewState.pages.home.elements && (
        previewState.pages.home.elements.map((element) => (
          <div key={element.id} style={{
            position: 'absolute',
            left: element.position.x,
            top: element.position.y,
            ...element.style
          }}>
            {element.type === 'Text' && <div>{element.content}</div>}
            {element.type === 'Image' && <img src={element.content} alt="Preview" />}
            {element.type === 'Button' && <button>{element.content}</button>}
            {/* Add more element types as needed */}
          </div>
        ))
      )}
    </div>
  )
}

export default PreviewPage

