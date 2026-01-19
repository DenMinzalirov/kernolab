import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { SuccessPairs } from 'features/success-pairs'

import { HeaderTitle, Modal, Spinner } from '../../../components'
import { pages, regex } from '../../../constant'
import { ErrorInfoIcon } from '../../../icons/error-info-icon'
import { getUserInfoFx } from '../../../model/user-info'
import { handleError } from '../../../utils/error-handler'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from '../../../wip/services'
import { SecurityTimerModal } from '../../modals/security-timer-modal'
import { StepControllerComponent } from '../../step-controller'
import styles from './styles.module.scss'

type Inputs = {
  newEmail: string
}

const defaultValues = {
  newEmail: '',
}

export function SettingsUserEmail() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Inputs>({ defaultValues })

  const inputValue = watch('newEmail')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [responseError, setResponseError] = useState('')
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)

  const onSubmit = async (formData: Inputs) => {
    setIsLoading(true)
    const newEmailValue = formData.newEmail.toLowerCase()?.trim()

    const data = { newEmail: newEmailValue }

    try {
      const emailRes = await AuthServiceV4.changeEmail(data)
      setResponse(emailRes)
    } catch (error) {
      console.log('ERROR-changeEmail', error)
      const errorMessage = handleError(error, true)
      errorMessage && setResponseError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalAction = () => {
    getUserInfoFx()
    setIsSuccess(true)

    Modal.open(<SecurityTimerModal />, {
      variant: 'center',
    })
  }

  if (isSuccess) {
    return (
      <SuccessPairs
        title={'Email Address\nSuccessfully Updated'}
        description={'our email address has been updated. Please use your new email for login.'}
        headerTitle={'Change Email'}
        btnText='Go Back to Settings'
        btnAction={() => {
          navigate(pages.SETTINGS.path)
          Modal.close()
        }}
      />
    )
  }

  return (
    <div
      // className={styles.container}
      className='page-container-pairs'
    >
      {/*<div className={styles.headerWrap}>*/}
      <HeaderTitle headerTitle={'Change Email'} showBackBtn backBtnTitle={'Settings'} />
      {/*</div>*/}
      <div className={styles.contentWrap}>
        <div>
          {!isLoading ? <div className={styles.title}>Change Email</div> : null}
          {isLoading ? <Spinner /> : null}
          {!response && !isLoading && (
            <form onSubmit={handleSubmit(onSubmit)} className={styles.formWrap}>
              <div className={styles.description}>
                To change your email address please follow <br />
                the steps specified.
              </div>
              <div style={{ height: 48 }} />
              <div style={{ width: '100%' }} className='input-item-wrap-new'>
                <label htmlFor='code' className={'input-label'}>
                  New Email
                </label>
                <input
                  type='text'
                  className='input-form'
                  style={errors.newEmail ? { border: '1px solid var(--P-System-Red)' } : {}}
                  placeholder='Type here..'
                  {...register('newEmail', {
                    required: true,
                    pattern: {
                      value: regex.email,
                      message: 'Invalid email address',
                    },
                  })}
                  disabled={isLoading}
                />

                <div className={styles.errorWrap}>
                  {errors.newEmail || responseError ? (
                    <div style={{ display: 'flex', marginTop: 12 }}>
                      <ErrorInfoIcon />
                      <div style={{ width: 8 }} />
                      <div className={styles.errorText}>{errors.newEmail?.message || responseError}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ height: 100 }} />

              <div className={styles.button}>
                <div></div>
                <button
                  type='submit'
                  className={clsx('btn-new primary big', !inputValue ? styles.buttonDisable : {})}
                  disabled={isLoading || !inputValue}
                >
                  {isLoading ? <span className='spinner-border' /> : 'Next'}
                </button>
              </div>
            </form>
          )}

          {response && !isLoading && (
            <StepControllerComponent
              nextStepResponse={response}
              finalAction={handleFinalAction}
              dataProps={{ email: inputValue, resetStepUp: () => setResponse(null) }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
