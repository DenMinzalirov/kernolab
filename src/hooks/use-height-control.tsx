import { useEffect, useRef, useState } from 'react'

export function useHeightControl<T extends HTMLElement>() {
  const [height, setHeight] = useState(0)
  const firstBlockRef = useRef<T | null>(null)
  const secondBlockRef = useRef<T | null>(null)
  const lastBlockRef = useRef<T | null>(null)

  useEffect(() => {
    if (firstBlockRef.current || secondBlockRef.current || lastBlockRef.current) {
      const updateHeight = () => {
        setHeight(
          (firstBlockRef.current?.offsetHeight || 0) +
            (secondBlockRef.current?.offsetHeight || 0) +
            (lastBlockRef.current?.offsetHeight || 0)
        )
      }

      const timeoutId = setTimeout(updateHeight, 100)

      return () => clearTimeout(timeoutId) // Очистка таймаута при размонтировании
    }
  }, [firstBlockRef.current, secondBlockRef.current, lastBlockRef.current])

  return { firstBlockRef, secondBlockRef, lastBlockRef, height }
}
