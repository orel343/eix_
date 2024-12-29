"use client"

import { useEditor } from '@/context/editor-context'
import { useDrop } from 'react-dnd'
import { Element } from '@/types/editor'
import { motion, Reorder } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function ElementRenderer({ element }: { element: Element }) {
  const { dispatch } = useEditor()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({ type: 'SELECT_ELEMENT', payload: element.id })
  }

  switch (element.type) {
    case 'button':
      return (
        <Button
          variant={element.props?.variant || 'default'}
          className={element.className}
          style={element.style}
          onClick={handleClick}
        >
          {element.content}
        </Button>
      )
    case 'text':
      return (
        <div
          className={element.className}
          style={element.style}
          onClick={handleClick}
        >
          {element.content}
        </div>
      )
    // Add more element types here
    default:
      return null
  }
}

export function Canvas() {
  const { state, site, dispatch } = useEditor()
  
  // Check if site and pages exist before accessing
  const currentPage = site?.pages?.[state.selectedPage]

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item: Element) => {
      dispatch({
        type: 'ADD_ELEMENT',
        payload: {
          ...item,
          id: `${item.type}-${Date.now()}`
        }
      })
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  if (!currentPage) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <p>No page selected or page not found.</p>
      </div>
    )
  }

  return (
    <div
      ref={drop}
      className={cn(
        "w-full h-full overflow-auto bg-background",
        isOver && "bg-muted"
      )}
      style={currentPage.settings?.styles}
    >
      <Reorder.Group
        axis="y"
        values={currentPage.elements || []}
        onReorder={(newOrder) => {
          dispatch({
            type: 'UPDATE_PAGE',
            payload: {
              ...currentPage,
              elements: newOrder
            }
          })
        }}
        className="min-h-full p-8"
      >
        {currentPage.elements?.map((element) => (
          <Reorder.Item key={element.id} value={element}>
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ElementRenderer element={element} />
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  )
}
