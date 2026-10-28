import { create } from 'zustand'

interface CompareState {
  partIds: string[]
  toggle: (partId: string) => void
  remove: (partId: string) => void
  clear: () => void
}

export const useCompareStore = create<CompareState>((set) => ({
  partIds: [],
  toggle: (partId) =>
    set((state) => {
      if (state.partIds.includes(partId)) {
        return { partIds: state.partIds.filter((id) => id !== partId) }
      }
      if (state.partIds.length >= 3) return state
      return { partIds: [...state.partIds, partId] }
    }),
  remove: (partId) =>
    set((state) => ({ partIds: state.partIds.filter((id) => id !== partId) })),
  clear: () => set({ partIds: [] }),
}))
