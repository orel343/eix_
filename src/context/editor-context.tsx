"use client"

import { createContext, useContext, useReducer, useCallback } from 'react'
import type { Site, EditorState, Element, Page } from '../types/editor'

interface EditorContextType {
  site: Site
  state: EditorState
  dispatch: (action: EditorAction) => void
  saveSite: () => Promise<void>
}

type EditorAction = 
  | { type: 'SELECT_ELEMENT'; payload: string }
  | { type: 'ADD_ELEMENT'; payload: Element }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; updates: Partial<Element> } }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'CHANGE_PAGE'; payload: string }
  | { type: 'ADD_PAGE'; payload: Page }
  | { type: 'TOGGLE_ELEMENT_PANEL' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_SITE'; payload: Site }
  | { type: 'UPDATE_SITE'; payload: Partial<Site> }

const EditorContext = createContext<EditorContextType | undefined>(undefined)

const defaultSite: Site = {
  id: '',
  name: 'New Site',
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

const defaultEditorState: EditorState = {
  selectedElement: null,
  selectedPage: 'home',
  showElementPanel: false,
  showTemplatePanel: false,
  showPageManager: false,
  isDragging: false,
  history: {
    past: [],
    present: defaultSite,
    future: []
  }
}

export function EditorProvider({ 
  children,
  initialSite,
  onSave
}: { 
  children: React.ReactNode
  initialSite: Partial<Site>
  onSave: (updates: Partial<Site>) => Promise<void>
}) {
  const [state, dispatch] = useReducer(editorReducer, {
    site: { ...defaultSite, ...initialSite },
    state: { ...defaultEditorState, history: { ...defaultEditorState.history, present: { ...defaultSite, ...initialSite } } }
  })

  const saveSite = useCallback(async () => {
    try {
      await onSave(state.site)
    } catch (err) {
      console.error('Error saving site:', err)
      throw err
    }
  }, [state.site, onSave])

  return (
    <EditorContext.Provider value={{ ...state, dispatch, saveSite }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}

function editorReducer(state: { site: Site; state: EditorState }, action: EditorAction) {
  switch (action.type) {
    case 'UPDATE_SITE':
      return {
        ...state,
        site: {
          ...state.site,
          ...action.payload
        }
      }
    case 'SELECT_ELEMENT':
      return {
        ...state,
        state: {
          ...state.state,
          selectedElement: action.payload
        }
      }
    case 'ADD_ELEMENT':
      const currentPage = state.site.pages[state.state.selectedPage]
      if (!currentPage) {
        console.error(`Page ${state.state.selectedPage} not found`)
        return state
      }
      return {
        ...state,
        site: {
          ...state.site,
          pages: {
            ...state.site.pages,
            [state.state.selectedPage]: {
              ...currentPage,
              elements: [...currentPage.elements, action.payload]
            }
          }
        }
      }
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        site: {
          ...state.site,
          pages: {
            ...state.site.pages,
            [state.state.selectedPage]: {
              ...state.site.pages[state.state.selectedPage],
              elements: state.site.pages[state.state.selectedPage].elements.map(el => 
                el.id === action.payload.id ? { ...el, ...action.payload.updates } : el
              )
            }
          }
        }
      }
    case 'DELETE_ELEMENT':
      return {
        ...state,
        site: {
          ...state.site,
          pages: {
            ...state.site.pages,
            [state.state.selectedPage]: {
              ...state.site.pages[state.state.selectedPage],
              elements: state.site.pages[state.state.selectedPage].elements.filter(el => el.id !== action.payload)
            }
          }
        }
      }
    case 'CHANGE_PAGE':
      return {
        ...state,
        state: {
          ...state.state,
          selectedPage: action.payload
        }
      }
    case 'ADD_PAGE':
      return {
        ...state,
        site: {
          ...state.site,
          pages: {
            ...state.site.pages,
            [action.payload.id]: action.payload
          }
        }
      }
    case 'TOGGLE_ELEMENT_PANEL':
      return {
        ...state,
        state: {
          ...state.state,
          showElementPanel: !state.state.showElementPanel
        }
      }
    case 'UNDO':
      return {
        ...state,
        site: state.state.history.past[state.state.history.past.length -1],
        state: {
          ...state.state,
          history: {
            past: state.state.history.past.slice(0, -1),
            present: state.state.history.past[state.state.history.past.length -1],
            future: [state.state.history.present, ...state.state.history.future]
          }
        }
      }
    case 'REDO':
      return {
        ...state,
        site: state.state.history.future[0],
        state: {
          ...state.state,
          history: {
            past: [...state.state.history.past, state.state.history.present],
            present: state.state.history.future[0],
            future: state.state.history.future.slice(1)
          }
        }
      }
    case 'SAVE_SITE':
      return {
        ...state,
        site: action.payload
      }
    default:
      return state
  }
}

