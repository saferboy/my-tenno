import { create } from 'zustand'

interface ToastState {
  message: string | null
  show: (message: string) => void
  clear: () => void
}

// TDD 7.3: IPC/async xatolar uchun chiroyli, bloklamaydigan bildirishnoma.
export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  clear: () => set({ message: null })
}))
