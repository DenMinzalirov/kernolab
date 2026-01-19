import { FormProvider } from 'react-hook-form'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { pages, regex } from 'constant'
import { StepControllerComponent } from 'features/step-controller'
import { parseJwt } from 'utils'
import { validateHintPassword } from 'utils/validate-рint-зassword'
import { AuthResponse, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { initApp } from 'wip/stores'
import { termsOfUseLink } from 'config'
import eye from 'assets/icons/eye.svg'
import eyeOff from 'assets/icons/eye-off.svg'

import { AuthLayoutBiz } from '../auth-layout'
import styles from '../styles.module.scss'
import { useSignUp } from 'hooks/use-sign-up'

export function SignUpBiz() {
  const navigate = useNavigate()

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
    trigger,
    isSamePassword,
    setValue,
    response,
    setResponse,
  } = useSignUp()

  const isDisabled = () => {
    return loading
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    console.log('handleFinalAction', responseData)
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
    <AuthLayoutBiz>
      {!response ? (
        <FormProvider {...methods}>
          <form className={styles.rightModule} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Sign Up</div>
              <div className={styles.signUpDescription}>Provide the request information to create an account.</div>
            </div>

            <div className={styles.inputBlock}>
              <div className={clsx('input-item-wrap-biz', styles.gap12)}>
                <label htmlFor='email' className={clsx(styles.inputItemLabel, errors.email ? styles.textError : '')}>
                  {'Email'} {errors.email && errors.email.type === 'pattern' ? 'Invalid' : ''}
                  {errors.email && errors.email.type === 'required' ? 'Required' : ''}
                </label>
                <input
                  id='email'
                  type='text'
                  autoComplete='off'
                  className={`input-form${errors.email ? ' error' : ''}`}
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

              <div className={clsx('input-item-wrap-biz', styles.gap12)}>
                <label
                  htmlFor='password'
                  className={clsx(styles.inputItemLabel, errors.password ? styles.textError : '')}
                >
                  {'Create Password'} {errors.password && errors.password.type === 'required' ? 'Required' : ''}
                </label>
                <div className={styles.inputPasswordWrap}>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    className={`input-form${errors.password ? ' error' : ''}`}
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
                    <img src={showPassword ? eyeOff : eye} alt='' className={styles.iconEye} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                  {passwordHints.map(hint => (
                    <div
                      className={clsx(
                        styles.hintText,
                        hint.status === 'success' && styles.colorGreen,
                        hint.status === 'error' && styles.colorRed,
                        hint.status === 'idle' && styles.colorDarkGrey
                      )}
                      key={hint.id}
                    >
                      {hint.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className={clsx('input-item-wrap-biz', styles.gap12)}>
                <label
                  htmlFor='repeat-password'
                  className={clsx(styles.inputItemLabel, errors.repeatPassword ? styles.textError : '')}
                >
                  {'Repeat Password'}{' '}
                  {errors.repeatPassword && errors.repeatPassword.type === 'required' ? 'Required' : ''}
                </label>
                <div className={styles.inputPasswordWrap}>
                  <input
                    id='repeat-password'
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input-form${errors.repeatPassword ? ' error' : ''}`}
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
                  <div onClick={toggleShowConfirmPassword}>
                    <img src={showConfirmPassword ? eyeOff : eye} alt='' className={styles.iconEye} />
                  </div>
                </div>
              </div>

              <div className={clsx('input-item-wrap-biz', styles.gap12)}>
                <label
                  htmlFor='referral'
                  className={clsx(styles.inputItemLabel, errors.referral ? styles.textError : '')}
                >
                  Referral Code (optional)
                </label>
                <input
                  id='referral'
                  type='text'
                  className={`input-form${errors.referral ? ' error' : ''}`}
                  placeholder='Type here..'
                  {...register('referral', {
                    onChange(event) {
                      setValue('referral', event.target.value?.trim())
                    },
                  })}
                />
              </div>

              <label className={clsx(styles.checkBoxContainer)}>
                <input
                  id='checkBox'
                  type='checkbox'
                  {...register('checkBox', { required: 'To continue agree to The Terms of Use' })}
                />
                <span className={clsx(styles.checkmark, { [styles.checkBoxError]: errors.checkBox })} />
                <span className={clsx(styles.checkBoxText, { [styles.textError]: errors.checkBox })}>Agree to the</span>
                <NavLink to={termsOfUseLink()} target='_blank' className={styles.checkBoxLink}>
                  Terms of Use
                </NavLink>
              </label>
            </div>

            {errors.email?.message || errors.repeatPassword?.message || errors.checkBox?.message ? (
              <div className={clsx(styles.inputItemLabel, styles.textError)}>
                {errors.email?.message || errors.repeatPassword?.message || errors.checkBox?.message}
              </div>
            ) : null}

            <button type='submit' className={clsx('btn-biz blue big')} disabled={isDisabled()}>
              {loading ? <span className='spinner-border' /> : 'Continue'}
            </button>

            <div className={styles.text}>
              Already have an account?
              <span onClick={() => navigate(pages.SignIn.path)} className={styles.linkText}>
                {' '}
                Log In
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
    </AuthLayoutBiz>
  )
}
