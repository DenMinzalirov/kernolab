import { useEffect, useState } from 'react'

import { getCurrentBreakpointPairs } from 'utils/get-current-breakpoint-pairs'

export const BREAKPOINT_PAIRS = {
  desktop: 'p-desktop',
  desktopS: 'p-desktop-s',
  tablet: 'p-tablet',
  mobile: 'p-mobile',
}

export const useCurrentBreakpointPairs = () => {
  const [currentBreakpointPairs, setCurrentBreakpointPairs] = useState(getCurrentBreakpointPairs())

  useEffect(() => {
    const updateBreakpoint = () => setCurrentBreakpointPairs(getCurrentBreakpointPairs())

    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    currentBreakpointPairs,
    isDesktopPairs: currentBreakpointPairs === BREAKPOINT_PAIRS.desktop,
    isDesktopSPairs: currentBreakpointPairs === BREAKPOINT_PAIRS.desktopS,
    isTabletPairs: currentBreakpointPairs === BREAKPOINT_PAIRS.tablet,
    isMobilePairs: currentBreakpointPairs === BREAKPOINT_PAIRS.mobile,
  }
}
