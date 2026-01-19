import React from 'react'
import clsx from 'clsx'

import { BackButtonBiz } from 'components/back-button-biz'
import { CodeInput } from 'components/code-input'

import { ErrorViewBiz } from './error-view-biz'
import styles from './styles.module.scss'

type Props = {
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  backButtonFn: () => void
}

export const MfaConfirmViewBiz = ({ action, errorMessage, setErrorMessage, isLoading, backButtonFn }: Props) => {
  const handleCompete = (data: any) => {
    action(data)
  }

  return (
    <div className={styles.containerWrap}>
      <BackButtonBiz backFn={backButtonFn} padding={30} /> {/* hide for mobile */}
      <div className={styles.header}>
        Please enter the code from your <span className={styles.accentText}>authenticator.</span>
      </div>
      <div className={styles.body}>
        <div className={clsx(styles.label, !!errorMessage && styles.errorLabel)}>2FA Code</div>
        <CodeInput onComplete={handleCompete} setErrorMessage={setErrorMessage} errorMessage={errorMessage} />
        <ErrorViewBiz errorMessage={errorMessage} />
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
