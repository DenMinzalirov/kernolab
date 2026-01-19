import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal, Spinner } from 'components'
import { pages, regex } from 'constant'
import { StepControllerComponent, STEPS } from 'features/step-controller'
import { handleError } from 'utils/error-handler'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { ErrorInfoIcon } from 'icons/error-info-icon'
import { $stepControllerNextStep, DEFAULT_STEP } from 'model/step-controller'
import { getUserInfoFx } from 'model/user-info'

import styles from './styles.module.scss'
import { StepsLayoutXanova } from 'xanova/components/steps-layout'
import { SuccessContentXanova } from 'xanova/components/success-content/success-content'
import { SecurityTimerModalXanova } from 'xanova/modal/security-timer-modal-xanova'

type Inputs = {
  newEmail: string
}

const defaultValues = {
  newEmail: '',
}

const stepsLayoutConfig = [
  { label: 'New Email', value: DEFAULT_STEP },
  { label: '2FA', value: STEPS.MFA_CONFIRM },
  { label: 'Email Code', value: STEPS.CONFIRM_EMAIL },
  { label: 'New Email Code', value: STEPS.VERIFY_NEW_EMAIL },
]

export function SettingsUserEmailXanova() {
  const navigate = useNavigate()
  const activeStep = useUnit($stepControllerNextStep)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Inputs>({ defaultValues })

  const inputValue = watch('newEmail')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [responseError, setResponseError] = useState('')
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)

  const onSubmit = async (formData: Inputs) => {
    setIsLoading(true)
    const newEmailValue = formData.newEmail.toLowerCase()?.trim()

    const data = { newEmail: newEmailValue }

    try {
      const emailRes = await AuthServiceV4.changeEmail(data)
      setResponse(emailRes)
    } catch (error) {
      console.log('ERROR-changeEmail', error)
      const errorMessage = handleError(error, true)
      errorMessage && setResponseError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalAction = () => {
    getUserInfoFx()
    setIsSuccess(true)

    Modal.open(<SecurityTimerModalXanova enableFetch={true} />, {
      variant: 'center',
    })
  }

  if (isSuccess) {
    return (
      <StepsLayoutXanova steps={stepsLayoutConfig} activeStep={'success'}>
        <SuccessContentXanova
          title={'Email Updated'}
          btnText={'Return to Settings'}
          action={() => navigate(pages.ACCOUNT_SETTINGS.path)}
          subTitle={
            // eslint-disable-next-line max-len
            'Your email address has been successfully updated.\nAll future account notifications will be sent to your new email.'
          }
        />
      </StepsLayoutXanova>
    )
  }

  return (
    <StepsLayoutXanova steps={stepsLayoutConfig} activeStep={activeStep}>
      <div className={styles.contentWrap}>
        {!isLoading ? <div className={styles.title}>Change Email</div> : null}
        {isLoading ? <Spinner /> : null}
        {!response && !isLoading && (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.formWrap}>
            <div className={styles.description}>Please follow the steps specified</div>

            <div className='input-wrap-xanova'>
              <label htmlFor='email' className={errors.newEmail ? 'text-error' : ''}>
                {'New Email'} {errors.newEmail && errors.newEmail.type === 'pattern' ? 'Invalid' : ''}
                {errors.newEmail && errors.newEmail.type === 'required' ? 'Required' : ''}
              </label>
              <input
                id='newEmail'
                type='text'
                autoComplete='username'
                className={errors.newEmail ? 'error' : ''}
                placeholder='Type here..'
                {...register('newEmail', {
                  required: true,

                  pattern: {
                    value: regex.email,
                    message: 'Invalid email address',
                  },
                  onChange(event) {
                    setValue('newEmail', event.target.value?.toLowerCase()?.trim())
                  },
                  disabled: isLoading,
                })}
              />

              <div className={styles.errorWrap}>
                {errors.newEmail || responseError ? (
                  <div style={{ display: 'flex', marginTop: 12 }}>
                    <ErrorInfoIcon />
                    <div style={{ width: 8 }} />
                    <div className={styles.errorText}>{errors.newEmail?.message || responseError}</div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className={styles.btnWrap}>
              <button
                type='button'
                onClick={() => navigate(pages.ACCOUNT_SETTINGS.path)}
                className='btn-with-icon-xanova circle40 spanArrowBackIcon'
              >
                <span />
              </button>

              <button type='submit' className='btn-xanova gold' disabled={isLoading || !inputValue}>
                {isLoading ? <span className='spinner-border black' /> : 'Next'}
              </button>
            </div>
          </form>
        )}

        {response && !isLoading && !isSuccess && (
          <StepControllerComponent
            nextStepResponse={response}
            finalAction={handleFinalAction}
            dataProps={{ email: inputValue, resetStepUp: () => navigate(pages.ACCOUNT_SETTINGS.path) }}
          />
        )}
      </div>
    </StepsLayoutXanova>
  )
}
