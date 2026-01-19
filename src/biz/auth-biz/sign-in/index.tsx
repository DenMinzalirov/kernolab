import { useEffect, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import Turnstile from 'react-turnstile'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { Modal } from 'components'
import { pages, regex } from 'constant'
import { clearToken, errorDescriptionHandler, parseJwt, saveRefreshToken, saveToken } from 'utils'
import { clearRefreshToken } from 'utils/local-storage'
import { AuthResponse, EVENT_NAMES, MFAAddAuthResponse, StepUpAuthResponse, useAnalytics } from 'wip/services'
import { initApp } from 'wip/stores'
import { theme, themeValue } from 'config'
import eye from 'assets/icons/eye.svg'
import eyeOff from 'assets/icons/eye-off.svg'

import { BackButtonBiz } from '../../../components/back-button-biz'
import { StepControllerComponent } from '../../../features/step-controller'
import { turnstileSiteKey, useCaptcha } from '../../../hooks/use-captcha'
import { resetStoresEv } from '../../../model/auth-logout'
import { AuthServiceV4 } from '../../../wip/services'
import { AuthLayoutBiz } from '../auth-layout'
import styles from '../styles.module.scss'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

type Inputs = {
  email: string
  password: string
}

const defaultValues = {
  email: '',
  password: '',
}

export function SignInBiz() {
  const { myLogEvent } = useAnalytics()

  useEffect(() => {
    clearToken()
    clearRefreshToken()
    Modal.close()
    resetStoresEv()

    myLogEvent(EVENT_NAMES.WEB_SIGN_IN_FOCUSED)
  }, [])

  const navigate = useNavigate()
  const methods = useForm<Inputs>({ defaultValues })

  // const {
  //   handleVerify,
  //   handleResetTurnstile,
  //   handleLoad,
  //   isShowWidget,
  //   isDisableBtnCaptcha,
  //   customHeaderData,
  //   isCaptchaOff,
  // } = useCaptcha()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = methods

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [errorResponse, setErrorResponse] = useState('')
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)

  const toggleShowPassword = (): void => {
    setShowPassword(prevState => !prevState)
  }

  const onSubmit: SubmitHandler<Inputs> = async data => {
    setLoading(true)

    try {
      const stepUpRes = await AuthServiceV4.emailLogin(
        {
          email: data.email,
          password: data.password,
        }
        // customHeaderData
      )
      console.log('stepUpRes', stepUpRes)

      if (['VERIFY_EMAIL', 'VERIFY_PHONE'].includes(stepUpRes.nextStep)) {
        // navigate(pages.ConfirmationCode.path, {
        //   state: {
        //     step: response.nextStep,
        //     sessionToken: response.sessionToken,
        //     email: data.email,
        //   },
        // })
      }

      if (stepUpRes.nextStep === 'MFA_CONFIRM') {
        // navigate(pages.TwoFactorAuthentication.path, {
        //   state: {
        //     sessionToken: response.sessionToken,
        //   },
        // })
        setResponse(stepUpRes)
      }

      if (stepUpRes.nextStep === null) {
        if (!stepUpRes?.accessToken) {
          navigate(pages.SignIn.path)
        }

        const parsedToken = parseJwt(stepUpRes.accessToken)
        const scope = parsedToken?.scope

        await initApp()
        // await updateEarning()

        // userSelf.status === UserStatus.KYCConfirmed
        if (scope && scope.length && scope.includes('KYC')) {
          navigate(pages.Base.path)
          // userSelf.status === UserStatus.Active
        } else if (scope && scope.length && scope.includes('OTC')) {
          navigate(pages.Base.path)
        } else if (scope && scope.length && !scope.includes('KYC')) {
          navigate(pages.KYC.path)
        }
      }
    } catch (error: any) {
      console.log('ERROR-signIn', error)

      // handleResetTurnstile()

      const errorMessage = () => {
        switch (error.code) {
          case 'USER_OR_PASSWORD_NOT_VALID':
            return 'The entered email or password is incorrect.'
          case 'USER_EMAIL_NOT_FOUND':
            return 'The entered email address was not found.'
          default:
            return error.code
        }
      }
      setErrorResponse(errorMessage)
    }

    setLoading(false)
  }

  const disableBtnStyle = () => {
    if (Object.keys(errors).length) return styles.btnDisable
    return ''
  }

  const isDisabled = () => {
    // if (isDisableBtnCaptcha) return true
    return loading
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    console.log('handleFinalAction')
    if (!responseData?.accessToken) {
      navigate(pages.SignIn.path)
    }

    await initApp()

    navigate(pages.Base.path)
  }

  return (
    <AuthLayoutBiz>
      <>
        {!response ? (
          <FormProvider {...methods}>
            <form className={styles.rightModule} onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.titleWrap}>
                <div className={styles.title}>Log In</div>
                <div className={styles.description}>Please log in to access your account.</div>
              </div>
              <div className={styles.inputBlock}>
                <div className='input-item-wrap-biz' style={{ gap: '12px' }}>
                  <label htmlFor='email' className={clsx(styles.inputItemLabel, errors.email ? styles.textError : '')}>
                    {'Email'} {errors.email && errors.email.type === 'pattern' ? 'Invalid' : ''}
                    {errors.email && errors.email.type === 'required' ? 'Required' : ''}
                  </label>
                  <input
                    id='email'
                    type='text'
                    autoComplete='username'
                    className='input-form'
                    style={{
                      height: 62, //TODO почему не вынести в глобальные стили?
                      boxSizing: 'border-box',
                      ...(errors.email || errorResponse ? { border: '1px solid red' } : {}),
                    }}
                    placeholder='Type here..'
                    {...register('email', {
                      required: true,
                      pattern: {
                        value: regex.email,
                        message: 'Invalid email address',
                      },
                      onChange(event) {
                        errorResponse && setErrorResponse('')
                        setValue('email', event.target.value?.toLowerCase()?.trim())
                      },
                    })}
                  />
                </div>
                <div className='input-item-wrap-biz' style={{ gap: '12px' }}>
                  <label
                    htmlFor='password'
                    className={clsx(styles.inputItemLabel, errors.password ? styles.textError : '')}
                  >
                    {'Password'} {errors.password && errors.password.type === 'required' ? 'Required' : ''}
                  </label>
                  <div className={styles.inputPasswordWrap}>
                    <input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='current-password'
                      className='input-form'
                      style={{
                        height: 62, //TODO почему не вынести в глобальные стили?
                        boxSizing: 'border-box',
                        ...(errors.password || errorResponse ? { border: '1px solid red' } : {}),
                      }}
                      placeholder='Type here..'
                      {...register('password', {
                        required: true,
                        onChange(event) {
                          errorResponse && setErrorResponse('')
                          setValue('password', event.target.value?.trim())
                        },
                      })}
                    />
                    <div onClick={toggleShowPassword}>
                      <img src={showPassword ? eyeOff : eye} alt='' className={styles.iconEye} />
                    </div>
                  </div>
                </div>
                {theme === themeValue.fideumOTC ? null : (
                  <NavLink to={pages.ForgotPassword.path} className={styles.forgotPassword}>
                    Forgot Password?
                  </NavLink>
                )}
              </div>

              {/*<div*/}
              {/*  style={{*/}
              {/*    display: isCaptchaOff ? 'none' : 'flex',*/}
              {/*    justifyContent: 'center',*/}
              {/*    marginBottom: 50,*/}
              {/*    minHeight: 70,*/}
              {/*    opacity: isShowWidget ? 0 : 1,*/}
              {/*  }}*/}
              {/*>*/}
              {/*  <Turnstile*/}
              {/*    sitekey={turnstileSiteKey}*/}
              {/*    onVerify={handleVerify}*/}
              {/*    language={'en'}*/}
              {/*    refreshExpired={'auto'}*/}
              {/*    theme={'light'}*/}
              {/*    onLoad={handleLoad}*/}
              {/*  />*/}
              {/*</div>*/}

              {errorResponse ? (
                <div className={clsx(styles.inputItemLabel, styles.textError)}>{errorResponse}</div>
              ) : null}

              <button type='submit' className={clsx('btn-biz blue big', disableBtnStyle())} disabled={isDisabled()}>
                {loading ? <span className='spinner-border' /> : 'Continue'}
              </button>

              {![themeValue.biz, themeValue.fideumOTC].includes(theme) ? (
                <div className={styles.text}>
                  Don&rsquo;t have an account?
                  <span onClick={() => navigate(pages.SignUp.path)} className={styles.linkText}>
                    {' '}
                    Sign Up
                  </span>
                </div>
              ) : null}
            </form>
          </FormProvider>
        ) : null}

        {response ? (
          <div className={styles.stepControllerWrap}>
            <div className={styles.title}>Log In</div>

            <StepControllerComponent
              nextStepResponse={response}
              finalAction={handleFinalAction}
              dataProps={{
                resetStepUp: () => {
                  // handleResetTurnstile()
                  setResponse(null)
                },
              }}
            />
          </div>
        ) : null}
      </>
    </AuthLayoutBiz>
  )
}
