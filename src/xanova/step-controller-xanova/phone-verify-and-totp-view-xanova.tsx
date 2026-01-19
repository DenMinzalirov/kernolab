import React, { useEffect } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CodeInput } from 'components/code-input'
import { $userInfo, getUserInfoFx } from 'model/user-info'
import backArrow from 'assets/icons/back-arrow.svg'

import { ErrorViewXanova } from './error-view-xanova'
import { ResendViewXanova } from './resend-view-xanova'
// import { ErrorViewXanova } from './error-view-xanova'
// import { ResendViewXanova } from './resend-view-xanova'
import styles from './styles.module.scss'

type Props = {
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  newPhone?: string
  isLoading: boolean
  backButtonFn: () => void
  handleOnResend: () => void
}

export const PhoneVerifyAndTotpViewXanova = ({
  action,
  errorMessage = '',
  setErrorMessage,
  newPhone,
  backButtonFn,
  handleOnResend,
}: Props) => {
  const userInfo = useUnit($userInfo)

  useEffect(() => {
    !userInfo.phone && getUserInfoFx()
  }, [])
  const handleCompete = (data: any) => {
    action(data)
  }
  return (
    <div className={styles.containerWrap}>
      <div className={styles.header}>
        We have sent a code to your {newPhone ? 'new phone' : 'phone'}:{' '}
        <span className={styles.accentText}>{newPhone || userInfo.phone}</span>
        <br />
        Please enter the code below to continue.
      </div>
      <div className={styles.body}>
        <div className={clsx(styles.label, !!errorMessage && styles.errorLabel)}>Code</div>
        <CodeInput onComplete={handleCompete} errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
        <ErrorViewXanova errorMessage={errorMessage} />
        <ResendViewXanova action={handleOnResend} />
      </div>
      <div className={styles.footer}>
        <button type='button' onClick={backButtonFn} className='btn-with-icon-xanova grey width100'>
          <img alt={'Back'} src={backArrow} />
          Back
        </button>
      </div>
    </div>
  )
}
