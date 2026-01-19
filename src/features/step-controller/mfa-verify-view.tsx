import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { QRCodeBlock } from 'components'
import { CodeInput } from 'components/code-input'
import { getToken } from 'utils'
import { MFAAddAuthResponse } from 'wip/services'
import { CheckedIcon, TriangleIcon } from 'icons'
import { isBiz, isXanova, qrName } from 'config'
import { setStepControllerNextStepEV } from 'model/step-controller'
import { $userInfo, getUserInfoFx } from 'model/user-info'

import { STEPS } from '.'
import { ErrorView } from './error-view'
import styles from './styles.module.scss'
import { MfaVerifyViewBiz } from 'biz/step-controller-biz/mfa-verify-view-biz'
import { MfaVerifyViewXanova } from 'xanova/step-controller-xanova/mfa-verify-view-xanova'

type Inputs = {
  code: string
}
const defaultValues = {
  code: '',
}

type Props = {
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  response: MFAAddAuthResponse
  backButtonFn: () => void
}

export const MfaVerifyView = ({ isLoading, response, action, errorMessage, setErrorMessage, backButtonFn }: Props) => {
  const userInfo = useUnit($userInfo)

  useEffect(() => {
    if (!userInfo.email) {
      const userToken = getToken()
      userToken && getUserInfoFx()
    }
  }, [])

  const { watch } = useForm<Inputs>({ defaultValues })

  const [isCopied, setIsCopied] = useState(false)
  const [isQrCodeScreen, setIsQrCodeScreen] = useState<boolean>(true)

  const inputValue = watch('code')

  useEffect(() => {
    !!errorMessage && setErrorMessage('')
  }, [inputValue])

  const handleNext = () => {
    setIsQrCodeScreen(false)
    setStepControllerNextStepEV(STEPS.MFA_VERIFY)
  }

  const handleCopy = (): void => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  const handleAction = (inputData: string) => {
    action(inputData)
  }

  if (isBiz) {
    return (
      <MfaVerifyViewBiz
        response={response}
        isQrCodeScreen={isQrCodeScreen}
        action={action}
        handleNext={handleNext}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoading={isLoading}
        backButtonFn={backButtonFn}
      />
    )
  }
  if (isXanova) {
    return (
      <MfaVerifyViewXanova
        response={response}
        isQrCodeScreen={isQrCodeScreen}
        action={action}
        handleNext={handleNext}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoading={isLoading}
        backButtonFn={backButtonFn}
      />
    )
  }

  return (
    <>
      {isQrCodeScreen ? (
        <div className={clsx(styles.contentQrCode, styles.formMobileContent)}>
          <div className={styles.description} style={{ marginBottom: 10 }}>
            Please enter the following address to an <br />
            authenticator of your choice.
          </div>
          <QRCodeBlock
            stringCode={response.secret || ''}
            dataString={`otpauth://totp/${userInfo.email}?secret=${response.secret || ''}&issuer=${qrName()}`}
            copiedAction={handleCopy}
          />
          {isCopied ? (
            <div
              style={{
                backgroundColor: '#262832',
                color: '#FFFFFF',
                height: 32,
                marginTop: 9,
                marginBottom: 13,
                borderRadius: 100,
                display: 'flex',
                alignItems: 'center',
                padding: '0 11px',
              }}
            >
              <div style={{ marginRight: 6 }}>Copied</div>
              <CheckedIcon />
            </div>
          ) : (
            <div style={{ height: 54 }} />
          )}

          <button type='button' className='btn-new primary big' disabled={isLoading} onClick={handleNext}>
            {isLoading ? <span className='spinner-border' /> : 'Next'}
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </>
  )
}
