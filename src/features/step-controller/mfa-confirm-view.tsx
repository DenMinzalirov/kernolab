import React from 'react'

import { CodeInput } from 'components/code-input'
import { TriangleIcon } from 'icons'
import { isBiz, isXanova } from 'config'

import { ErrorView } from './error-view'
import styles from './styles.module.scss'
import { MfaConfirmViewBiz } from 'biz/step-controller-biz/mfa-confirm-view-biz'
import { MfaConfirmViewXanova } from 'xanova/step-controller-xanova/mfa-confirm-view-xanova'

type Props = {
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  backButtonFn: () => void
}

export const MfaConfirmView = ({ action, errorMessage, isLoading, setErrorMessage, backButtonFn }: Props) => {
  const handleAction = (inputData: string) => {
    setErrorMessage('')

    action(inputData)
  }

  if (isBiz) {
    return (
      <MfaConfirmViewBiz
        action={action}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoading={isLoading}
        backButtonFn={backButtonFn}
      />
    )
  }
  if (isXanova) {
    return (
      <MfaConfirmViewXanova
        action={action}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoading={isLoading}
        backButtonFn={backButtonFn}
      />
    )
  }

  return (
    <form className={styles.formWrap}>
      <div>
        <div className={styles.description}>Please enter the code from your authenticator.</div>
      </div>

      <div className={styles.codeInputWrap}>
        <label htmlFor='code' className={styles.inputCodeLabel}>
          2FA Code
        </label>
        <CodeInput onComplete={handleAction} errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
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
