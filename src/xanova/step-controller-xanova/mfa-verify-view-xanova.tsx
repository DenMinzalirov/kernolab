import React, { useState } from 'react'
import QRCode from 'react-qr-code'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CodeInput } from 'components/code-input'
import { CopiedBiz } from 'components/copied-biz'
import { MFAAddAuthResponse } from 'wip/services'
import { CopyBizIcon } from 'icons/copy-biz'
import { qrName } from 'config'
import { $userInfo } from 'model/user-info'
import backArrow from 'assets/icons/back-arrow.svg'

import { ErrorViewXanova } from './error-view-xanova'
import styles from './styles.module.scss'

type Props = {
  response: MFAAddAuthResponse
  isQrCodeScreen: boolean
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  handleNext: () => void
  backButtonFn: () => void
}

export function MfaVerifyViewXanova({
  response,
  isQrCodeScreen,
  action,
  errorMessage,
  setErrorMessage,
  isLoading,
  handleNext,
  backButtonFn,
}: Props) {
  const userInfo = useUnit($userInfo)

  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = (): void => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  return (
    <div className={styles.containerWrap}>
      <div className={styles.header}>
        {isQrCodeScreen ? (
          'Please enter the following address to\u00A0an\u00A0authenticator\u00A0of\u00A0your\u00A0choice. '
        ) : (
          <>
            Please enter the code from your <span className={styles.accentText}>authenticator.</span>
          </>
        )}
      </div>
      <div className={styles.body}>
        {isQrCodeScreen ? (
          <>
            <div className={styles.qrBlock}>
              <QRCode
                size={245}
                className={styles.qrCodeContainer}
                value={`otpauth://totp/${userInfo.email}?secret=${response.secret || ''}&issuer=${qrName()}`}
                viewBox='0 0 245 245'
              />

              {isCopied ? (
                <div>
                  <CopiedBiz value={'Copied'} /> {/* TODO дороботать компонент сответствующий дизайну */}
                </div>
              ) : (
                <div onClick={handleCopy} className={styles.secretWrap}>
                  <div className={styles.secretText}>{response?.secret || ''}</div>
                  <CopyBizIcon fill={'var(--Xanova-Black)'} />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={clsx(styles.label, !!errorMessage && styles.errorLabel)}>2FA</div>
            <CodeInput onComplete={action} errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
            <ErrorViewXanova errorMessage={errorMessage} />
          </>
        )}
      </div>
      <div className={styles.footer}>
        <button type='button' onClick={backButtonFn} className='btn-with-icon-xanova circle40'>
          <img alt={'Back'} src={backArrow} />
        </button>
        <button onClick={handleNext} className='btn-xanova gold'>
          {isLoading ? <span className='spinner-border' /> : 'Next'}
        </button>
      </div>
    </div>
  )
}
