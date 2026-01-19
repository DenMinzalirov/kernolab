import React from 'react'

import { CodeInput } from 'components/code-input'
import { ResendView } from 'components/resend-view'
import { TriangleIcon } from 'icons'
import { isBiz, isXanova } from 'config'

import { ErrorView } from './error-view'
import styles from './styles.module.scss'
import { PhoneVerifyAndTotpViewBiz } from 'biz/step-controller-biz/phone-verify-and-totp-view-biz'
import { PhoneVerifyAndTotpViewXanova } from 'xanova/step-controller-xanova/phone-verify-and-totp-view-xanova'

type Props = {
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  handleResend: () => Promise<void>
  backButtonFn: () => void
  phone?: string
}

export const NewPhoneVerifyView = ({
  action,
  errorMessage,
  setErrorMessage,
  isLoading,
  handleResend,
  backButtonFn,
  phone,
}: Props) => {
  const handleAction = (inputData: string) => {
    action(inputData)
  }

  const handleOnResend = () => {
    handleResend()
  }

  if (isBiz) {
    return (
      <PhoneVerifyAndTotpViewBiz
        action={action}
        newPhone={phone}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoading={isLoading}
        backButtonFn={backButtonFn}
        handleOnResend={handleOnResend}
      />
    )
  }

  if (isXanova) {
    return (
      <PhoneVerifyAndTotpViewXanova
        action={action}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoading={isLoading}
        backButtonFn={backButtonFn}
        handleOnResend={handleOnResend}
      />
    )
  }

  return (
    <form className={styles.formWrap}>
      <div className={styles.description}>
        We have sent you a code to <span className={styles.boldText}>{phone ? phone : ''}</span>
        <br />
        Please enter the received code below to confirm your phone number.
      </div>

      <div className={styles.codeInputWrap}>
        <label htmlFor='code' className={styles.inputCodeLabel}>
          The phone code
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
