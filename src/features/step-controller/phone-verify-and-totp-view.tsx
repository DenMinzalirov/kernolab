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
import { PhoneVerifyAndTotpViewBiz } from 'biz/step-controller-biz/phone-verify-and-totp-view-biz'
import { PhoneVerifyAndTotpViewXanova } from 'xanova/step-controller-xanova/phone-verify-and-totp-view-xanova'

type Props = {
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  handleResend: () => Promise<void>
  phone?: string
  backButtonFn: () => void
}

export const PhoneVerifyAndTotpView = ({
  action,
  errorMessage,
  setErrorMessage,
  handleResend,
  isLoading,
  phone,
  backButtonFn,
}: Props) => {
  const userInfo = useUnit($userInfo)

  useEffect(() => {
    if (!phone) {
      const userToken = getToken()
      userToken && getUserInfoFx()
    }
  }, [])

  const handleOnResend = () => {
    handleResend()
    // reset()
  }

  const handleAction = (inputData: string) => {
    setErrorMessage('')

    action(inputData)
  }

  if (isBiz) {
    return (
      <PhoneVerifyAndTotpViewBiz
        action={action}
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
        We have sent a code to your phone <span className={styles.boldText}>{phone ? phone : userInfo.phone}</span>
        <br />
        Please enter the code below to continue.
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
