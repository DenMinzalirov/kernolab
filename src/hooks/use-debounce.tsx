import { useCallback, useRef } from 'react'

function useDebounce(callback: (value: string) => void, delay: number = 500) {
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (value: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        callback(value)
      }, delay)
    },
    [callback, delay]
  )
}

export default useDebounce
