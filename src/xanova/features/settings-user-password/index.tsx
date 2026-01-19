import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal, Spinner } from 'components'
import { pages } from 'constant'
import { StepControllerComponent, STEPS } from 'features/step-controller'
import { handleError } from 'utils/error-handler'
import { validateHintPassword } from 'utils/validate-рint-зassword'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { ErrorInfoIcon } from 'icons/error-info-icon'
import { $stepControllerNextStep, DEFAULT_STEP } from 'model/step-controller'
import eye from 'assets/icons/eye.svg'
import eyeOff from 'assets/icons/eye-off.svg'

import styles from './styles.module.scss'
import { StepsLayoutXanova } from 'xanova/components/steps-layout'
import { SuccessContentXanova } from 'xanova/components/success-content/success-content'
import { SecurityTimerModalXanova } from 'xanova/modal/security-timer-modal-xanova'

type Inputs = {
  currentPassword: string
  newPassword: string
  repeatNewPassword: string
}

const defaultValues = {
  currentPassword: '',
  newPassword: '',
  repeatNewPassword: '',
}

const hints = [
  'Be at least 8 characters long',
  'Have at least one uppercase and lowercase',
  'Have at least one number and one sign',
]

const stepsLayoutConfig = [
  { label: 'Password', value: DEFAULT_STEP },
  { label: '2FA', value: STEPS.MFA_CONFIRM },
  { label: 'Email Code', value: STEPS.CONFIRM_EMAIL },
]

export function SettingsUserPasswordXanova() {
  const navigate = useNavigate()
  const activeStep = useUnit($stepControllerNextStep)

  const methods = useForm<Inputs>({ defaultValues, mode: 'onChange' })
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = methods

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isSuccessful, setIsSuccessful] = useState(false)

  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)
  const [responseError, setResponseError] = useState('')

  const currentPassword = watch('currentPassword')
  const newPassword = watch('newPassword')
  const repeatNewPassword = watch('repeatNewPassword')

  const handleBtn = async (): Promise<void> => {
    setLoading(true)
    try {
      const stepUpRes = await AuthServiceV4.changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      })

      stepUpRes && setResponse(stepUpRes)
    } catch (error) {
      console.log('ERROR-changePassword', error)
      const errorMessage = handleError(error, true)
      errorMessage && setResponseError(errorMessage)
    }
    setLoading(false)
  }

  const toggleShowPassword = (): void => {
    setShowPassword(prevState => !prevState)
  }

  const isSamePassword = (repeatPassword: string): boolean => {
    if (!repeatPassword) return false
    const password = newPassword
    return repeatPassword === password
  }

  const handleFinalAction = () => {
    Modal.open(<SecurityTimerModalXanova enableFetch={true} />, {
      variant: 'center',
    })
    setIsSuccessful(true)
  }

  if (isSuccessful) {
    return (
      <StepsLayoutXanova steps={stepsLayoutConfig} activeStep='success'>
        <SuccessContentXanova
          title={'Password Updated'}
          btnText={'Return to Settings'}
          action={() => navigate(pages.ACCOUNT_SETTINGS.path)}
          subTitle={
            // eslint-disable-next-line max-len
            'Your email address has been successfully updated. All future account notifications will be sent to your new email.'
          }
        />
      </StepsLayoutXanova>
    )
  }

  return (
    <StepsLayoutXanova steps={stepsLayoutConfig} activeStep={activeStep}>
      <div className={styles.contentWrap}>
        {!loading ? <div className={styles.title}>Change Password</div> : null}
        {loading ? <Spinner /> : null}
        {!response && !loading && (
          <form onSubmit={handleSubmit(handleBtn)} className={styles.formWrap}>
            <div className={styles.description}>Please follow the steps specified</div>

            <div className='input-wrap-xanova'>
              <label htmlFor='currentPassword' className={errors.currentPassword ? 'text-error' : ''}>
                {'Current Password'}{' '}
                {errors.currentPassword && errors.currentPassword.type === 'required' ? 'Required' : ''}
              </label>
              <input
                id='currentPassword'
                type={showPassword ? 'text' : 'password'}
                autoComplete='current-password'
                className={errors.currentPassword ? 'error' : ''}
                placeholder='Type here..'
                {...register('currentPassword', {
                  onChange(event) {
                    setValue('currentPassword', event.target.value?.trim())
                  },
                })}
              />
              <div onClick={toggleShowPassword} className='icon-eye-xanova'>
                <img src={showPassword ? eyeOff : eye} alt='eye' />
              </div>
            </div>

            <div className='input-wrap-xanova'>
              <label htmlFor='newPassword' className={errors.newPassword ? 'text-error' : ''}>
                {'New Password'} {errors.newPassword && errors.newPassword.type === 'required' ? 'Required' : ''}
              </label>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                autoComplete='current-password'
                className={errors.newPassword ? 'error' : ''}
                placeholder='Type here..'
                {...register('newPassword', {
                  required: hints.join(''),
                  validate: validateHintPassword,
                  onChange(event) {
                    setValue('newPassword', event.target.value?.trim())
                  },
                })}
              />
              <div onClick={toggleShowPassword} className='icon-eye-xanova'>
                <img src={showPassword ? eyeOff : eye} alt='eye' />
              </div>

              <div className={styles.hintWrap}>
                <div className={styles.hintTitle}>Password must:</div>
                {hints.map(text => {
                  return (
                    <div key={text}>
                      <li className={styles.hintPass}>{text}</li>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className='input-wrap-xanova'>
              <label htmlFor='repeatNewPassword' className={errors.repeatNewPassword ? 'text-error' : ''}>
                {'Repeat New Password'}{' '}
                {errors.repeatNewPassword && errors.repeatNewPassword.type === 'required' ? 'Required' : ''}
              </label>
              <input
                id='repeatNewPassword'
                type={showPassword ? 'text' : 'password'}
                autoComplete='current-password'
                className={errors.repeatNewPassword ? 'error' : ''}
                placeholder='Type here..'
                {...register('repeatNewPassword', { required: true, min: 0, validate: isSamePassword })}
              />
              <div onClick={toggleShowPassword} className='icon-eye-xanova'>
                <img src={showPassword ? eyeOff : eye} alt='eye' />
              </div>
            </div>

            {responseError ? (
              <div className={styles.errorResponse}>
                <ErrorInfoIcon />
                {responseError}
              </div>
            ) : null}

            <div className={styles.btnWrap}>
              <button
                type='button'
                onClick={() => navigate(pages.ACCOUNT_SETTINGS.path)}
                className='btn-with-icon-xanova circle40 spanArrowBackIcon'
              >
                <span />
              </button>

              <button
                type='submit'
                className='btn-xanova gold'
                disabled={loading || !isSamePassword(repeatNewPassword)}
              >
                {loading ? <span className='spinner-border' /> : 'Next'}
              </button>
            </div>
          </form>
        )}

        {response && !loading && (
          <StepControllerComponent nextStepResponse={response} finalAction={handleFinalAction} />
        )}
      </div>
    </StepsLayoutXanova>
  )
}
