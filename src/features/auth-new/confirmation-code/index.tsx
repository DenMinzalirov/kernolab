import { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import { BackButton } from 'components'
import I18n from 'components/i18n'
import i18n from 'components/i18n/localize'
import { pages } from 'constant'
import { parseJwt } from 'utils'
import { handleError } from 'utils/error-handler'
import { AuthResponse } from 'wip/services'
import { StepControllerService } from 'wip/services/step-controller'
import { initApp } from 'wip/stores'
import { updateEarning } from 'wip/stores/init'
import { MessageIcon } from 'assets/message-icon'

import { AuthLayout } from '../auth-layout'
import AuthTitle from '../auth-title'
import styles from '../styles.module.scss'

type Inputs = {
  confirmationCode: string
}

const defaultValues = {
  confirmationCode: '',
}

const STEPS = {
  VERIFY_PHONE: 'VERIFY_PHONE',
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  MFA_CONFIRM: 'MFA_CONFIRM',
}

export function ConfirmationCode() {
  const { t } = i18n
  const location = useLocation()
  const sessionToken = location.state?.sessionToken
  const step = location.state?.step
  const navigate = useNavigate()
  const methods = useForm<Inputs>({ defaultValues })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods

  const [loading, setLoading] = useState<boolean>(false)

  const handleConfirmation: SubmitHandler<Inputs> = async data => {
    setLoading(true)

    try {
      let res: AuthResponse | undefined
      if (step === STEPS.VERIFY_PHONE) {
        res = await StepControllerService.verifyPhone(sessionToken, { code: data.confirmationCode })
      }

      if (step === STEPS.VERIFY_EMAIL) {
        res = await StepControllerService.verifyEmail(sessionToken, { code: data.confirmationCode })
      }

      if (res) {
        if (res.nextStep === STEPS.MFA_CONFIRM) {
          navigate(pages.TwoFactorAuthentication.path, {
            state: { sessionToken: res.sessionToken },
          })
        }

        if (res.nextStep === null) {
          if (!res?.accessToken) {
            navigate(pages.SignIn.path)
          }

          const parsedToken = parseJwt(res.accessToken)
          const scope = parsedToken?.scope

          await initApp()
          await updateEarning()

          if (scope && scope.length) {
            navigate(scope.includes('KYC') ? pages.Base.path : pages.KYC.path)
          }
        }
      }
    } catch (error) {
      console.log('ERROR-handleConfirmation', error)

      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)

    try {
      await StepControllerService.resendOtp(sessionToken)
    } catch (error: any) {
      console.log('handleResend-ERROR', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className={styles.rightModule}>
        <BackButton backFn={() => navigate(pages.SignIn.path)} />

        <div className={styles.formWrap}>
          <div className={styles.iconMessageContainer}>
            <div className={styles.iconMessageWrap}>
              <div className={styles.iconMessageCircle}>
                <MessageIcon />
              </div>
            </div>
          </div>

          <AuthTitle
            title={step === STEPS.VERIFY_PHONE ? 'Check Your Phone' : 'ConfirmationCode.confirm.title'}
            description={
              step === STEPS.VERIFY_PHONE
                ? 'A confirmation code has been sent to your phone'
                : 'ConfirmationCode.confirm.description'
            }
          />
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleConfirmation)}>
              <div style={{ marginTop: '-2rem' }} className='input-item-wrap'>
                <input
                  type='text'
                  className='input-form'
                  style={errors.confirmationCode ? { border: '1px solid red' } : {}}
                  placeholder={t('ConfirmationCode.confirmationCode') || ''}
                  {...register('confirmationCode', { required: true })}
                />
                <div style={{ height: '2rem' }} />
                <button type='submit' className='btn btn-primary' disabled={loading}>
                  {loading ? <span className='spinner-border' /> : <I18n tKey='ConfirmationCode.confirm' />}
                </button>

                <div className='input-item-wrap text-under-button'>
                  <p className='input-label text-center'>
                    {t('ConfirmationCode.notReceive')}
                    <span
                      onClick={async () => {
                        await handleResend()
                      }}
                      className='input-label form-link'
                    >
                      {t('ConfirmationCode.sendAgain')}
                    </span>
                  </p>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </AuthLayout>
  )
}
