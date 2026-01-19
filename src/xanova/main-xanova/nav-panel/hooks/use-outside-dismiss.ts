import type { RefObject } from 'react'
import { useEffect } from 'react'

type UseOutsideDismissOptions = {
  isActive: boolean
  rootRef: RefObject<HTMLElement | null>
  onDismiss: () => void
}

export function useOutsideDismiss({ isActive, rootRef, onDismiss }: UseOutsideDismissOptions) {
  useEffect(() => {
    if (!isActive) return

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const rootElement = rootRef.current
      const target = event.target as Node | null

      if (rootElement && target && rootElement.contains(target)) {
        return
      }

      onDismiss()
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss()
      }
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [isActive, onDismiss, rootRef])
}
