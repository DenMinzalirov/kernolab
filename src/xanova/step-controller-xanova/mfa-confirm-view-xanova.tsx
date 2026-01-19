import React from 'react'
import clsx from 'clsx'

import { CodeInput } from 'components/code-input'
import backArrow from 'assets/icons/back-arrow.svg'

import { ErrorViewXanova } from './error-view-xanova'
import styles from './styles.module.scss'

type Props = {
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  backButtonFn: () => void
}

export const MfaConfirmViewXanova = ({ action, errorMessage, setErrorMessage, isLoading, backButtonFn }: Props) => {
  const handleCompete = (data: any) => {
    action(data)
  }

  return (
    <div className={styles.containerWrap}>
      <div className={styles.header}>
        Please enter the code from your <span className={styles.accentText}>authenticator.</span>
      </div>
      <div className={styles.body}>
        <div className={clsx(styles.label, !!errorMessage && styles.errorLabel)}>2FA Code</div>
        <CodeInput onComplete={handleCompete} setErrorMessage={setErrorMessage} errorMessage={errorMessage} />
        <ErrorViewXanova errorMessage={errorMessage} />
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
