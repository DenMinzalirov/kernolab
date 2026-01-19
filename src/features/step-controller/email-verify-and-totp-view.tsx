import React, { useEffect } from 'react'
import { useUnit } from 'effector-react'

import { CodeInput } from 'components/code-input'
import { ResendView } from 'components/resend-view'
import { getToken } from 'utils'
import { TriangleIcon } from 'icons'
import { isBiz, isXanova } from 'config'
import { $userInfo, getUserInfoFx } from 'model/user-info'

import { ErrorView } from './error-view'
import styles from './styles.module.scss'
import { EmailVerifyAndTotpViewBiz } from 'biz/step-controller-biz/email-verify-and-totp-view-biz'
import { EmailVerifyAndTotpViewXanova } from 'xanova/step-controller-xanova/email-verify-and-totp-view-xanova'

type Props = {
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  handleResend: () => Promise<void>
  backButtonFn: () => void
  email?: string
}

export const EmailVerifyAndTotpView = ({
  action,
  errorMessage,
  setErrorMessage,
  handleResend,
  isLoading,
  email,
  backButtonFn,
}: Props) => {
  const userInfo = useUnit($userInfo)

  useEffect(() => {
    if (!userInfo.email) {
      const userToken = getToken()
      userToken && getUserInfoFx()
    }
  }, [])

  const handleOnResend = () => {
    handleResend()
  }

  const handleAction = (inputData: string) => {
    setErrorMessage('')

    action(inputData)
  }

  if (isBiz) {
    return (
      <EmailVerifyAndTotpViewBiz
        action={action}
        handleOnResend={handleOnResend}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoading={isLoading}
        backButtonFn={backButtonFn}
      />
    )
  }

  if (isXanova) {
    return (
      <EmailVerifyAndTotpViewXanova
        action={action}
        handleOnResend={handleOnResend}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoading={isLoading}
        backButtonFn={backButtonFn}
      />
    )
  }

  return (
    <form className={styles.formWrap}>
      <div className={styles.description}>
        Please enter the code we sent to your email:
        <br />
        <span className={styles.boldText}>{email ? email : userInfo.email}</span>
      </div>

      <div className={styles.codeInputWrap}>
        <label htmlFor='code' className={styles.inputCodeLabel}>
          The Email Code
        </label>
        <CodeInput onComplete={handleAction} errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
        <ResendView action={handleOnResend} />
      </div>

      {errorMessage ? <ErrorView errorMessage={errorMessage} /> : null}

      <div className={styles.button}>
        <button onClick={backButtonFn} className='btn-new grey big'>
          {isLoading ? (
            <span className='spinner-border' />
          ) : (
            <>
              <div style={{ height: 16, marginRight: 6, width: 16 }}>
                <TriangleIcon fill={'var(--Deep-Space)'} />
              </div>
              <div>Step Back</div>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
