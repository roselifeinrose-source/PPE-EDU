import { create } from 'zustand'

let _id = 0

const useNotificationStore = create((set) => ({
  toasts: [],

  addToast: (message, type = 'error', duration = 4000) => {
    const id = ++_id
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      }, duration)
    }
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export default useNotificationStore
