import { Dispatch, SetStateAction } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from '../../../../components'
import { $twoFaStatus } from '../../../../model/two-fa'
import { ACCOUNT_PAGES } from '../../account-settings'
import styles from './styles.module.scss'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

type Props = {
  setPage: Dispatch<SetStateAction<string>>
}

export function TwoFaOnOffBiz({ setPage }: Props) {
  const twoFa = useUnit($twoFaStatus)

  const { isMobileBiz } = useCurrentBreakpoint()

  const handleClose = () => Modal.close()

  const handleStart = async () => {
    setPage(ACCOUNT_PAGES.CHANGE_TWO_FA)
    Modal.close()
  }

  return (
    <div className={styles.containerModal}>
      {twoFa ? (
        <>
          <div className={styles.textTitle}>Turn Off 2FA?</div>

          <div className={styles.height12} />

          <div className={styles.textDescription} style={{ textAlign: 'left' }}>
            Disabling Two-Factor Authentication (2FA) will remove an&nbsp;extra layer of&nbsp;security from your
            account. <br />
            <br />
            With 2FA deactivated, your account will only be protected by&nbsp;your&nbsp;password. This may increase the
            risk of&nbsp;unauthorised access. If&nbsp;you are sure you want to&nbsp;proceed, please confirm your
            decision.
          </div>
        </>
      ) : (
        <>
          <div className={styles.textTitle}>{isMobileBiz ? '2FA' : 'Two Factor Authentication'}</div>

          <div className={styles.height12} />

          <div className={styles.textDescription}>
            To setup Two Factor Authentication please follow the instructions.
          </div>
        </>
      )}

      <div className={styles.height36} />

      <button onClick={handleStart} className={clsx('btn-biz blue', { ['red']: twoFa })}>
        {twoFa ? 'Turn Off-Anyway' : 'Start Setup'}
      </button>
      <div className={styles.height12} />
      <button onClick={handleClose} className='btn-biz transparent'>
        Cancel
      </button>
    </div>
  )
}
