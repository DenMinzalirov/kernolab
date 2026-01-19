import { ReactNode, useEffect, useRef } from 'react'

interface FocusTrap {
  children: ReactNode
}

export const FocusTrap = ({ children }: FocusTrap) => {
  const trapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const trapElement = trapRef.current

    if (!trapElement) return
    const focusableElementsString =
      // eslint-disable-next-line max-len
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusableElements = trapElement.querySelectorAll(focusableElementsString)

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTrapFocus = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && focusableElements.length > 0) {
        if (event.shiftKey && document.activeElement === firstElement) {
          lastElement.focus()
          event.preventDefault()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          firstElement.focus()
          event.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTrapFocus)

    return () => {
      document.removeEventListener('keydown', handleTrapFocus)
    }
  }, [])

  return <div ref={trapRef}>{children}</div>
}
