import React, { useEffect } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CodeInput } from 'components/code-input'
import { $userInfo, getUserInfoFx } from 'model/user-info'
import backArrow from 'assets/icons/back-arrow.svg'

import { getToken } from '../../utils'
// import { ErrorViewXanova } from './error-view-xanova'
// import { ResendViewXanova } from './resend-view-xenova'
import { ErrorViewXanova } from './error-view-xanova'
import { ResendViewXanova } from './resend-view-xanova'
// import { ResendViewXanova } from './resend-view-xanova'
import styles from './styles.module.scss'

type Props = {
  action: (confirmationCode: string) => Promise<void>
  handleOnResend: () => void
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  backButtonFn: () => void
  newEmail?: string
}

export function EmailVerifyAndTotpViewXanova({
  action,
  newEmail,
  handleOnResend,
  errorMessage = '',
  setErrorMessage,
  backButtonFn,
}: Props) {
  const userInfo = useUnit($userInfo)

  useEffect(() => {
    if (!userInfo.email) {
      const userToken = getToken()
      userToken && getUserInfoFx()
    }
  }, [])

  const handleCompete = (data: any) => {
    action(data)
  }

  return (
    <div className={styles.containerWrap}>
      <div className={styles.header}>
        We have sent a code to your email <span className={styles.accentText}>{newEmail || userInfo.email}</span>
        <br />
        Please enter the code below to continue.
      </div>
      <div className={styles.body}>
        <div className={clsx(styles.label, !!errorMessage && styles.errorLabel)}>The email code</div>
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
