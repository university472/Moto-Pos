// frontend/src/store/hydrationStore.ts
// A separate minimal store that tracks whether Zustand has hydrated.
// This avoids calling .persist.hasHydrated() which is unreliable in Next.js 16.

import { create } from 'zustand'

interface HydrationStore {
  isHydrated: boolean
  setHydrated: () => void
}

export const useHydrationStore = create<HydrationStore>((set) => ({
  isHydrated: false,
  setHydrated: () => set({ isHydrated: true })
}))
