import { Extension } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export const PlaceholderDecorator = Extension.create({
  name: 'placeholderDecorator',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        state: {
          init: (_, { doc }) => {
            const decorations = findPlaceholders(doc)
            return DecorationSet.create(doc, decorations)
          },
          apply: (tr, old) => {
            if (tr.docChanged) {
              const decorations = findPlaceholders(tr.doc)
              return DecorationSet.create(tr.doc, decorations)
            }
            return old
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})

function findPlaceholders(doc: any) {
  const decorations: Decoration[] = []
  const regex = /\[([^\]]+)\]/g

  doc.descendants((node: any, pos: number) => {
    if (!node.isText) {
      return
    }

    let match
    while ((match = regex.exec(node.text)) !== null) {
      const start = pos + match.index
      const end = start + match[0].length
      decorations.push(
        Decoration.inline(start, end, {
          class: 'placeholder',
        })
      )
    }
  })

  return decorations
}
