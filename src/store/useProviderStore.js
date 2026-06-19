import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
]

const useProviderStore = create(
  persist(
    (set) => ({
      provider: 'gemini',
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      geminiModel: 'gemini-2.5-flash',
      opencodeBaseUrl: 'http://localhost:4096',
      opencodeModel: '',
      opencodePassword: '',
      geminiModels: GEMINI_MODELS,
      setProvider: (provider) => set({ provider }),
      setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
      setGeminiModel: (geminiModel) => set({ geminiModel }),
      setOpencodeBaseUrl: (opencodeBaseUrl) => set({ opencodeBaseUrl }),
      setOpencodeModel: (opencodeModel) => set({ opencodeModel }),
      setOpencodePassword: (opencodePassword) => set({ opencodePassword }),
    }),
    { name: 'ppe-provider' }
  )
)

export { GEMINI_MODELS }
export default useProviderStore
