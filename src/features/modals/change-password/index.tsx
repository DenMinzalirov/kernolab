import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import clsx from 'clsx'

import { HintPasswordText, Modal, Success } from 'components'
import i18n from 'components/i18n/localize'
import { handleError } from 'utils/error-handler'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import eye from 'assets/icons/eye.svg'
import eyeOff from 'assets/icons/eye-off.svg'

import { saveRefreshToken, saveToken } from '../../../utils'
import { validateHintPassword } from '../../../utils/validate-рint-зassword'
import { StepControllerComponent } from '../../step-controller'
import { SecurityTimerModal } from '../security-timer-modal'
import styles from './styles.module.scss'

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

export function ChangePasswordModal() {
  const methods = useForm<Inputs>({ defaultValues, mode: 'onChange' })
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = methods
  const { t } = i18n

  const hints = [
    t('inputError.password.min'),
    t('inputError.password.uppercase'),
    t('inputError.password.lowercase'),
    t('inputError.password.number'),
    t('inputError.password.sign'),
  ]

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [passwordIsFocus, setPasswordIsFocus] = useState(false)
  const [isSuccessful, setIsSuccessful] = useState(false)

  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse>()
  const [responseError, setResponseError] = useState('')

  const handleBtn = async (): Promise<void> => {
    setLoading(true)
    try {
      const stepUpRes = await AuthServiceV4.changePassword({
        oldPassword: getValues('currentPassword'),
        newPassword: getValues('newPassword'),
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
    const password = getValues('newPassword')
    return repeatPassword === password
  }

  const passwordHintsClassName = (): string => {
    if (passwordIsFocus && errors.newPassword) {
      return clsx(styles.hintPassword, errors.newPassword?.message ? styles.fadeIn : styles.fadeOut)
    }
    return clsx(styles.hintPassword, styles.hidePasswordHint)
  }

  const handleFinalAction = (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    Modal.open(<SecurityTimerModal />, {
      isFullScreen: true,
      variant: 'center',
    })
  }

  if (isSuccessful) {
    return <Success text='Password Successfully Updated' />
  }

  return (
    <>
      <FormProvider {...methods}>
        <div className={styles.content}>
          <div className={clsx(styles.title, styles.titleMainMobile)}>Change Password</div>
          {!response && (
            <form className={styles.formMobileContent} onSubmit={handleSubmit(handleBtn)}>
              <div className={styles.description}>
                Changing your password is a breeze.
                <br /> Enter a new password and save.
              </div>
              <div style={{ width: '100%', marginBottom: '30px' }} className='input-item-wrap-new'>
                <label
                  htmlFor='currentPassword'
                  className={`input-label ${errors.currentPassword ? 'text-error' : ''}`}
                >
                  Current Password{' '}
                  {errors.currentPassword && errors.currentPassword.type === 'required' ? t('inputError.required') : ''}
                </label>
                <div className='input-password-wrap'>
                  <input
                    id='currentPassword'
                    type={showPassword ? 'text' : 'password'}
                    className='input-form'
                    maxLength={128}
                    style={errors.currentPassword ? { border: '1px solid var(--P-System-Red)' } : {}}
                    placeholder={t('signIn.password.placeholder') || ''}
                    {...register('currentPassword', {
                      required: true,
                    })}
                  />
                  <div onClick={toggleShowPassword}>
                    <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye' />
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', marginBottom: '30px' }} className='input-item-wrap-new'>
                <label htmlFor='newPassword' className={`input-label ${errors.newPassword ? 'text-error' : ''}`}>
                  New Password{' '}
                  {errors.newPassword && errors.newPassword.type === 'required' ? t('inputError.required') : ''}
                </label>
                <div className={passwordHintsClassName()}>
                  {hints.map(text => {
                    return <HintPasswordText key={text} text={text} errors={errors.newPassword?.message ?? ''} />
                  })}
                </div>
                <div className='input-password-wrap'>
                  <input
                    id='newPassword'
                    type={showPassword ? 'text' : 'password'}
                    className='input-form'
                    maxLength={128}
                    style={errors.newPassword ? { border: '1px solid var(--P-System-Red)' } : {}}
                    placeholder={t('signIn.password.placeholder') || ''}
                    onFocus={async () => {
                      setPasswordIsFocus(true)
                      await trigger('newPassword')
                    }}
                    {...register('newPassword', {
                      required: hints.join(''),
                      validate: validateHintPassword,
                      onBlur: () => setPasswordIsFocus(false),
                    })}
                  />
                  <div onClick={toggleShowPassword}>
                    <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye' />
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', marginBottom: '60px' }} className='input-item-wrap-new'>
                <label
                  htmlFor='repeatNewPassword'
                  className={`input-label ${errors.repeatNewPassword ? 'text-error' : ''}`}
                >
                  Repeat New Password{' '}
                  {errors.repeatNewPassword && errors.repeatNewPassword.type === 'required'
                    ? t('inputError.required')
                    : ''}
                  {errors.repeatNewPassword && errors.repeatNewPassword.type === 'validate'
                    ? t('inputError.samePassword')
                    : ''}
                </label>
                <div className='input-password-wrap'>
                  <input
                    id='repeatNewPassword'
                    type={showPassword ? 'text' : 'password'}
                    className='input-form'
                    maxLength={128}
                    style={errors.repeatNewPassword ? { border: '1px solid var(--P-System-Red)' } : {}}
                    placeholder={t('signIn.password.placeholder') || ''}
                    {...register('repeatNewPassword', { required: true, min: 0, validate: isSamePassword })}
                  />
                  <div onClick={toggleShowPassword}>
                    <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye' />
                  </div>
                </div>
              </div>
              <div className={styles.mobileHintContainer}>
                <div style={{ padding: 18, backgroundColor: '#F5F4FA', borderRadius: 5 }}>
                  <div>Your password must contain:</div>
                  {hints.map(text => {
                    return <HintPasswordText key={text} text={text} errors={errors.newPassword?.message || ''} />
                  })}
                </div>
              </div>
              <div className={styles.errorWrap}>
                {responseError ? <div className={styles.errorText}>{responseError}</div> : null}
              </div>
              <div style={{ flexGrow: 1 }}></div>

              <button
                type='submit'
                className={clsx('btn-new primary height-56', styles.changePassDeckBtn)}
                disabled={loading}
              >
                {loading ? <span className='spinner-border' /> : 'Confirm'}
              </button>
            </form>
          )}

          {response && <StepControllerComponent nextStepResponse={response} finalAction={handleFinalAction} />}
        </div>
      </FormProvider>
    </>
  )
}
