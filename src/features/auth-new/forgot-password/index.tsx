import { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import I18n from 'components/i18n'
import i18n from 'components/i18n/localize'
import { regex } from 'constant'
import { AuthLayout } from 'features/auth-new/auth-layout'
import AuthTitle from 'features/auth-new/auth-title'
import { AuthServiceV4 } from 'wip/services'
import { MessageIcon } from 'assets/message-icon'

import backArrow from '../../../assets/icons/back-arrow.svg'
import fideumOnboardingLogo from '../../../assets/icons/fideumOnboardingLogo.svg'
import kernolabLogo from '../../../assets/icons/Kernolab-logo-2021-black.svg'
import styles from '../styles.module.scss'

type Inputs = {
  email: string
}

const defaultValues = {
  email: '',
}

const ForgotPassword: React.FC = () => {
  const methods = useForm<Inputs>({ defaultValues })

  const navigate = useNavigate()

  const { t } = i18n

  const [isSend, setIsSend] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = methods

  const handleBack = () => {
    navigate(-1)
  }

  const onSubmit: SubmitHandler<Inputs> = async data => {
    setLoading(true)
    try {
      await AuthServiceV4.resetPassword(data)
      setIsSend(true)
    } catch (error) {
      console.log('ERROR-resetPassword', error)
    }

    setLoading(false)
  }

  return (
    <AuthLayout>
      <div className={styles.rightModule}>
        {/*<BackButton />*/}
        <div className={styles.mobilePairsLogo}>
          <img height={100} src={kernolabLogo} alt='' />
        </div>
        <div className={styles.formWrap}>
          {isSend ? (
            <>
              <div className={styles.iconMessageContainer}>
                <div className={styles.iconMessageWrap}>
                  <div className={styles.iconMessageCircle}>
                    <MessageIcon />
                  </div>
                </div>
              </div>
              <AuthTitle title='forgotPassword.checkEmail' description='forgotPassword.instructions' />
              <button onClick={handleBack} className='btn-new transparent big'>
                <img alt={''} src={backArrow} style={{ marginRight: 12 }} />
                Go Back to Sign In
              </button>
            </>
          ) : (
            <>
              <AuthTitle title='forgotPassword.title' description='forgotPassword.description' />
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className='input-item-wrap-new'>
                    <label htmlFor='email' className={`input-label ${errors.email ? 'text-error' : ''}`}>
                      {t('signIn.email')}{' '}
                      {errors.email && errors.email.type === 'pattern' ? t('inputError.invalid') : ''}
                      {errors.email && errors.email.type === 'required' ? t('inputError.required') : ''}
                    </label>
                    <input
                      // style={errors.email ? { border: '1px solid red' } : {}}
                      id='email'
                      type='text'
                      aria-invalid={!!errors.email}
                      className={`input-form  ${errors.email ? 'error' : ''}`}
                      placeholder='Type here..'
                      {...register('email', {
                        required: true,
                        pattern: {
                          value: regex.email,
                          message: t('signIn.invalidEmail'),
                        },
                        onChange(event) {
                          setValue('email', event.target.value?.toLowerCase()?.trim())
                        },
                      })}
                    />
                  </div>

                  <div style={{ height: 50 }} />

                  <button type='submit' className='btn-new primary big' disabled={loading}>
                    {loading ? <span className='spinner-border' /> : <I18n tKey='forgotPassword.send' />}
                  </button>

                  <div style={{ height: 12 }} />

                  <button onClick={handleBack} className='btn-new transparent big'>
                    <img alt={''} src={backArrow} style={{ marginRight: 12 }} />
                    Go Back to Sign In
                  </button>
                </form>
              </FormProvider>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
