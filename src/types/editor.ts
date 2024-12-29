export interface Element {
    id: string
    type: string
    content?: string
    style?: React.CSSProperties
    className?: string
    children?: Element[]
    props?: Record<string, any>
  }
  
  export interface Page {
    id: string
    name: string
    elements: Element[]
    products: string[] // Product IDs
    settings: {
      background?: string
      styles?: React.CSSProperties
    }
  }
  
  export interface Site {
    id: string
    name: string
    pages: Record<string, Page>
    publishedUrl?: string
    templates?: Record<string, Page>
  }
  
  export interface EditorState {
    selectedElement: string | null
    selectedPage: string
    showElementPanel: boolean
    showTemplatePanel: boolean
    showPageManager: boolean
    isDragging: boolean
    history: {
      past: Site[]
      present: Site
      future: Site[]
    }
  }
  
  