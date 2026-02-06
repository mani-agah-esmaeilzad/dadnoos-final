import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface VoiceSettingsState {
  voiceEnabled: boolean
  autoSendVoice: boolean
  autoPlayResponses: boolean
  voiceLiveEnabled: boolean
  setVoiceEnabled: (value: boolean) => void
  setAutoSendVoice: (value: boolean) => void
  setAutoPlayResponses: (value: boolean) => void
  setVoiceLiveEnabled: (value: boolean) => void
  toggleVoiceEnabled: () => void
  toggleAutoSendVoice: () => void
  toggleAutoPlayResponses: () => void
  toggleVoiceLiveEnabled: () => void
}

export const useVoiceSettings = create<VoiceSettingsState>()(
  persist(
    (set, get) => ({
      voiceEnabled: false,
      autoSendVoice: true,
      autoPlayResponses: true,
      voiceLiveEnabled: false,
      setVoiceEnabled: (value) => set({ voiceEnabled: value }),
      setAutoSendVoice: (value) => set({ autoSendVoice: value }),
      setAutoPlayResponses: (value) => set({ autoPlayResponses: value }),
      setVoiceLiveEnabled: (value) => set({ voiceLiveEnabled: value }),
      toggleVoiceEnabled: () => set({ voiceEnabled: !get().voiceEnabled }),
      toggleAutoSendVoice: () => set({ autoSendVoice: !get().autoSendVoice }),
      toggleAutoPlayResponses: () => set({ autoPlayResponses: !get().autoPlayResponses }),
      toggleVoiceLiveEnabled: () => set({ voiceLiveEnabled: !get().voiceLiveEnabled }),
    }),
    {
      name: 'voice-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        voiceEnabled: state.voiceEnabled,
        autoSendVoice: state.autoSendVoice,
        autoPlayResponses: state.autoPlayResponses,
        voiceLiveEnabled: state.voiceLiveEnabled,
      }),
    }
  )
)
