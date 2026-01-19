import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { pages } from 'constant'
import { getReferralLinkXanova } from 'config'
import { $userInfo } from 'model/user-info'

import styles from './styles.module.scss'
import { CopyIconButton } from 'xanova/components/copy-icon-button'

type QuickActionRowProps = {
  label: string
  value: string
  copyValue: string
  isLoading: boolean
  ariaLabel: string
  applyEllipsis?: boolean
}

function QuickActionRow({ label, value, copyValue, isLoading, ariaLabel, applyEllipsis }: QuickActionRowProps) {
  const displayValue = isLoading ? 'Loading...' : value
  const isCopyDisabled = isLoading || !copyValue

  return (
    <div className={styles.flexSpaceBetweenAlignEndGap10}>
      <div className={styles.flexVerticalGap8}>
        <div className={clsx(styles.smallText, styles.opacity07)}>{label}</div>
        <div className={clsx(styles.mediumText, applyEllipsis && styles.ellipsis, isLoading && styles.opacity07)}>
          {displayValue}
        </div>
      </div>
      <CopyIconButton
        value={copyValue}
        ariaLabel={ariaLabel}
        resetDelay={1000}
        className={styles.customCopy}
        disabled={isCopyDisabled}
      />
    </div>
  )
}

export function QuickActions() {
  const navigate = useNavigate()
  const userInfo = useUnit($userInfo)

  const referralCode = userInfo.referralCode
  const referralLink = getReferralLinkXanova(referralCode)

  return (
    <div className={clsx(styles.gridBlock, styles.topLeftWidget)}>
      <h4 className={styles.title}>Quick Actions</h4>
      <div className={styles.flexVerticalGap16}>
        <QuickActionRow
          label='Your Referral Code:'
          value={referralCode}
          copyValue={referralCode}
          isLoading={false}
          ariaLabel='copy-referral-code'
        />
        <QuickActionRow
          label='Your Referral Link:'
          value={referralLink}
          copyValue={referralLink}
          isLoading={false}
          ariaLabel='copy-referral-link'
          applyEllipsis
        />
      </div>
      <div className={styles.buttonsWrap}>
        <button className='btn-xanova black' onClick={() => navigate(pages.AI_TOOL.path)}>
          Open AI Tool
        </button>
        <button className='btn-xanova gold' onClick={() => navigate(pages.WALLET.path)}>
          Go to Wallet
        </button>
      </div>
    </div>
  )
}
