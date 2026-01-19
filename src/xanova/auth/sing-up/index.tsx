import { useMemo } from 'react'
import { FormProvider } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { pages, regex } from 'constant'
import { StepControllerComponent } from 'features/step-controller'
import { parseJwt } from 'utils'
import { validateHintPassword } from 'utils/validate-рint-зassword'
import { AuthResponse, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { initApp } from 'wip/stores'
import checkedIcon from 'assets/icons/checked-xanova.svg'
import eye from 'assets/icons/eye.svg'
import eyeOff from 'assets/icons/eye-off.svg'
import infoIcon from 'assets/icons/info-icon-xanova.svg'

import { AuthLayoutXanova } from '../auth-layout'
import styles from '../styles.module.scss'
import { useSignUp } from 'hooks/use-sign-up'

export function SignUpXanova() {
  const navigate = useNavigate()
  const location = useLocation()

  const referralFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('ref')?.trim() || ''
  }, [location.search])

  const {
    methods,
    register,
    handleSubmit,
    errors,
    passwordHints,
    passwordHintMessages,
    loading,
    showPassword,
    showConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    onSubmit,
    setPasswordIsFocus,
    isSamePassword,
    setValue,
    watch,
    response,
    setResponse,
    clearErrors,
  } = useSignUp(referralFromQuery ? { referral: referralFromQuery } : undefined)

  const referral = watch('referral')
  const dontHaveReferral = watch('checkBox')

  const isDisabled = () => {
    return loading
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    if (!responseData?.accessToken) {
      navigate(pages.SignIn.path)
    }

    const parsedToken = parseJwt(responseData.accessToken)
    const scope = parsedToken?.scope

    if (scope && scope.length && !scope.includes('KYC')) {
      navigate(pages.KYC.path)
    } else {
      await initApp()
      navigate(pages.Base.path)
    }
  }

  return (
    <AuthLayoutXanova>
      {!response ? (
        <FormProvider {...methods}>
          <form className={styles.rightModule} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Get Started</div>
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
                  autoComplete='off'
                  className={errors.email ? 'error' : ''}
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
                    required: passwordHintMessages.join(' '),
                    validate: validateHintPassword,
                    onBlur: () => setPasswordIsFocus(false),
                    onChange(event) {
                      setValue('password', event.target.value?.trim())
                    },
                  })}
                />
                <div onClick={toggleShowPassword} className='icon-eye-xanova'>
                  <img src={showPassword ? eyeOff : eye} alt='eye' />
                </div>
              </div>

              <div className={styles.hintsWrap}>
                {passwordHints.map(hint => (
                  <div className={clsx(styles.hintText, hint.status === 'error' && styles.textError)} key={hint.id}>
                    <img
                      src={hint.status === 'success' ? checkedIcon : infoIcon}
                      alt={hint.status === 'success' ? 'checked icon' : 'info icon'}
                      className={styles.hintsIcon}
                    />{' '}
                    {hint.label}
                  </div>
                ))}
              </div>

              <div className='input-wrap-xanova'>
                <label htmlFor='repeat-password' className={errors.repeatPassword ? 'text-error' : ''}>
                  {'Repeat Password'}{' '}
                  {errors.repeatPassword && errors.repeatPassword.type === 'required' ? 'Required' : ''}
                </label>
                <input
                  id='repeat-password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={errors.repeatPassword ? ' error' : ''}
                  placeholder='Type here..'
                  {...register('repeatPassword', {
                    required: true,
                    min: 0,
                    validate: value => (isSamePassword(value) ? true : 'The passwords you entered do not match.'),
                    onChange(event) {
                      setValue('repeatPassword', event.target.value?.trim())
                    },
                  })}
                />
                <div onClick={toggleShowConfirmPassword} className='icon-eye-xanova'>
                  <img src={showConfirmPassword ? eyeOff : eye} alt='eye' />
                </div>
              </div>

              <div className='input-wrap-xanova'>
                <label htmlFor='referral' className={errors.referral ? 'text-error' : ''}>
                  Referral Code
                </label>
                <input
                  id='referral'
                  type='text'
                  className={errors.referral ? ' error' : ''}
                  placeholder='Type here..'
                  disabled={dontHaveReferral}
                  {...register('referral', {
                    required: {
                      value: !dontHaveReferral,
                      message: 'Please enter a referral code or confirm you do not have one.',
                    },

                    onChange(event) {
                      clearErrors(['referral', 'checkBox'])
                      setValue('referral', event.target.value?.trim())
                    },
                  })}
                />
              </div>

              <label
                className={clsx('checkbox-wrap-xanova', {
                  error: !!errors.referral,
                  disabled: !!referral,
                })}
              >
                <input
                  type='checkbox'
                  {...register('checkBox', {
                    onChange() {
                      clearErrors(['referral', 'checkBox'])
                    },
                  })}
                  disabled={!!referral}
                />
                <span className='checkbox-xanova-box' />
                <span className='checkbox-xanova-text'>I don’t have referral code</span>
              </label>
            </div>

            {errors.email?.message ||
            errors.repeatPassword?.message ||
            errors.referral?.message ||
            errors.checkBox?.message ? (
              <div className={clsx(styles.inputItemLabel, styles.textError)}>
                {errors.email?.message ||
                  errors.repeatPassword?.message ||
                  errors.referral?.message ||
                  errors.checkBox?.message}
              </div>
            ) : null}

            <button type='submit' className={clsx('btn-xanova gold big')} disabled={isDisabled()}>
              {loading ? <span className='spinner-border black' /> : 'Sign Up'}
            </button>

            <div className={styles.text}>
              Have an account?{' '}
              <span onClick={() => navigate(pages.SignIn.path)} className={styles.linkText}>
                Log In
              </span>
            </div>
          </form>
        </FormProvider>
      ) : null}

      {response ? (
        //TODO stepController for sign up?
        <div className={styles.stepControllerWrap}>
          <div className={styles.title}>Sign Up</div>

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
    </AuthLayoutXanova>
  )
}
