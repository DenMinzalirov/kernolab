import { useEffect, useState } from 'react'

import { Spinner } from 'components'
import { handleError } from 'utils/error-handler'
import { AuthResponse, StepUpAuthResponse } from 'wip/services'
import { MFAAddAuthResponse, StepControllerService } from 'wip/services/step-controller'
import { isXanova } from 'config'
import { resetStepControllerNextStepEV, setStepControllerNextStepEV } from 'model/step-controller'

import { EmailVerifyAndTotpView } from './email-verify-and-totp-view'
import { MfaConfirmView } from './mfa-confirm-view'
import { MfaVerifyView } from './mfa-verify-view'
import { NewEmailVerifyView } from './new-email-verify-view'
import { NewPhoneVerifyView } from './new-phone-verify-view'
import { PasswordSetting } from './password-setting'
import { PasswordVerify } from './password-verify'
import { PhoneVerifyAndTotpView } from './phone-verify-and-totp-view'

export type StepControllerData = {
  email?: string
  phone?: string
  resetStepUp?: () => void
}

type Props = {
  nextStepResponse: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse
  finalAction: (response: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => void
  dataProps?: StepControllerData
  isLoadingCallback?: (isLoading: boolean) => void
}

export const STEPS = {
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  VERIFY_NEW_EMAIL: 'VERIFY_NEW_EMAIL',
  CONFIRM_EMAIL: 'CONFIRM_EMAIL',

  VERIFY_PHONE: 'VERIFY_PHONE',
  VERIFY_NEW_PHONE: 'VERIFY_NEW_PHONE',
  CONFIRM_PHONE: 'CONFIRM_PHONE',

  PASSWORD_VERIFY: 'PASSWORD_VERIFY',
  PASSWORD_SETTING: 'PASSWORD_SETTING',

  MFA_VERIFY: 'MFA_VERIFY',
  MFA_RESET: 'MFA_RESET',
  MFA_ADD: 'MFA_ADD',
  MFA_CONFIRM: 'MFA_CONFIRM',
}

export const StepControllerComponent = ({ nextStepResponse, finalAction, dataProps, isLoadingCallback }: Props) => {
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse>(nextStepResponse)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (response.nextStep === STEPS.MFA_VERIFY) {
      return
    }

    setStepControllerNextStepEV(response?.nextStep)
  }, [response?.nextStep])

  useEffect(() => {
    return () => {
      resetStepControllerNextStepEV()
    }
  }, [])

  const resetMfa = async () => {
    try {
      setIsLoading(true)
      const resetMfaRes = await StepControllerService.resetMfa(response.sessionToken)
      setResponse(resetMfaRes)
    } catch (error: any) {
      setErrorMessage(error.code)
      console.log('ERROR-resetMfa ', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addMfa = async () => {
    try {
      setIsLoading(true)
      const addMfaRes = await StepControllerService.addMfa(response.sessionToken)

      setResponse(addMfaRes)
    } catch (error: any) {
      setErrorMessage(error.code)
      console.log('ERROR-addMfa ', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if ([null, 'STEP_UP'].includes(response.nextStep)) {
      //TODO remove STEP_UP ?
      finalAction(response)
    } else if (response.nextStep === STEPS.MFA_RESET) {
      resetMfa()
    } else if (response.nextStep === STEPS.MFA_ADD) {
      addMfa()
    }
  }, [response])

  const onClickSubmit = async (confirmationCode: string) => {
    if (!response?.sessionToken) {
      setErrorMessage('Error - no session token')
      return
    }

    setIsLoading(true)
    isLoadingCallback && isLoadingCallback(true)
    try {
      if (response.nextStep === STEPS.VERIFY_EMAIL) {
        const verifyEmailRes = await StepControllerService.verifyEmail(response.sessionToken, {
          code: confirmationCode,
        })
        setResponse(verifyEmailRes)
      } else if (response.nextStep === STEPS.VERIFY_NEW_EMAIL) {
        const verifyNewEmailRes = await StepControllerService.verifyNewEmail(response.sessionToken, {
          code: confirmationCode,
        })
        setResponse(verifyNewEmailRes)
      } else if (response.nextStep === STEPS.VERIFY_PHONE) {
        const verifyPhoneRes = await StepControllerService.verifyPhone(response.sessionToken, {
          code: confirmationCode,
        })
        setResponse(verifyPhoneRes)
      } else if (response.nextStep === STEPS.VERIFY_NEW_PHONE) {
        const verifyPhoneRes = await StepControllerService.verifyNewPhone(response.sessionToken, {
          code: confirmationCode,
        })
        setResponse(verifyPhoneRes)
      } else if (response.nextStep === STEPS.MFA_VERIFY) {
        const verifyMfaRes = await StepControllerService.verifyMfa(response.sessionToken, { totp: confirmationCode })
        setResponse(verifyMfaRes)
      } else if (response.nextStep === STEPS.PASSWORD_VERIFY) {
        const verifyPassRes = await StepControllerService.verifyPassword(response.sessionToken, {
          password: confirmationCode,
        })
        setResponse(verifyPassRes)
      } else if (response.nextStep === STEPS.CONFIRM_EMAIL) {
        // CONFIRM_EMAIL
        const verifyEmailTotpRes = await StepControllerService.confirmEmail(response.sessionToken, {
          code: confirmationCode,
        })
        setResponse(verifyEmailTotpRes)
      } else if (response.nextStep === STEPS.CONFIRM_PHONE) {
        // CONFIRM_PHONE,
        const verifyPhoneTotpRes = await StepControllerService.confirmPhone(response.sessionToken, {
          code: confirmationCode,
        })
        setResponse(verifyPhoneTotpRes)
      } else if (response.nextStep === STEPS.MFA_CONFIRM) {
        const confirmMfaRes = await StepControllerService.confirmMfa(response.sessionToken, { totp: confirmationCode })
        setResponse(confirmMfaRes)
      } else if (response.nextStep === STEPS.PASSWORD_SETTING) {
        const setNewPasswordRes = await StepControllerService.setNewPassword(response.sessionToken)
        setResponse(setNewPasswordRes)
      } else {
        setErrorMessage(`ERROR - UNKNOWN STEP - ${response.nextStep}`)
      }
    } catch (error: any) {
      console.log('ERROR-StepController ', error)
      const errorText = handleError(error, true)
      errorText && setErrorMessage(errorText)
    } finally {
      setIsLoading(false)
      isLoadingCallback && isLoadingCallback(true)
    }
  }

  const handleResend = async () => {
    if (!response?.sessionToken) {
      setErrorMessage('Error - no session token')
      return
    }

    setIsLoading(true)

    try {
      await StepControllerService.resendOtp(response.sessionToken)
    } catch (error: any) {
      console.log('handleResend-ERROR', error)
      // setErrorMessage(error.code)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack =
    dataProps?.resetStepUp ||
    (() => {
      console.log('Handler not set')
    })

  return (
    <>
      {[STEPS.MFA_RESET, STEPS.MFA_ADD].includes(response.nextStep) && !isXanova && (
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <Spinner />
        </div>
      )}

      {response.nextStep === STEPS.MFA_VERIFY && (
        <MfaVerifyView
          action={onClickSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
          response={response as MFAAddAuthResponse}
          backButtonFn={handleBack}
        />
      )}
      {response.nextStep === STEPS.PASSWORD_VERIFY && (
        <PasswordVerify
          action={onClickSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
        />
      )}
      {response.nextStep === STEPS.PASSWORD_SETTING && (
        <PasswordSetting
          action={onClickSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
        />
      )}
      {response.nextStep === STEPS.MFA_CONFIRM && (
        <MfaConfirmView
          action={onClickSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
          backButtonFn={handleBack}
        />
      )}
      {[STEPS.CONFIRM_EMAIL, STEPS.VERIFY_EMAIL].includes(response.nextStep) && (
        <EmailVerifyAndTotpView
          action={onClickSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
          handleResend={handleResend}
          email={[STEPS.VERIFY_EMAIL].includes(response.nextStep) ? dataProps?.email : ''}
          backButtonFn={handleBack}
        />
      )}
      {[STEPS.VERIFY_NEW_EMAIL].includes(response.nextStep) && (
        <NewEmailVerifyView
          action={onClickSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
          handleResend={handleResend}
          email={dataProps?.email}
          backButtonFn={handleBack}
        />
      )}
      {/*// TODO: не понятно когда нужен телефон и зачем передавать телефон пользователя а не проверять из ответа ?*/}
      {[STEPS.CONFIRM_PHONE, STEPS.VERIFY_PHONE].includes(response.nextStep) && (
        <PhoneVerifyAndTotpView
          action={onClickSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
          handleResend={handleResend}
          phone={[STEPS.VERIFY_PHONE].includes(response.nextStep) ? dataProps?.phone : ''}
          backButtonFn={handleBack}
        />
      )}
      {[STEPS.VERIFY_NEW_PHONE].includes(response.nextStep) && (
        <NewPhoneVerifyView
          action={onClickSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
          handleResend={handleResend}
          phone={dataProps?.phone}
          backButtonFn={handleBack}
        />
      )}
      {!Object.values(STEPS).includes(response.nextStep) && (
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </div>
      )}
    </>
  )
}
