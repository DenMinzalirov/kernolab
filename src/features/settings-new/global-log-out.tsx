import React from 'react'

import { Modal } from '../../components'
import { useCurrentBreakpointPairs } from '../../hooks/use-current-breakpoint-pairs'
import { LogOutModal } from '../modals/log-out'
import { SettingItemCardWrap } from './setting-item-card-wrap'
import styles from './styles.module.scss'

export function GlobalLogOut() {
  const { isTabletPairs, isMobilePairs, isDesktopPairs } = useCurrentBreakpointPairs()

  const handleLogOut = () => {
    Modal.open(<LogOutModal isGlobal={true} />, {
      variant: 'center',
    })
  }

  const breakpointText = () => {
    if (isMobilePairs) {
      return `This logs you out of Pairs everywhere you’re logged in including the mobile and desktop apps.`
    }
    if (isDesktopPairs || isTabletPairs) {
      return `This logs you out of Pairs everywhere you’re logged in\nincluding the mobile and desktop apps.`
    }

    return `This logs you out of Pairs everywhere you’re\nlogged in including the mobile and desktop apps.`
  }

  return (
    <SettingItemCardWrap title={'Log Out Everywhere'} description={breakpointText()}>
      <div
        onClick={handleLogOut}
        className={styles.settingEditAppText}
        style={{
          ...(isMobilePairs ? { backgroundColor: 'var(--P-System-Red)' } : {}),
          ...(!isMobilePairs ? { color: 'var(--P-System-Red)' } : {}),
        }}
      >
        Log Out Everywhere
      </div>
    </SettingItemCardWrap>
  )
}
