import { useEffect, useState } from 'react'

import { AuthServiceV4 } from 'wip/services/auth-v4'

import styles from './styles.module.scss'
import { CopyIconButton } from 'xanova/components/copy-icon-button'

const bankDetails = [
  { key: 'Account Holder Name', value: 'Cuenta: 95601123773' },
  { key: 'CLABE Interbancaria', value: '044180956011237737' },
  { key: 'Bank Name', value: 'Scotiabank Mexico' },
  { key: 'BIC / SWIFT Code', value: 'MBCOMXMMXXX' },
  { key: 'Bank Address', value: 'Boulevard Manuel Ávila Camacho 1, Floor 19, Mexico City, Mexico' },
  {
    key: 'Your Reference Code\n(Must be included in the description)',
    value: 'XXXX',
  },
  {
    key: 'Tax Reference / RFC',
    value: 'XES250514530',
  },
] as const

type ReferenceState = {
  value: string
  isLoading: boolean
}

export function FiatTab() {
  const [{ value: referenceCode, isLoading: isReferenceLoading }, setReferenceState] = useState<ReferenceState>({
    value: '',
    isLoading: true,
  })

  useEffect(() => {
    let isActive = true

    const loadReferralCode = async () => {
      try {
        setReferenceState(prev => ({ ...prev, isLoading: true }))
        const response = await AuthServiceV4.userInfo()
        if (!isActive) return

        setReferenceState({
          value: response.referralCode ?? '',
          isLoading: false,
        })
      } catch (error) {
        console.error('Failed to load referral code', error)
        if (!isActive) return
        setReferenceState({
          value: '',
          isLoading: false,
        })
      }
    }

    loadReferralCode()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <div className={styles.tabContent}>
      <div className={styles.flexVerticalGap24}>
        {bankDetails.map(({ key, value }) => {
          const isReferenceRow = key === 'Your Reference Code\n(Must be included in the description)'
          const rawValue = isReferenceRow ? referenceCode : value
          const displayValue = isReferenceRow ? (isReferenceLoading ? null : rawValue || '—') : value

          return (
            <div className={styles.flexHorizontalCenterSpaceBetween} key={key}>
              <div className={styles.flexVerticalGap8}>
                <div className={styles.subText}>{key}</div>
                <div className={styles.text}>
                  {isReferenceRow && isReferenceLoading ? (
                    <span className={styles.loadingPlaceholder}>Loading...</span>
                  ) : (
                    displayValue
                  )}
                </div>
              </div>
              <CopyIconButton
                value={rawValue}
                ariaLabel={`Copy ${key}`}
                resetDelay={1000}
                disabled={isReferenceRow && (isReferenceLoading || !rawValue)}
              />
            </div>
          )
        })}
      </div>

      <div className={styles.totalInfo}>
        <p className={styles.text}>Total:</p>
        <p className={styles.value}>3000$</p>
      </div>

      <div className={styles.paddingText}>
        {
          // eslint-disable-next-line max-len
          'Please wait while we confirm the transaction.\nThis usually takes a few minutes, depending on network activity.'
        }
      </div>
    </div>
  )
}
