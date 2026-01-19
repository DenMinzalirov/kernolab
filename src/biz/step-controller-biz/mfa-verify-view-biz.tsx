import React, { useState } from 'react'
import QRCode from 'react-qr-code'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { BackButtonBiz } from 'components/back-button-biz'
import { CodeInput } from 'components/code-input'
import { CopiedBiz } from 'components/copied-biz'
import { MFAAddAuthResponse } from 'wip/services'
import { CopyBizIcon } from 'icons/copy-biz'
import { qrName } from 'config'
import { $userInfo } from 'model/user-info'

import { ErrorViewBiz } from './error-view-biz'
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

export function MfaVerifyViewBiz({
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
      <BackButtonBiz backFn={backButtonFn} padding={30} /> {/* hide for mobile */}
      <div className={styles.header}>
        {isQrCodeScreen
          ? 'Please enter the following address to\u00A0an\u00A0authenticator\u00A0of\u00A0your\u00A0choice. '
          : 'Please enter the code from your authenticator.'}
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
                  <CopyBizIcon />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={clsx(styles.label, !!errorMessage && styles.errorLabel)}>2FA</div>
            <CodeInput onComplete={action} errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
            <ErrorViewBiz errorMessage={errorMessage} />
          </>
        )}
      </div>
      <div className={styles.footer}>
        <button onClick={handleNext} className='btn-biz blue big'>
          {isLoading ? <span className='spinner-border' /> : 'Continue'}
        </button>
        <button type='button' onClick={backButtonFn} className='btn-biz transparent big showMd'>
          Back
        </button>
      </div>
    </div>
  )
}
