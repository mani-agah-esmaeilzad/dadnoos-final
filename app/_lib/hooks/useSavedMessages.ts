import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface SavedMessageFile {
  id: string
  messageId: string
  title: string
  content: string
  savedAt: number
  category: string
  caseId?: string
}

export interface SavedCase {
  id: string
  name: string
  createdAt: number
  color?: string
}

interface SavedMessagesStore {
  files: SavedMessageFile[]
  cases: SavedCase[]
  addFile: (payload: Omit<SavedMessageFile, 'id' | 'savedAt'>) => SavedMessageFile
  removeFile: (id: string) => void
  renameFile: (id: string, title: string) => void
  updateCategory: (id: string, category: string) => void
  updateCaseAssignment: (id: string, caseId?: string) => void
  addCase: (name: string) => SavedCase
  renameCase: (id: string, name: string) => void
  removeCase: (id: string) => void
  ensureCasesInitialized: () => void
  clear: () => void
}

export const useSavedMessagesStore = create<SavedMessagesStore>()(
  persist(
    (set, get) => ({
      files: [],
      cases: [],
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
      updateCaseAssignment: (id, caseId) =>
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, caseId: caseId || undefined } : file
          ),
        })),
      addCase: (name) => {
        const trimmed = name.trim()
        if (!trimmed) {
          throw new Error('Case name cannot be empty')
        }
        const existing = get().cases.find(
          (caseItem) => caseItem.name.toLowerCase() === trimmed.toLowerCase()
        )
        if (existing) {
          return existing
        }
        const newCase: SavedCase = {
          id: crypto.randomUUID(),
          name: trimmed,
          createdAt: Date.now(),
        }
        set((state) => ({ cases: [newCase, ...state.cases] }))
        return newCase
      },
      renameCase: (id, name) =>
        set((state) => ({
          cases: state.cases.map((caseItem) =>
            caseItem.id === id
              ? { ...caseItem, name: name.trim() || caseItem.name }
              : caseItem
          ),
        })),
      removeCase: (id) =>
        set((state) => ({
          cases: state.cases.filter((caseItem) => caseItem.id !== id),
          files: state.files.map((file) =>
            file.caseId === id ? { ...file, caseId: undefined } : file
          ),
        })),
      ensureCasesInitialized: () =>
        set((state) => {
          if (state.cases.length > 0 || state.files.length === 0) {
            return state
          }
          const generatedCases: SavedCase[] = []
          const nameToId = new Map<string, string>()
          const updatedFiles = state.files.map((file) => {
            const normalized = file.title?.trim()
            if (!normalized) return file
            if (!nameToId.has(normalized)) {
              const newCaseId = crypto.randomUUID()
              nameToId.set(normalized, newCaseId)
              generatedCases.push({
                id: newCaseId,
                name: normalized,
                createdAt: file.savedAt ?? Date.now(),
              })
            }
            return { ...file, caseId: nameToId.get(normalized) }
          })
          if (!generatedCases.length) {
            return state
          }
          return {
            ...state,
            files: updatedFiles,
            cases: [...state.cases, ...generatedCases],
          }
        }),
      clear: () => set({ files: [], cases: [] }),
    }),
    {
      name: 'saved-ai-messages',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
