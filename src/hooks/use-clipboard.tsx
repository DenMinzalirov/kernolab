import { useCallback, useEffect, useRef, useState } from 'react'

type UseClipboardResult = {
  isCopied: boolean
  copy: (value: string) => Promise<boolean>
  reset: () => void
}

export function useClipboard(resetDelay = 1500): UseClipboardResult {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const clearPendingReset = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    clearPendingReset()
    setIsCopied(false)
  }, [clearPendingReset])

  const copy = useCallback(
    async (value: string) => {
      if (!value) {
        return false
      }

      if (!navigator?.clipboard?.writeText) {
        console.warn('Clipboard API is not available')
        return false
      }

      try {
        await navigator.clipboard.writeText(value)
        clearPendingReset()
        setIsCopied(true)
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null
          setIsCopied(false)
        }, resetDelay)
        return true
      } catch (error) {
        console.error('Clipboard copy failed', error)
        return false
      }
    },
    [clearPendingReset, resetDelay]
  )

  useEffect(
    () => () => {
      clearPendingReset()
    },
    [clearPendingReset]
  )

  return { isCopied, copy, reset }
}
