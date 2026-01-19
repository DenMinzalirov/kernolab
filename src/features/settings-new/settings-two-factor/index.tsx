import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { SuccessPairs } from 'features/success-pairs'

import { HeaderTitle, Modal, Spinner } from '../../../components'
import { pages } from '../../../constant'
import { $twoFaStatus, setTwoFaStatusEv } from '../../../model/two-fa'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from '../../../wip/services'
import { SecurityTimerModal } from '../../modals/security-timer-modal'
import { StepControllerComponent } from '../../step-controller'
import styles from './styles.module.scss'

export function SettingsTwoFactor() {
  const twoFa = useUnit($twoFaStatus)

  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)

  const handleFinalAction = () => {
    setTwoFaStatusEv(!twoFa) // TODO можно распарсить токен и получить MFA

    if (twoFa) {
      Modal.open(<SecurityTimerModal />, {
        variant: 'center',
      })
      navigate(pages.SETTINGS.path)
    } else {
      setIsSuccess(true)
    }
  }

  const handleOffOnSetup = async () => {
    setIsLoading(true)

    // setResponseError('')
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
      // setResponseError(error?.code || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleOffOnSetup()
  }, [])

  if (isSuccess) {
    return (
      <SuccessPairs
        title={'Two Factor Authentication\nSetup Successfully'}
        description={'Your account is more secure, and you will need to verify your identity.'}
        headerTitle={'2FA Setup'}
        btnText='Go Back to Settings'
        btnAction={() => {
          navigate(pages.SETTINGS.path)
          Modal.close()
        }}
      />
    )
  }

  return (
    <div
      // className={styles.container}
      className='page-container-pairs'
    >
      {/*<div className={styles.headerWrap}>*/}
      <HeaderTitle headerTitle={'2FA Setup'} showBackBtn backBtnTitle={'Settings'} />
      {/*</div>*/}
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
                  navigate(pages.SETTINGS.path)
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
