import { useEffect, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { Modal } from 'components'
import { pages, regex } from 'constant'
import { StepControllerComponent } from 'features/step-controller'
import { clearToken, parseJwt } from 'utils'
import { clearRefreshToken } from 'utils/local-storage'
import {
  AuthResponse,
  AuthServiceV4,
  EVENT_NAMES,
  MFAAddAuthResponse,
  StepUpAuthResponse,
  useAnalytics,
} from 'wip/services'
import { initApp } from 'wip/stores'
import { resetStoresEv } from 'model/auth-logout'
import eye from 'assets/icons/eye.svg'
import eyeOff from 'assets/icons/eye-off.svg'

import { AuthLayoutXanova } from '../auth-layout'
import styles from '../styles.module.scss'

type Inputs = {
  email: string
  password: string
}

const defaultValues = {
  email: '',
  password: '',
}

export function SignInXanova() {
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
      const stepUpRes = await AuthServiceV4.emailLogin({
        email: data.email,
        password: data.password,
      })

      if (stepUpRes.nextStep === 'MFA_CONFIRM') {
        setResponse(stepUpRes)
      }

      if (stepUpRes.nextStep === null) {
        if (!stepUpRes?.accessToken) {
          navigate(pages.SignIn.path)
        }

        const parsedToken = parseJwt(stepUpRes.accessToken)
        const scope = parsedToken?.scope

        await initApp()

        if (scope && scope.length && scope.includes('KYC')) {
          navigate(pages.Base.path)
        } else if (scope && scope.length && scope.includes('OTC')) {
          navigate(pages.Base.path)
        } else if (scope && scope.length && !scope.includes('KYC')) {
          navigate(pages.KYC.path)
        }
      }
    } catch (error: any) {
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

  const isDisabled = () => {
    if (Object.keys(errors).length) return true
    return loading
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    if (!responseData?.accessToken) {
      navigate(pages.SignIn.path)
    }

    await initApp()

    navigate(pages.Base.path)
  }

  return (
    <AuthLayoutXanova>
      <>
        {!response ? (
          <FormProvider {...methods}>
            <form className={styles.rightModule} onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.titleWrap}>
                <div className={styles.title}>Welcome back!</div>
                <div className={styles.description}>Log in to your account below</div>
              </div>

              <div className={styles.inputBlock}>
                <div className='input-wrap-xanova'>
                  <label htmlFor='email' className={errors.email ? 'text-error' : ''}>
                    {'Email'} {errors.email && errors.email.type === 'pattern' ? 'Invalid' : ''}
                    {errors.email && errors.email.type === 'required' ? 'Required' : ''}
                  </label>
                  <input
                    id='email'
                    type='text'
                    autoComplete='email'
                    placeholder='Type here..'
                    className={errors.email ? 'error' : ''}
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

                <div className='input-wrap-xanova'>
                  <label htmlFor='password' className={errors.password ? 'text-error' : ''}>
                    {'Password'} {errors.password && errors.password.type === 'required' ? 'Required' : ''}
                  </label>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    className={errors.password ? 'error' : ''}
                    placeholder='Type here..'
                    {...register('password', {
                      required: true,
                      onChange(event) {
                        errorResponse && setErrorResponse('')
                        setValue('password', event.target.value?.trim())
                      },
                    })}
                  />
                  <div onClick={toggleShowPassword} className='icon-eye-xanova'>
                    <img src={showPassword ? eyeOff : eye} alt='eye' />
                  </div>
                </div>

                <NavLink to={pages.ForgotPassword.path} className={styles.forgotPassword}>
                  Forgot Password?
                </NavLink>
              </div>

              {errorResponse ? (
                <div className={clsx(styles.inputItemLabel, styles.textError)}>{errorResponse}</div>
              ) : null}

              <button type='submit' className={'btn-xanova gold big'} disabled={isDisabled()}>
                {loading ? <span className='spinner-border black' /> : 'Log In'}
              </button>

              <div className={styles.text}>
                Don&rsquo;t have an account?{' '}
                <span onClick={() => navigate(pages.SignUp.path)} className={styles.linkText}>
                  Sign Up
                </span>
              </div>
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
                  setResponse(null)
                },
              }}
            />
          </div>
        ) : null}
      </>
    </AuthLayoutXanova>
  )
}
