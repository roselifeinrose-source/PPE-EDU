import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      accentColor: '#6366f1',
      gameTheme: 'default',
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setGameTheme: (gameTheme) => set({ gameTheme }),
    }),
    { name: 'ppe-settings' }
  )
)

export default useSettingsStore
