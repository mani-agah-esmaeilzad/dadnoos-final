import { create } from 'zustand'

interface ChatStore {
  draftMessage: string
  setDraftMessage: (msg: string) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  draftMessage: '',
  setDraftMessage: (msg) => set({ draftMessage: msg }),
}))
