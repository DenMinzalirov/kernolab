import React from 'react'

import { CodeInput } from 'components/code-input'
import { ResendView } from 'components/resend-view'
import { TriangleIcon } from 'icons'
import { isBiz, isXanova } from 'config'

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

export const NewEmailVerifyView = ({
  action,
  errorMessage,
  setErrorMessage,
  isLoading,
  handleResend,
  backButtonFn,
  email,
}: Props) => {
  const handleAction = (inputData: string) => {
    action(inputData)
  }

  const handleOnResend = () => {
    handleResend()
  }

  if (isBiz) {
    return (
      <EmailVerifyAndTotpViewBiz
        newEmail={email}
        action={action}
        errorMessage={errorMessage}
        handleOnResend={handleOnResend}
        setErrorMessage={setErrorMessage}
        backButtonFn={backButtonFn}
        isLoading={isLoading}
      />
    )
  }

  if (isXanova) {
    return (
      <EmailVerifyAndTotpViewXanova
        newEmail={email}
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
        We have sent a code to your email <span className={styles.boldText}>{email ? email : null}</span>
        <br />
        Please enter the code below to continue.
      </div>

      <div className={styles.codeInputWrap}>
        <label htmlFor='code' className={styles.inputCodeLabel}>
          The email code
        </label>
        <CodeInput onComplete={handleAction} errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
        <ResendView action={handleOnResend} />
      </div>

      <ErrorView errorMessage={errorMessage} />

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
