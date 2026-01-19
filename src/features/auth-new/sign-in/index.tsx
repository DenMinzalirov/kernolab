import { useEffect, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
// import Turnstile, { useTurnstile } from 'react-turnstile'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { Modal } from 'components'
import I18n from 'components/i18n'
import i18n from 'components/i18n/localize'
import { pages, regex } from 'constant'
import { clearToken, parseJwt } from 'utils'
import { handleError } from 'utils/error-handler'
import { clearRefreshToken } from 'utils/local-storage'
import { AuthResponse, EVENT_NAMES, MFAAddAuthResponse, StepUpAuthResponse, useAnalytics } from 'wip/services'
import { initApp } from 'wip/stores'
import { ErrorInfoIcon } from 'icons/error-info-icon'
import eye from 'assets/icons/eye.svg'
import eyeOff from 'assets/icons/eye-off.svg'

import fideumOnboardingLogo from '../../../assets/icons/fideumOnboardingLogo.svg'
import kernolabLogo from '../../../assets/icons/Kernolab-logo-2021-black.svg'
// import { turnstileSiteKey, useCaptcha } from '../../../hooks/use-captcha'
import { resetStoresEv } from '../../../model/auth-logout'
import { AuthServiceV4 } from '../../../wip/services'
import { StepControllerComponent } from '../../step-controller'
import { AuthLayout } from '../auth-layout'
import styles from '../styles.module.scss'

type Inputs = {
  email: string
  password: string
}

const defaultValues = {
  email: '',
  password: '',
}

export function SignIn() {
  const { myLogEvent } = useAnalytics()

  useEffect(() => {
    clearToken()
    clearRefreshToken()
    Modal.close()
    resetStoresEv()

    myLogEvent(EVENT_NAMES.WEB_SIGN_IN_FOCUSED)
  }, [])

  const { t } = i18n
  const navigate = useNavigate()
  const methods = useForm<Inputs>({ defaultValues })

  // const turnstile = useTurnstile()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
  } = methods

  // const { handleVerify, handleResetTurnstile, handleLoad, isShowWidget, isDisableBtnCaptcha, customHeaderData } =
  //   useCaptcha()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [responseError, setResponseError] = useState('')
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)

  const toggleShowPassword = (): void => {
    setShowPassword(prevState => !prevState)
  }

  const onSubmit: SubmitHandler<Inputs> = async data => {
    setLoading(true)

    try {
      const responseData = await AuthServiceV4.emailLogin(
        {
          email: data.email,
          password: data.password,
        }
        // customHeaderData
      )

      setResponse(responseData)
    } catch (error) {
      console.log('ERROR-signIn', error)
      // turnstile.reset()

      const errorMessage = handleError(error, true)
      if (errorMessage) {
        setResponseError(errorMessage)
        setError('email', { type: 'custom', message: '' })
        setError('password', { type: 'custom', message: '' })
      }
    }

    setLoading(false)
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    if (!responseData?.accessToken) {
      navigate(pages.SignIn.path)
    }
    setLoading(true)

    try {
      const parsedToken = parseJwt(responseData.accessToken)
      const scope = parsedToken?.scope

      await initApp()

      if (scope && scope.length && scope.includes('KYC')) {
        navigate(pages.PORTFOLIO.path)
      } else if (scope && scope.length && !scope.includes('KYC')) {
        navigate(pages.KYC.path)
      }
    } catch (error) {
      console.log('ERROR-handleFinalAction-SignIn', error)
      //MOCK $cefiCryptoDepositWithdrawAssets
      navigate(pages.PORTFOLIO.path)
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = () => {
    // if (isDisableBtnCaptcha) return true
    return loading
  }

  return (
    <AuthLayout>
      <div className={styles.rightModule}>
        <div className={styles.mobilePairsLogo}>
          <img height={100} src={kernolabLogo} alt='' />
        </div>
        <div className={styles.formWrap}>
          {!response ? (
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.titleWrap}>
                  <div className={clsx(styles.title, 'text-center')}>Sign In</div>
                  <div className={clsx(styles.description, 'text-center')}>
                    Don’t have an account?{' '}
                    <NavLink to={pages.SignUp.path} className={styles.link}>
                      Sign Up
                    </NavLink>
                  </div>
                </div>

                <div className='input-item-wrap-new'>
                  <label htmlFor='email' className='input-label'>
                    E-mail {errors.email && errors.email.type === 'pattern' ? t('inputError.invalid') : ''}
                    {errors.email && errors.email.type === 'required' ? t('inputError.required') : ''}
                  </label>
                  <input
                    id='email'
                    type='text'
                    className={`input-form  ${errors.email ? 'error' : ''}`}
                    placeholder='Type here..'
                    {...register('email', {
                      required: true,
                      pattern: {
                        value: regex.email,
                        message: 'Invalid email address',
                      },
                      onChange(event) {
                        responseError && setResponseError('')
                        setValue('email', event.target.value?.toLowerCase()?.trim())
                      },
                    })}
                  />
                </div>

                <div style={{ height: 20 }} />

                <div className='input-item-wrap-new'>
                  <label htmlFor='password' className='input-label'>
                    {t('signIn.password')}{' '}
                    {errors.password && errors.password.type === 'required' ? t('inputError.required') : ''}
                  </label>
                  <div className='input-password-wrap'>
                    <input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      className={`input-form  ${errors.email ? 'error' : ''}`}
                      placeholder='Type here..'
                      {...register('password', {
                        required: true,
                        onChange(event) {
                          responseError && setResponseError('')
                          setValue('password', event.target.value?.trim())
                        },
                      })}
                    />
                    <div onClick={toggleShowPassword}>
                      <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye' />
                    </div>
                  </div>
                </div>

                <div style={{ height: 36 }} />

                <NavLink to={pages.ForgotPassword.path} className={styles.linkForgetPassword}>
                  <I18n tKey='signIn.forgotPassword' />
                </NavLink>

                <div style={{ height: 50 }} />

                {responseError ? (
                  <>
                    <div className={styles.errorResponse}>
                      <ErrorInfoIcon />
                      {responseError}
                    </div>
                    <div style={{ height: 50 }} />
                  </>
                ) : null}

                {/* <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 50,
                    minHeight: 70,
                    // opacity: isShowWidget ? 0 : 1,
                  }}
                >
                  <Turnstile
                    sitekey={turnstileSiteKey}
                    onVerify={handleVerify}
                    language={'en'}
                    refreshExpired={'auto'}
                    theme={'light'}
                    onLoad={handleLoad}
                  />
                </div> */}

                <button type='submit' className='btn-new primary big' disabled={isDisabled()}>
                  {loading ? <span className='spinner-border' /> : <I18n tKey='signIn.title' />}
                </button>
              </form>
            </FormProvider>
          ) : null}

          {response ? (
            <div className={styles.stepControllerWrap}>
              {loading ? null : <div className={clsx(styles.title, 'text-center')}>Sign In</div>}

              <div style={{ height: 12 }} />

              <StepControllerComponent
                nextStepResponse={response}
                finalAction={handleFinalAction}
                dataProps={{
                  resetStepUp: () => {
                    setResponse(null)
                    // handleResetTurnstile()
                    setLoading(false)
                  },
                }}
                isLoadingCallback={setLoading}
              />
            </div>
          ) : null}
        </div>
      </div>
    </AuthLayout>
  )
}
