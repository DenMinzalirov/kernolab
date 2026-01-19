import { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import { BackButton } from 'components'
import I18n from 'components/i18n'
import i18n from 'components/i18n/localize'
import { pages } from 'constant'
import { AuthLayout } from 'features/auth-new/auth-layout'
import AuthTitle from 'features/auth-new/auth-title'
import { saveRefreshToken, saveToken } from 'utils'
import { handleError } from 'utils/error-handler'
import { StepControllerService } from 'wip/services/step-controller'
import { initApp } from 'wip/stores'

import { ErrorView } from '../../step-controller/error-view'
import styles from '../styles.module.scss'

type Inputs = {
  code: string
}

const defaultValues = {
  code: '',
}

// TODO the same component in settings ??
export function TwoFactorAuthentication() {
  const methods = useForm<Inputs>({ defaultValues })
  const { t } = i18n
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState<boolean>(false)
  const [responseError, setResponseError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods

  const onSubmit: SubmitHandler<Inputs> = async data => {
    setLoading(true)
    try {
      const res = await StepControllerService.confirmMfa(location.state?.sessionToken, { totp: data.code })

      if (res.nextStep === null) {
        await initApp()

        navigate(pages.PORTFOLIO.path)
      }
    } catch (error) {
      console.log('ERROR-twoFASignIn', error)
      const errorMessage = handleError(error, true)
      errorMessage && setResponseError(errorMessage)
    }
    setLoading(false)
  }

  return (
    <AuthLayout>
      <div className={styles.rightModule}>
        <BackButton />

        <div className={styles.formWrap}>
          <AuthTitle title='twoFactorAuthentication.title' description='twoFactorAuthentication.description' />
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='input-item-wrap'>
                <label htmlFor='code' className={`input-label ${errors.code ? 'text-error' : ''}`}>
                  {t('twoFactorAuthentication.code')}{' '}
                  {errors.code && errors.code.type === 'required' ? t('inputError.required') : ''}
                </label>
                <input
                  style={errors.code ? { border: '1px solid red' } : {}}
                  id='code'
                  type='text'
                  aria-invalid={!!errors.code}
                  className='input-form'
                  placeholder={t('twoFactorAuthentication.placeholder') || ''}
                  {...register('code', {
                    required: true,
                    onChange: e => {
                      console.log(e.target.value)
                      responseError && setResponseError('')
                    },
                  })}
                />
              </div>

              <ErrorView errorMessage={responseError} />

              <button type='submit' className='btn btn-primary' disabled={loading}>
                {loading ? <span className='spinner-border' /> : <I18n tKey='signIn.title' />}
              </button>
            </form>
          </FormProvider>
        </div>
      </div>
    </AuthLayout>
  )
}
