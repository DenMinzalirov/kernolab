import React, { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'

import { getToken } from 'utils'
import copied from 'icons/copied.svg'

import { useCurrentBreakpointPairs } from '../../hooks/use-current-breakpoint-pairs'
import { CopyIcon } from '../../icons'
import { $userInfo, getUserInfoFx } from '../../model/user-info'
import { SettingItemCardWrap } from './setting-item-card-wrap'
import styles from './styles.module.scss'

export function Referral() {
  const [isCopied, setIsCopied] = useState(false)

  const userInfo = useUnit($userInfo)

  useEffect(() => {
    if (!userInfo.referralCode) {
      const userToken = getToken()
      userToken && getUserInfoFx()
    }
  }, [])

  const { isDesktopSPairs, isTabletPairs, isMobilePairs } = useCurrentBreakpointPairs()

  const breakpointText = () => {
    if (isMobilePairs) {
      return `You are automatically enrolled into our referral program. Share your referral code to start earning.`
    }
    if (isDesktopSPairs || isTabletPairs) {
      return `You are automatically enrolled into our referral\nprogram. Share your referral code to start earning.`
    }
    return `You are automatically enrolled into our referral program.\nShare your referral code to start earning.`
  }

  return (
    <SettingItemCardWrap title={'Referral'} description={breakpointText()}>
      <div
        onClick={() => {
          navigator.clipboard.writeText(userInfo.referralCode).then(() => {
            setIsCopied(true)
            setTimeout(() => {
              setIsCopied(false)
            }, 2000)
          })
        }}
        className={styles.settingVersionAppText}
      >
        {isCopied ? (
          <>
            <div style={{ marginRight: 12 }}>Copied</div>
            <img src={copied} alt='' />
          </>
        ) : (
          <>
            <div>{userInfo?.referralCode || ''}</div>
            <div style={{ marginLeft: 12, marginTop: 3 }}>
              <CopyIcon isMobile={false} fill='var(--Deep-Space)' />
            </div>
          </>
        )}
      </div>
    </SettingItemCardWrap>
  )
}
