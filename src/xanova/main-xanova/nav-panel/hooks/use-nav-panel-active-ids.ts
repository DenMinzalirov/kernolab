import { useMemo } from 'react'

import type { NavItem } from '../types'

const isPathActive = (pathname: string, candidatePath: string) =>
  pathname === candidatePath || pathname.startsWith(`${candidatePath}/`)

export const useNavPanelActiveIds = (items: readonly NavItem[], pathname: string) =>
  useMemo(() => {
    const activeIds = new Set<string>()

    items.forEach(item => {
      if (isPathActive(pathname, item.path)) {
        activeIds.add(item.id)
      }

      item.submenu?.forEach(subItem => {
        if (isPathActive(pathname, subItem.path)) {
          activeIds.add(item.id)
          activeIds.add(subItem.id)
        }
      })
    })

    return activeIds
  }, [items, pathname])
