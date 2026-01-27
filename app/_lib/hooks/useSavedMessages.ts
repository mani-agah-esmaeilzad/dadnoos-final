import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface SavedMessageFile {
  id: string
  messageId: string
  title: string
  content: string
  savedAt: number
  category: string
}

interface SavedMessagesStore {
  files: SavedMessageFile[]
  addFile: (payload: Omit<SavedMessageFile, 'id' | 'savedAt'>) => SavedMessageFile
  removeFile: (id: string) => void
  renameFile: (id: string, title: string) => void
  updateCategory: (id: string, category: string) => void
  clear: () => void
}

export const useSavedMessagesStore = create<SavedMessagesStore>()(
  persist(
    (set) => ({
      files: [],
      addFile: (payload) => {
        const newFile: SavedMessageFile = {
          id: crypto.randomUUID(),
          savedAt: Date.now(),
          ...payload,
          category: payload.category?.trim() || 'عمومی',
        }

        set((state) => ({
          files: [
            newFile,
            ...state.files.filter((file) => file.messageId !== payload.messageId),
          ],
        }))

        return newFile
      },
      removeFile: (id) =>
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
        })),
      renameFile: (id, title) =>
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, title: title.trim() || file.title } : file
          ),
        })),
      updateCategory: (id, category) =>
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, category: category.trim() || 'عمومی' } : file
          ),
        })),
      clear: () => set({ files: [] }),
    }),
    {
      name: 'saved-ai-messages',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
