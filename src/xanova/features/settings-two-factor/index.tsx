import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal, Spinner } from 'components'
import { pages } from 'constant'
import { StepControllerComponent, STEPS } from 'features/step-controller'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { $stepControllerNextStep } from 'model/step-controller'
import { $twoFaStatus, setTwoFaStatusEv } from 'model/two-fa'

import styles from './styles.module.scss'
import { TwoFactorOffSuccessModal } from './two-factor-off-success-modal'
import { StepsLayoutXanova } from 'xanova/components/steps-layout'
import { SuccessContentXanova } from 'xanova/components/success-content/success-content'
import { SecurityTimerModalXanova } from 'xanova/modal/security-timer-modal-xanova'

const FOR_TWO_FA_OFF = [{ label: '2FA Code', value: STEPS.MFA_CONFIRM }]

const FOR_TWO_FA_ON = [
  { label: 'Email Code', value: STEPS.CONFIRM_EMAIL },
  { label: 'Connect', value: STEPS.MFA_ADD },
  { label: '2FA Code', value: STEPS.MFA_VERIFY },
]

export function SettingsTwoFactorXanova() {
  const twoFa = useUnit($twoFaStatus)
  const activeStep = useUnit($stepControllerNextStep)

  const stepsLayoutConfig = twoFa ? FOR_TWO_FA_OFF : FOR_TWO_FA_ON

  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const showSecurityTimer = () => {
    Modal.open(<SecurityTimerModalXanova enableFetch={true} />, {
      variant: 'center',
    })
  }
  const handleFinalAction = () => {
    setTwoFaStatusEv(!twoFa) // TODO можно распарсить токен и получить MFA

    if (twoFa) {
      // old state twoFa
      // 2fa off successful
      navigate(pages.ACCOUNT_SETTINGS.path)
      Modal.open(<TwoFactorOffSuccessModal customClose={showSecurityTimer} />, {
        variant: 'center',

        //После закрытия модалки нужно открыть модалку с таймером
        customCloseModal: showSecurityTimer,
      })
    } else {
      setIsSuccess(true)
    }
  }

  const handleOffOnSetup = async () => {
    setIsLoading(true)

    try {
      if (!twoFa) {
        const mfaSetupData = await AuthServiceV4.mfaSetup()
        setResponse(mfaSetupData)
      }

      if (twoFa) {
        const deleteMfaRes = await AuthServiceV4.deleteMfa()
        setResponse(deleteMfaRes)
      }
    } catch (error: any) {
      console.log('ERROR-OffOnSetup', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleOffOnSetup()
  }, [])

  if (isSuccess) {
    return (
      <StepsLayoutXanova steps={FOR_TWO_FA_ON} activeStep={'success'}>
        <SuccessContentXanova
          title={'2FA\nSetup Successful'}
          btnText={'Return to Settings'}
          action={() => navigate(pages.ACCOUNT_SETTINGS.path)}
          subTitle={'Your account is now protected with an extra layer of security.'}
        />
      </StepsLayoutXanova>
    )
  }

  return (
    <StepsLayoutXanova steps={stepsLayoutConfig} activeStep={activeStep}>
      <div className={styles.contentWrap}>
        {isLoading ? <Spinner /> : null}
        {response && !isLoading && (
          <div>
            <div className={styles.title}>Two Factor Authentication</div>
            <StepControllerComponent
              nextStepResponse={response}
              finalAction={handleFinalAction}
              dataProps={{
                resetStepUp: () => {
                  setResponse(null)
                  navigate(pages.ACCOUNT_SETTINGS.path)
                },
              }}
            />
          </div>
        )}
      </div>
    </StepsLayoutXanova>
  )
}
