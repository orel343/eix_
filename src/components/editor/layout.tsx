"use client"

import { Sidebar } from './sidebar'
import { Canvas } from './canvas'
import { TopBar } from './top-bar'
import { ElementPanel } from './element-panel'
import { useEditor } from '@/context/editor-context'

export function EditorLayout() {
  const { state } = useEditor()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <TopBar />
        <div className="flex-1 relative">
          <Canvas />
          {state.showElementPanel && (
            <ElementPanel />
          )}
        </div>
      </div>
    </div>
  )
}

