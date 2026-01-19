import React, { useEffect } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { BackButtonBiz } from 'components/back-button-biz'
import { CodeInput } from 'components/code-input'
import { $userInfo, getUserInfoFx } from 'model/user-info'

import { getToken } from '../../utils'
import { ErrorViewBiz } from './error-view-biz'
import { ResendViewBiz } from './resend-view-biz'
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

export function EmailVerifyAndTotpViewBiz({
  action,
  newEmail,
  handleOnResend,
  errorMessage = '',
  setErrorMessage,
  isLoading,
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
      <BackButtonBiz backFn={backButtonFn} padding={30} /> {/* hide for mobile */}
      <div className={styles.header}>
        We have sent a code to your email <span className={styles.accentText}>{newEmail || userInfo.email}</span>
        <br />
        Please enter the code below to continue.
      </div>
      <div className={styles.body}>
        <div className={clsx(styles.label, !!errorMessage && styles.errorLabel)}>The email code</div>
        <CodeInput onComplete={handleCompete} errorMessage={errorMessage} setErrorMessage={setErrorMessage} />

        <ErrorViewBiz errorMessage={errorMessage} />
        <ResendViewBiz action={handleOnResend} />
      </div>
      <div className={styles.footer}>
        <button className='btn-biz blue big' disabled={true}>
          {isLoading ? <span className='spinner-border' /> : 'Continue'}
        </button>
        <button type='button' onClick={backButtonFn} className='btn-biz transparent big showMd'>
          Back
        </button>
      </div>
    </div>
  )
}
