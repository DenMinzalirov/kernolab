import { FormProvider } from 'react-hook-form'
// import Turnstile from 'react-turnstile'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { pages, regex } from 'constant'
import { AuthLayout } from 'features/auth-new/auth-layout'
import { validateHintPassword } from 'utils/validate-рint-зassword'
import { AuthResponse, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { initApp } from 'wip/stores'
import errotInfoIcon from 'icons/error-info-icon.svg'
import { termsOfUseLink } from 'config'
import eye from 'assets/icons/eye.svg'
import eyeOff from 'assets/icons/eye-off.svg'
import fideumOnboardingLogo from 'assets/icons/fideumOnboardingLogo.svg'

import kernolabLogo from '../../../assets/icons/Kernolab-logo-2021-black.svg'
import { StepControllerComponent } from '../../step-controller'
import styles from '../styles.module.scss'
// import { turnstileSiteKey } from 'hooks/use-captcha'
import { useSignUp } from 'hooks/use-sign-up'

export function SignUp() {
  const navigate = useNavigate()

  const {
    methods,
    register,
    handleSubmit,
    errors,
    passwordHintMessages,
    loading,
    showPassword,
    showConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    onSubmit,
    setPasswordIsFocus,
    trigger,
    isSamePassword,
    setValue,
    passwordIsFocus,
    response,
    setResponse,
    watch,
    // handleVerify,
    // handleResetTurnstile,
    isShowWidget,
    handleLoad,
    isDisableBtnCaptcha,
    setLoading,
  } = useSignUp()

  const watchEmail = watch('email')

  const passwordHintsClassName = (): string => {
    if (passwordIsFocus && errors.password) {
      return clsx(styles.hintPassword, errors.password?.message ? styles.fadeIn : styles.fadeOut)
    }
    return clsx(styles.hintPassword, styles.hidePasswordHint)
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    if (!responseData?.accessToken) {
      navigate(pages.SignIn.path)
    }

    await initApp()

    navigate(pages.Base.path)
  }

  const isDisabled = () => {
    if (isDisableBtnCaptcha) return true
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
            <>
              <div className={styles.titleWrap}>
                <div className={clsx(styles.title, 'text-center')}>Sign Up</div>
                <div className={clsx(styles.description, 'text-center')}>
                  Already have an account?{' '}
                  <NavLink to={pages.SignIn.path} className={styles.link}>
                    Sign In
                  </NavLink>
                </div>
              </div>
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className='input-item-wrap-new'>
                    <label htmlFor='email' className='input-label'>
                      Email
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
                          setValue('email', event.target.value?.toLowerCase()?.trim())
                        },
                      })}
                    />

                    {errors.email && errors.email.type === 'pattern' ? (
                      <div className={styles.textError}>
                        <img src={errotInfoIcon} alt='' />
                        Invalid address entered. Please check and try again
                      </div>
                    ) : null}
                  </div>

                  <div style={{ height: 20 }} />

                  <div className='input-item-wrap-new'>
                    <label htmlFor='password' className='input-label'>
                      Create Password
                    </label>
                    <div className='input-password-wrap'>
                      <input
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        maxLength={128}
                        className={`input-form  ${errors.password || errors.repeatPassword ? 'error' : ''}`}
                        placeholder='Type here..'
                        onFocus={async () => {
                          setPasswordIsFocus(true)
                          await trigger('password')
                        }}
                        {...register('password', {
                          required: passwordHintMessages.join(' '),
                          validate: validateHintPassword,
                          onBlur: () => setPasswordIsFocus(false),
                          onChange(event) {
                            setValue('password', event.target.value?.trim())
                          },
                        })}
                      />
                      <div onClick={toggleShowPassword}>
                        <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye' />
                      </div>
                    </div>

                    <div className={styles.passwordInfoWrap}>
                      <div className={styles.passwordInfoRow}>
                        <div className={styles.passwordInfoDot}></div>
                        <div className={styles.passwordInfoText}>8-64 characters long</div>
                      </div>
                      <div className={styles.passwordInfoRow}>
                        <div className={styles.passwordInfoDot}></div>
                        <div className={styles.passwordInfoText}>Contains uppercase and lowercase letters</div>
                      </div>
                      <div className={styles.passwordInfoRow}>
                        <div className={styles.passwordInfoDot}></div>
                        <div className={styles.passwordInfoText}>Contains numbers, and symbols.</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 20 }} />

                  <div className='input-item-wrap-new'>
                    <label htmlFor='repeat-password' className='input-label'>
                      Repeat Password
                    </label>
                    <div className='input-password-wrap'>
                      <input
                        id='repeat-password'
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`input-form  ${errors.repeatPassword ? 'error' : ''}`}
                        placeholder='Type here..'
                        {...register('repeatPassword', {
                          required: true,
                          min: 0,
                          validate: isSamePassword,
                          onChange(event) {
                            setValue('repeatPassword', event.target.value?.trim())
                          },
                        })}
                      />
                      <div onClick={toggleShowConfirmPassword}>
                        <img src={showConfirmPassword ? eyeOff : eye} alt='' className='icon-eye' />
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 20 }} />

                  <div className='input-item-wrap-new'>
                    <label htmlFor='referral' className='input-label'>
                      Referral Code (Optional)
                    </label>
                    <input
                      id='referral'
                      type='text'
                      className='input-form'
                      placeholder='Type here..'
                      {...register('referral', {
                        onChange(event) {
                          setValue('referral', event.target.value?.trim())
                        },
                      })}
                    />
                  </div>

                  <div style={{ height: 36 }} />

                  <div
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <label htmlFor='checkBox' className={clsx(styles.container)}>
                      {'Agree to the \u00A0'}
                      <input id='checkBox' type='checkbox' {...register('checkBox', { required: true })} />
                      <span className={clsx(styles.checkmark, errors.checkBox && styles.checkmarkError)} />
                      <NavLink
                        to={termsOfUseLink()}
                        target='_blank'
                        className={clsx(styles.link, errors.checkBox && styles.colorRed)}
                      >
                        Terms of Use
                      </NavLink>
                    </label>
                  </div>

                  {errors.email && errors.email.type === 'exist' ? (
                    <>
                      <div className={styles.errorResponse}>
                        <img src={errotInfoIcon} alt='' />
                        {errors.email.message}
                      </div>
                      <div style={{ height: 50 }} />
                    </>
                  ) : null}

                  {errors.checkBox && errors.checkBox.type === 'required' ? (
                    <>
                      <div className={styles.errorResponse}>
                        <img src={errotInfoIcon} alt='' />
                        To continue agree to The Terms of Use
                      </div>
                      <div style={{ height: 50 }} />
                    </>
                  ) : null}
                  {errors.repeatPassword && errors.repeatPassword.type === 'validate' ? (
                    <>
                      <div className={styles.errorResponse}>
                        <img src={errotInfoIcon} alt='' />
                        Passwords do not match. Please check and try again
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
                    {loading ? <span className='spinner-border' /> : 'Sign Up'}
                  </button>
                </form>
              </FormProvider>
            </>
          ) : null}

          {response ? (
            <div style={{ maxHeight: 710, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              {loading ? null : <div className={clsx(styles.title, 'text-center')}>Sign Up</div>}
              <div style={{ height: 16 }} />

              <StepControllerComponent
                nextStepResponse={response}
                finalAction={handleFinalAction}
                isLoadingCallback={setLoading}
                dataProps={{
                  resetStepUp: () => {
                    setResponse(null)
                    // handleResetTurnstile()
                  },
                  email: watchEmail,
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </AuthLayout>
  )
}
