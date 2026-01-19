import type { FocusEvent as ReactFocusEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

type UseNavPanelOverlayEvent = ReactMouseEvent<HTMLElement> | ReactFocusEvent<HTMLElement>

export type UseNavPanelOverlayResult = {
  isOverlayVisible: boolean
  navRootRef: RefObject<HTMLDivElement | null>
  logoRef: RefObject<HTMLButtonElement | null>
  closeOverlayImmediately: () => void
  handleDropdownEnter: () => void
  handleDropdownLeave: (event?: UseNavPanelOverlayEvent) => void
  handleNavRootLeave: (event: ReactMouseEvent<HTMLDivElement>) => void
}

export function useNavPanelOverlay(): UseNavPanelOverlayResult {
  const [isOverlayVisible, setOverlayVisible] = useState(false)
  const hoverDepthRef = useRef(0)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRootRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLButtonElement>(null)

  const resolveNodeTarget = useCallback((target: EventTarget | null): Node | null => {
    if (!target) return null
    if (typeof Node === 'undefined') return null
    return target instanceof Node ? target : null
  }, [])

  const getInteractiveRoot = useCallback((target: EventTarget | null): HTMLElement | null => {
    if (!target) return null
    if (typeof Element === 'undefined') return null
    if (!(target instanceof Element)) return null
    return target.closest('[data-nav-interactive-root]') as HTMLElement | null
  }, [])

  const clearLeaveTimer = useCallback(() => {
    if (!leaveTimerRef.current) return
    clearTimeout(leaveTimerRef.current)
    leaveTimerRef.current = null
  }, [])

  const closeOverlayImmediately = useCallback(() => {
    clearLeaveTimer()
    hoverDepthRef.current = 0
    setOverlayVisible(false)
    if (typeof document !== 'undefined') {
      const activeElement = document.activeElement as HTMLElement | null
      const logoElement = logoRef.current
      const shouldBlurActiveElement =
        !!activeElement && activeElement !== logoElement && navRootRef.current?.contains(activeElement)

      if (shouldBlurActiveElement) {
        activeElement.blur()
      }
    }
  }, [clearLeaveTimer])

  const showOverlay = useCallback(() => {
    clearLeaveTimer()
    hoverDepthRef.current += 1
    setOverlayVisible(true)
  }, [clearLeaveTimer])

  const scheduleHideOverlay = useCallback(() => {
    clearLeaveTimer()
    leaveTimerRef.current = setTimeout(() => {
      hoverDepthRef.current = 0
      setOverlayVisible(false)
      leaveTimerRef.current = null
    }, 60)
  }, [clearLeaveTimer])

  const handleDropdownEnter = useCallback(() => {
    showOverlay()
  }, [showOverlay])

  const handleDropdownLeave = useCallback(
    (event?: UseNavPanelOverlayEvent) => {
      if (!event) {
        scheduleHideOverlay()
        return
      }

      const nextTarget = resolveNodeTarget(event.relatedTarget)
      const currentRoot = getInteractiveRoot(event.currentTarget)

      if (nextTarget && currentRoot && currentRoot.contains(nextTarget)) {
        clearLeaveTimer()
        return
      }

      scheduleHideOverlay()
    },
    [clearLeaveTimer, getInteractiveRoot, resolveNodeTarget, scheduleHideOverlay]
  )

  const handleNavRootLeave = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const navElement = navRootRef.current
      const nextTarget = resolveNodeTarget(event.relatedTarget)

      if (navElement && nextTarget && navElement.contains(nextTarget)) {
        return
      }

      scheduleHideOverlay()
    },
    [resolveNodeTarget, scheduleHideOverlay]
  )

  useEffect(() => {
    if (typeof document === 'undefined') return

    if (isOverlayVisible) {
      const { style } = document.body
      const previousOverflow = style.overflow
      style.overflow = 'hidden'

      const handleDocumentPointer = (event: MouseEvent | TouchEvent) => {
        const navElement = navRootRef.current
        if (!navElement) return
        const target = resolveNodeTarget(event.target as EventTarget | null)
        if (target && navElement.contains(target)) return
        closeOverlayImmediately()
      }

      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeOverlayImmediately()
        }
      }

      document.addEventListener('mousedown', handleDocumentPointer)
      document.addEventListener('touchstart', handleDocumentPointer)
      document.addEventListener('keydown', handleKeydown)

      return () => {
        style.overflow = previousOverflow
        document.removeEventListener('mousedown', handleDocumentPointer)
        document.removeEventListener('touchstart', handleDocumentPointer)
        document.removeEventListener('keydown', handleKeydown)
      }
    }

    return undefined
  }, [closeOverlayImmediately, isOverlayVisible, resolveNodeTarget])

  useEffect(() => {
    return () => {
      clearLeaveTimer()
      hoverDepthRef.current = 0
    }
  }, [clearLeaveTimer])

  return {
    isOverlayVisible,
    navRootRef,
    logoRef,
    closeOverlayImmediately,
    handleDropdownEnter,
    handleDropdownLeave,
    handleNavRootLeave,
  }
}
