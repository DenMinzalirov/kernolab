import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { getReferralLinkXanova } from 'config'
import { $userInfo } from 'model/user-info'

import styles from './styles.module.scss'
import { useCurrentBreakpointXanova } from 'hooks/use-current-breakpoint-xanova'
import { CopyIconButton } from 'xanova/components/copy-icon-button'

export function ReferralProgram() {
  const userInfo = useUnit($userInfo)
  const { isTabletXanova } = useCurrentBreakpointXanova()

  const iconFill = isTabletXanova ? 'var(--Xanova-Black)' : 'var(--Xanova-Gold)'
  const copiedIconFill = isTabletXanova ? 'var(--Xanova-Black)' : 'var(--Xanova-White)'

  const referralCode = userInfo.referralCode
  const referralLink = getReferralLinkXanova(referralCode)
  return (
    <div className={styles.referralProgramContainer}>
      <h4 className={styles.referralProgramTitle}>Referral Program</h4>

      <div className={styles.referralProgramContent}>
        <div className={styles.referralProgramRowWrap}>
          <div className={styles.referralProgramRow}>
            <div className={styles.referralProgramRowText}>Your Referral Code:</div>
            <div className={styles.referralProgramRowSubTextWrap}>
              <div className={styles.referralProgramRowSubText}>{referralCode}</div>
              <CopyIconButton
                value={referralCode}
                ariaLabel={'Copy Referral Code'}
                resetDelay={1000}
                className={styles.customCopy}
                // disabled={isCopyDisabled}
                iconFill={iconFill}
                copiedIconFill={copiedIconFill}
              />
            </div>
          </div>

          <div className={styles.referralProgramRow}>
            <div className={styles.referralProgramRowText}>Your Referral Link: </div>
            <div className={styles.referralProgramRowSubTextWrap}>
              <div className={clsx(styles.referralProgramRowSubText, styles.ellipsis)}>{referralLink}</div>
              <CopyIconButton
                value={referralLink}
                ariaLabel={'Copy Referral Code Link'}
                resetDelay={1000}
                className={styles.customCopy}
                // disabled={isCopyDisabled}
                iconFill={iconFill}
                copiedIconFill={copiedIconFill}
              />
            </div>
          </div>
        </div>
        <p className={clsx(styles.referralProgramRowText, styles.marginTopAuto)}>
          Share your referral link with new members. When they&apos;re ready to sign up, you earn commissions
          automatically.
        </p>
      </div>
    </div>
  )
}
