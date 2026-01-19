import React from 'react'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { TwoFaSetup } from 'features/modals'

import { useCurrentBreakpointPairs } from '../../hooks/use-current-breakpoint-pairs'
import { $twoFaStatus } from '../../model/two-fa'
import { SettingItemCardWrap } from './setting-item-card-wrap'
import styles from './styles.module.scss'

export function TwoFactorAuthentication() {
  const twoFa = useUnit($twoFaStatus)

  const handleTwoFa = () => {
    Modal.open(<TwoFaSetup />, {
      variant: 'center',
    })
  }

  const { isMobilePairs } = useCurrentBreakpointPairs()

  const breakpointText = `Protect your account by setting up Two Factor${
    isMobilePairs ? ' ' : '\n'
  }Authentication for your account.`

  const customTitle = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div>Two Factor Authentication</div>
      <div className={styles.recommended}>Recommended</div>
    </div>
  )

  return (
    <SettingItemCardWrap title={customTitle} description={breakpointText}>
      <div
        onClick={handleTwoFa}
        className={styles.settingEditAppText}
        style={twoFa ? { color: 'var(--P-System-Red)' } : {}}
      >
        {twoFa ? 'Turn Off' : 'Setup'}
      </div>
    </SettingItemCardWrap>
  )
}
