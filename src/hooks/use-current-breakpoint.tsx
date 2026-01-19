import { useEffect, useState } from 'react'

import { getCurrentBreakpoint } from 'utils/get-current-breakpoint'

export const BREAKPOINT = {
  xxl: 'xxl',
  xl: 'xl',
  lg: 'lg',
  md: 'md',
  sm: 'sm',
}

export const useCurrentBreakpoint = () => {
  const [currentBreakpointBiz, currentSetBreakpointBiz] = useState(getCurrentBreakpoint())
  const [isMobileBiz, setIsMobileBiz] = useState(['md', 'sm'].includes(getCurrentBreakpoint()))

  useEffect(() => {
    const updateBreakpoint = () => {
      const currentBreakpoint = getCurrentBreakpoint()
      currentSetBreakpointBiz(currentBreakpoint)
      setIsMobileBiz(['md', 'sm'].includes(currentBreakpoint))
    }

    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return { currentBreakpointBiz, isMobileBiz }
}
