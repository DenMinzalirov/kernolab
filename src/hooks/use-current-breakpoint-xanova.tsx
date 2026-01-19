import { useEffect, useState } from 'react'

import { getCurrentBreakpointXanova } from 'utils/get-current-breakpoint-xanova'

export const BREAKPOINT_XENOVA = {
  desktop: 'desktop',
  tablet: 'tablet',
  mobile: 'mobile',
}

export const useCurrentBreakpointXanova = () => {
  const [currentBreakpointXanova, setCurrentBreakpointXanova] = useState(getCurrentBreakpointXanova())

  useEffect(() => {
    const updateBreakpoint = () => setCurrentBreakpointXanova(getCurrentBreakpointXanova())

    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    currentBreakpointXanova,
    isDesktopXanova: currentBreakpointXanova === BREAKPOINT_XENOVA.desktop,
    isTabletXanova: currentBreakpointXanova === BREAKPOINT_XENOVA.tablet,
    isMobileXanova: currentBreakpointXanova === BREAKPOINT_XENOVA.mobile,
  }
}
