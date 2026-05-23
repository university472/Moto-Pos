// frontend/src/hooks/useHydration.ts
// Tracks Zustand persist hydration without triggering the
// "setState synchronously within an effect" linter error.
//
// Strategy:
//  - useState lazy initializer reads hasHydrated() at mount time
//    (synchronous, no effect needed for already-hydrated stores).
//  - The effect ONLY subscribes for the case where hydration hasn't
//    finished yet — setState is called inside the callback, not in
//    the effect body, which satisfies the linter rule.

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export function useHydration(): boolean {
  // Lazy initializer: if the store is already hydrated when the
  // component mounts, we start as `true` — no effect needed.
  const [isHydrated, setIsHydrated] = useState<boolean>(() =>
    useAuthStore.persist.hasHydrated()
  )

  useEffect(() => {
    // If already hydrated (caught by the lazy initializer), bail out.
    if (useAuthStore.persist.hasHydrated()) return

    // Subscribe for the async finish event.
    // setState is called inside the *callback* — not in the effect
    // body — so it doesn't trigger the cascading-render lint error.
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
    })

    return () => {
      unsubscribe()
    }
  }, []) // runs once on mount

  return isHydrated
}
