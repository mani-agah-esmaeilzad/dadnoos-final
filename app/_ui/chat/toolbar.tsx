import React from 'react'
import { type Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
} from 'lucide-react'
import { Button } from '@/app/_ui/components/button'

type Props = {
  editor: Editor | null
}

// Define a mapping from heading level to a reasonable font size
const headingToFontSize: { [key: number]: number } = {
  1: 24,
  2: 20,
  3: 18,
}

export function Toolbar({ editor }: Props) {
  if (!editor) {
    return null
  }

  const getCurrentFontSize = () => {
    const attrs = editor.getAttributes('textStyle')
    if (attrs.fontSize) {
      return parseInt(attrs.fontSize.replace('px', ''), 10)
    }
    // Check if it's a heading and return a default size
    for (const level in headingToFontSize) {
      if (editor.isActive('heading', { level: parseInt(level) })) {
        return headingToFontSize[level]
      }
    }
    return 16 // Default paragraph font size
  }

  const setFontSize = (size: number) => {
    editor.chain().focus().setFontSize(`${size}px`).run()
  }

  const increaseFontSize = () => setFontSize(getCurrentFontSize() + 2)
  const decreaseFontSize = () => setFontSize(getCurrentFontSize() - 2)

  return (
    <div className="border border-input bg-transparent rounded-md p-1 flex gap-1 mb-4 flex-wrap">
      <Button variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Button>
      <Button variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Button>

      <Button variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="h-4 w-4" /></Button>
      <Button variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="h-4 w-4" /></Button>
      <Button variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="h-4 w-4" /></Button>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={increaseFontSize}><Plus className="h-4 w-4" /></Button>
        <span>{getCurrentFontSize()}px</span>
        <Button variant="ghost" size="sm" onClick={decreaseFontSize}><Minus className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}
