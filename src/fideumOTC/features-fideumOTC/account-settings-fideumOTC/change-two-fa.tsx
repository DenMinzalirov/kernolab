import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useUnit } from 'effector-react'

import { Modal, Spinner } from 'components'
import { BackButtonBiz } from 'components/back-button-biz'
import { SuccessfullyBiz } from 'components/successfully-biz'
import { StepControllerComponent } from 'features/step-controller'
import { handleError } from 'utils/error-handler'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { $twoFaStatus, setTwoFaStatusEv } from 'model/two-fa'

import { ACCOUNT_PAGES_FIDEUM_OTC } from '.'
import styles from './styles.module.scss'
import { CONFIRMATION_MODAL_OPTIONS, ConfirmationModalBiz } from 'biz/features-biz/modals-biz/confirmation-modal-biz'
import { SecurityTimerModalBiz } from 'biz/features-biz/modals-biz/security-timer-modal-biz'

type Props = {
  setPage: Dispatch<SetStateAction<string>>
}

export function ChangeTwoFa({ setPage }: Props) {
  const twoFa = useUnit($twoFaStatus)

  const [isLoading, setIsLoading] = useState(true)
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)
  const [isSuccessful, setIsSuccessful] = useState(false)

  const handleBack = () => {
    setPage(ACCOUNT_PAGES_FIDEUM_OTC.ACCOUNT_DETAILS)
  }

  const handleResponse = (res: AuthResponse) => {
    setResponse(res)
  }

  useEffect(() => {
    if (twoFa) {
      AuthServiceV4.deleteMfa()
        .then(handleResponse)
        .catch(error => {
          handleError(error)
        })
        .finally(() => setIsLoading(false))
    } else {
      AuthServiceV4.mfaSetup()
        .then(handleResponse)
        .catch(error => {
          handleError(error)
        })
        .finally(() => setIsLoading(false))
    }
  }, [])

  const successful2FAOffSuccessful = () => {
    Modal.close()
    Modal.open(<ConfirmationModalBiz options={CONFIRMATION_MODAL_OPTIONS.success2FAOff} action={Modal.close} />, {
      variant: 'center',
    })
  }

  const handleFinalAction = (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    setTwoFaStatusEv(!twoFa) // TODO можно распарсить токен и получить MFA

    // old state twoFa
    if (twoFa) {
      // 2fa off successful
      setPage(ACCOUNT_PAGES_FIDEUM_OTC.ACCOUNT_DETAILS)
      Modal.open(<SecurityTimerModalBiz enableFetch={true} customClose={successful2FAOffSuccessful} />, {
        variant: 'center',
        customCloseModal: successful2FAOffSuccessful,
      })
    } else {
      setIsSuccessful(true)
    }
  }

  if (isSuccessful) {
    return (
      <div className={styles.changeFormWrapSuccessful}>
        <SuccessfullyBiz
          textData={{
            title: '2FA\nSetup Successful',
            description: '',
            btnText: 'Return to Settings',
          }}
          action={() => {
            setResponse(null)
            setIsSuccessful(false)
            setPage(ACCOUNT_PAGES_FIDEUM_OTC.ACCOUNT_DETAILS)
          }}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner />
      </div>
    )
  }

  return (
    <>
      {!response ? (
        <div className={styles.changeFormWrap}>
          <BackButtonBiz backFn={handleBack} padding={30} />

          {!response && (
            <div className={styles.changeTitleWrap}>
              <div className={styles.changeTitle}>Two Factor Authentication</div>
              <div className={styles.changeDescription}>Please enter the code from your authenticator.</div>
            </div>
          )}
        </div>
      ) : null}

      {response && !isLoading && (
        <div className={styles.stepControllerWrap}>
          <div className={styles.changeTitle}>Two Factor Authentication</div>

          <div className={styles.height12} />

          <StepControllerComponent
            nextStepResponse={response}
            finalAction={handleFinalAction}
            dataProps={{ resetStepUp: handleBack }}
          />
        </div>
      )}
    </>
  )
}
