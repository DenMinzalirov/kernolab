import React, { useEffect } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { BackButtonBiz } from 'components/back-button-biz'
import { CodeInput } from 'components/code-input'
import { $userInfo, getUserInfoFx } from 'model/user-info'

import { ErrorViewBiz } from './error-view-biz'
import { ResendViewBiz } from './resend-view-biz'
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

export const PhoneVerifyAndTotpViewBiz = ({
  action,
  errorMessage = '',
  setErrorMessage,
  newPhone,
  isLoading,
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
      <BackButtonBiz backFn={backButtonFn} padding={30} /> {/* hide for mobile */}
      <div className={styles.header}>
        We have sent a code to your {newPhone ? 'new phone' : 'phone'}:{' '}
        <span className={styles.accentText}>{newPhone || userInfo.phone}</span>
        <br />
        Please enter the code below to continue.
      </div>
      <div className={styles.body}>
        <div className={clsx(styles.label, !!errorMessage && styles.errorLabel)}>Code</div>
        <CodeInput onComplete={handleCompete} errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
        <ErrorViewBiz errorMessage={errorMessage} />
        <ResendViewBiz action={handleOnResend} />
      </div>
      <div className={styles.footer}>
        <button type='submit' className='btn-biz blue big' disabled={true}>
          {isLoading ? <span className='spinner-border' /> : 'Continue'}
        </button>
        <button type='button' onClick={backButtonFn} className='btn-biz transparent big showMd'>
          Back
        </button>
      </div>
    </div>
  )
}
