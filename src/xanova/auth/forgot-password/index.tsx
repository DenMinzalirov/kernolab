import { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { pages, regex } from 'constant'
import { handleError } from 'utils/error-handler'
import { AuthServiceV4 } from 'wip/services'
import backArrow from 'assets/icons/back-arrow.svg'

import { AuthLayoutXanova } from '../auth-layout'
import styles from '../styles.module.scss'
import { SuccessContentXanova } from 'xanova/components/success-content/success-content'

type Inputs = {
  email: string
}

const defaultValues = {
  email: '',
}

export function ForgotPasswordXanova() {
  const navigate = useNavigate()
  const methods = useForm<Inputs>({ defaultValues })
  const [isSeccess, setIsSeccess] = useState(false)

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
      <AuthLayoutXanova>
        <SuccessContentXanova
          title={'Check Your Email'}
          subTitle='We have sent an email to you with instructions how to recover your password'
          btnText={'Back to Log In'}
          action={() => navigate(pages.SignIn.path)}
          variant='auth'
        />
      </AuthLayoutXanova>
    )
  }

  return (
    <AuthLayoutXanova>
      <FormProvider {...methods}>
        <form className={styles.forgetPasswordModal} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Forgot Password?</div>
            <div className={styles.description}>Instructions to recover password will be sent to your email.</div>
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
                autoComplete='username'
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
          </div>

          <div className={styles.forgotBtnWrap}>
            <button type='button' onClick={() => navigate(pages.SignIn.path)} className='btn-with-icon-xanova circle50'>
              <img alt={'Back'} src={backArrow} />
            </button>

            <button type='submit' className={clsx('btn-xanova gold big')} disabled={loading}>
              {loading ? <span className='spinner-border' /> : 'Send'}
            </button>
          </div>
        </form>
      </FormProvider>
    </AuthLayoutXanova>
  )
}
