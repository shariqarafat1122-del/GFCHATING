import { create } from 'zustand'

interface UIState {
  theme: 'light' | 'dark'
  isMobileMenuOpen: boolean
  isNotificationPanelOpen: boolean
  isProfilePanelOpen: boolean
  activeModal: string | null
  toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null

  setTheme: (theme: 'light' | 'dark') => void
  toggleMobileMenu: () => void
  toggleNotificationPanel: () => void
  toggleProfilePanel: () => void
  openModal: (id: string) => void
  closeModal: () => void
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
  hideToast: () => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  isMobileMenuOpen: false,
  isNotificationPanelOpen: false,
  isProfilePanelOpen: false,
  activeModal: null,
  toast: null,

  setTheme: (theme) => set({ theme }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleNotificationPanel: () =>
    set((state) => ({ isNotificationPanelOpen: !state.isNotificationPanelOpen })),
  toggleProfilePanel: () =>
    set((state) => ({ isProfilePanelOpen: !state.isProfilePanelOpen })),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}))
