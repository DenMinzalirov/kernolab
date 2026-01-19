import { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { pages, regex } from 'constant'
import { handleError } from 'utils/error-handler'
import successfullyBizIcon from 'assets/icons/successfully-biz.svg'

import { BackButtonBiz } from '../../../components/back-button-biz'
import { AuthServiceV4 } from '../../../wip/services'
import { AuthLayoutBiz } from '../auth-layout'
import styles from '../styles.module.scss'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

type Inputs = {
  email: string
}

const defaultValues = {
  email: '',
}

export function ForgotPasswordBiz() {
  const navigate = useNavigate()
  const methods = useForm<Inputs>({ defaultValues })
  const [isSeccess, setIsSeccess] = useState(false)
  const { isMobileBiz } = useCurrentBreakpoint()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = methods

  const [loading, setLoading] = useState<boolean>(false)

  const onSubmit: SubmitHandler<Inputs> = async data => {
    setLoading(true)
    try {
      await AuthServiceV4.resetPassword(data)
      setIsSeccess(true)
    } catch (error: any) {
      console.log('ERROR-resetPassword', error)
      handleError(error)
    }

    setLoading(false)
  }

  if (isSeccess) {
    return (
      <AuthLayoutBiz>
        <div className={styles.seccses}>
          <div className={styles.backHideMd}>
            <BackButtonBiz backFn={() => navigate(pages.SignIn.path)} />
          </div>

          <div className={styles.seccsesContent}>
            <img src={successfullyBizIcon} alt='' style={{ width: 117, height: 117 }} />
            <div className={styles.seccsesTitleWrap}>
              <div className={styles.seccsesTitle}>Check Your Email</div>
              <div className={styles.seccsesDescription}>
                We have sent an email to you with instructions how to recover your password
              </div>
            </div>
          </div>

          {isMobileBiz ? (
            <button
              type='button'
              onClick={() => navigate(pages.SignIn.path)}
              className='btn-biz blue big'
              disabled={loading}
            >
              {loading ? <span className='spinner-border' /> : 'Back to Log In'}
            </button>
          ) : null}
        </div>
      </AuthLayoutBiz>
    )
  }

  return (
    <AuthLayoutBiz>
      <FormProvider {...methods}>
        <form className={styles.forgetPasswordModal} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.backHideMd}>
            <BackButtonBiz backFn={() => navigate(pages.SignIn.path)} />
          </div>

          <div className={styles.titleWrap}>
            <div className={styles.title}>Forgot Password?</div>
            <div className={styles.description}>Instructions to recover password will be sent to your email.</div>
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
                  ...(errors.email ? { border: '1px solid red' } : {}),
                }}
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
          </div>

          <div className={styles.forgotBtnWrap}>
            <button type='submit' className={clsx('btn-biz blue big')} disabled={loading}>
              {loading ? <span className='spinner-border' /> : 'Send'}
            </button>

            {isMobileBiz ? (
              <button
                type='button'
                onClick={() => navigate(pages.SignIn.path)}
                className='btn-biz transparent big'
                disabled={loading}
              >
                {loading ? <span className='spinner-border' /> : 'Back to Log In'}
              </button>
            ) : null}
          </div>
        </form>
      </FormProvider>
    </AuthLayoutBiz>
  )
}
