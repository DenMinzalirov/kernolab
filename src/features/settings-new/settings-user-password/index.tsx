import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { pages } from 'constant'
import { SuccessPairs } from 'features/success-pairs'

import eye from '../../../assets/icons/eye.svg'
import eyeOff from '../../../assets/icons/eye-off.svg'
import { HeaderTitle, Modal, Spinner } from '../../../components'
import i18n from '../../../components/i18n/localize'
import { ErrorInfoIcon } from '../../../icons/error-info-icon'
import { handleError } from '../../../utils/error-handler'
import { validateHintPassword } from '../../../utils/validate-рint-зassword'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from '../../../wip/services'
import { SecurityTimerModal } from '../../modals/security-timer-modal'
import { StepControllerComponent } from '../../step-controller'
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

export function SettingsUserPassword() {
  const navigate = useNavigate()

  const methods = useForm<Inputs>({ defaultValues, mode: 'onChange' })
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = methods
  const { t } = i18n

  const hints = ['8-64 characters long', 'Contains uppercase and lowercase letters', 'Contains numbers, and symbols.']

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isSuccessful, setIsSuccessful] = useState(false)

  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)
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
    if (!repeatPassword) return false
    const password = getValues('newPassword')
    return repeatPassword === password
  }

  const handleFinalAction = () => {
    Modal.open(<SecurityTimerModal />, {
      // isFullScreen: true,
      variant: 'center',
    })
    setIsSuccessful(true)
  }

  if (isSuccessful) {
    return (
      <SuccessPairs
        title={'Password\nSuccessfully Updated'}
        description={'Your password has been updated successfully. Use your new password the next time you log in.'}
        headerTitle={'Change Password'}
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
      className='page-container-pairs'
      // className={styles.container}
    >
      {/*<div className={styles.headerWrap}>*/}
      <HeaderTitle headerTitle={'Change Password'} showBackBtn backBtnTitle={'Settings'} />
      {/*</div>*/}
      <div className={styles.contentWrap}>
        {/*<div>*/}
        {!loading ? <div className={styles.title}>Change Password</div> : null}
        {loading ? <Spinner /> : null}
        {!response && !loading && (
          <form onSubmit={handleSubmit(handleBtn)} className={styles.formWrap}>
            <div className={styles.description}>
              Changing your password is a breeze. <br />
              Enter a new password and save.
            </div>
            <div style={{ height: 48 }} />

            <div style={{ width: '100%', marginBottom: '20px' }} className='input-item-wrap-new'>
              <label htmlFor='currentPassword' className={`input-label ${errors.currentPassword ? 'text-error' : ''}`}>
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
                  placeholder='Type here..'
                  {...register('currentPassword', {
                    required: true,
                  })}
                />
                <div onClick={toggleShowPassword}>
                  <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye' />
                </div>
              </div>
            </div>

            <div style={{ width: '100%', marginBottom: '12px' }} className='input-item-wrap-new'>
              <label htmlFor='newPassword' className={`input-label ${errors.newPassword ? 'text-error' : ''}`}>
                New Password{' '}
                {errors.newPassword && errors.newPassword.type === 'required' ? t('inputError.required') : ''}
              </label>
              <div className='input-password-wrap'>
                <input
                  id='newPassword'
                  type={showPassword ? 'text' : 'password'}
                  className='input-form'
                  maxLength={128}
                  style={errors.newPassword ? { border: '1px solid var(--P-System-Red)' } : {}}
                  placeholder={t('signIn.password.placeholder') || ''}
                  {...register('newPassword', {
                    required: hints.join(''),
                    validate: validateHintPassword,
                  })}
                />
                <div onClick={toggleShowPassword}>
                  <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye' />
                </div>
              </div>
            </div>

            <div>
              {hints.map(text => {
                return (
                  <div key={text}>
                    <li className={styles.hintPass}>{text}</li>
                  </div>
                )
              })}
            </div>

            <div style={{ width: '100%', marginTop: '20px' }} className='input-item-wrap-new'>
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

            {/*<div style={{ width: '100%' }} className='input-item-wrap-new'>*/}
            {/*  <label htmlFor='code' className={'input-label'}>*/}
            {/*    Enter your new email*/}
            {/*  </label>*/}
            {/*  <input*/}
            {/*    type='text'*/}
            {/*    className='input-form'*/}
            {/*    style={errors.newEmail ? { border: '1px solid var(--P-System-Red)' } : {}}*/}
            {/*    placeholder='Enter your email'*/}
            {/*    {...register('newEmail', {*/}
            {/*      required: true,*/}
            {/*      pattern: {*/}
            {/*        value: regex.email,*/}
            {/*        message: 'Invalid email address',*/}
            {/*      },*/}
            {/*    })}*/}
            {/*    disabled={loading}*/}
            {/*  />*/}

            {/*  <div className={styles.errorWrap}>*/}
            {/*    {errors.newEmail || responseError ? (*/}
            {/*      <div style={{ display: 'flex', marginTop: 12 }}>*/}
            {/*        <ErrorInfoIcon />*/}
            {/*        <div style={{ width: 8 }} />*/}
            {/*        <div className={styles.errorText}>{errors.newEmail?.message || responseError}</div>*/}
            {/*      </div>*/}
            {/*    ) : null}*/}
            {/*  </div>*/}
            {/*</div>*/}

            {responseError ? (
              <>
                <div className={styles.errorResponse}>
                  <ErrorInfoIcon />
                  {responseError}
                </div>
                <div style={{ height: 50 }} />
              </>
            ) : null}

            <div style={{ height: 100 }} />

            <div className={styles.button}>
              <div></div>
              <button
                type='submit'
                className={clsx(
                  'btn-new primary big',
                  !isSamePassword(getValues('repeatNewPassword')) ? styles.buttonDisable : {}
                )}
                disabled={loading}
              >
                {loading ? <span className='spinner-border' /> : 'Next'}
              </button>
            </div>
          </form>
        )}

        {response && !loading && (
          <StepControllerComponent
            nextStepResponse={response}
            finalAction={handleFinalAction}
            // dataProps={{ email: inputValue, resetStepUp: () => setResponse(null) }}
          />
        )}
        {/*</div>*/}
      </div>
    </div>
  )
}
