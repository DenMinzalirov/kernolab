import { Dispatch, SetStateAction, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import clsx from 'clsx'

import { Modal } from 'components'
import { BackButtonBiz } from 'components/back-button-biz'
import { SuccessfullyBiz } from 'components/successfully-biz'
import { regex } from 'constant'
import { StepControllerComponent } from 'features/step-controller'
import { handleError } from 'utils/error-handler'
import { AuthResponse, AuthServiceV4, EmailChangeRequest, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { getUserInfoFx } from 'model/user-info'

import { SecurityTimerModalBiz } from '../modals-biz/security-timer-modal-biz'
import { ACCOUNT_PAGES } from './index'
import styles from './styles.module.scss'
import { ErrorViewBiz } from 'biz/step-controller-biz/error-view-biz'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

type Inputs = {
  newEmail: string
}

const defaultValues = {
  newEmail: '',
}

type Props = {
  setPage: Dispatch<SetStateAction<string>>
}

export function ChangeEmailBiz({ setPage }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [responseError, setResponseError] = useState('')
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)
  const [isSuccessful, setIsSuccessful] = useState(false)

  const { isMobileBiz } = useCurrentBreakpoint()
  const handleBack = () => {
    setPage(ACCOUNT_PAGES.ACCOUNT_DETAILS)
  }

  const methods = useForm<Inputs>({ defaultValues })
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = methods

  const inputValue = watch('newEmail')

  const onSubmit = async (formData: Inputs) => {
    setIsLoading(true)
    const newEmailValue = formData.newEmail.toLowerCase()?.trim()

    const data: EmailChangeRequest = { newEmail: newEmailValue }

    try {
      const emailRes = await AuthServiceV4.changeEmail(data)
      setResponse(emailRes)
    } catch (error: any) {
      console.log('ERROR-changeEmail', error)

      const errorMessage = handleError(error, true)
      errorMessage && setResponseError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    await getUserInfoFx()
    setResponse(null)
    setIsSuccessful(true)

    Modal.open(<SecurityTimerModalBiz enableFetch={true} />, { variant: 'center' })
  }

  if (isSuccessful) {
    const successTitle = `Email Address\n${isMobileBiz ? '' : 'Successfully'} Updated`

    return (
      <div className={styles.changeFormWrapSuccessful}>
        <SuccessfullyBiz
          textData={{
            title: successTitle,
            description: '',
            btnText: 'Return to Settings',
          }}
          action={() => {
            setValue('newEmail', '')
            setResponse(null)
            setIsSuccessful(false)
            setPage(ACCOUNT_PAGES.ACCOUNT_DETAILS)
          }}
        />
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      {!response ? (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.changeFormWrap}>
          <BackButtonBiz backFn={handleBack} padding={30} />
          <div className={styles.changeTitleWrap}>
            <div className={styles.changeTitle}>Change Email</div>
            <div className={styles.changeDescription}>
              To change your email address please follow the&nbsp;steps&nbsp;specified.
            </div>
          </div>

          <div style={{ width: '100%' }}>
            <div className={clsx(styles.changeLabel, errors.newEmail || responseError ? styles.colorRed : '')}>
              New email {errors.newEmail && errors.newEmail?.type === 'required' ? ' Required' : ''}
              {errors.newEmail && errors.newEmail?.type === 'pattern' ? ' Invalid' : ''}
            </div>

            <div className='input-item-wrap-biz'>
              <input
                id='newEmail'
                type='text'
                className={clsx(`input-form ${errors.newEmail || responseError ? 'error' : ''}`)}
                placeholder='Type here..'
                {...register('newEmail', {
                  required: true,
                  pattern: {
                    value: regex.email,
                    message: 'Invalid email address',
                  },
                  onChange: event => {
                    responseError && setResponseError('')
                    setValue('newEmail', event.target.value)
                  },
                })}
              />
            </div>

            <ErrorViewBiz errorMessage={responseError} />
          </div>

          <div className={styles.changeBtnWrap}>
            <button type='submit' className='btn-biz blue big'>
              {isLoading ? <span className='spinner-border' /> : 'Continue'}
            </button>

            <button type='button' onClick={handleBack} className='btn-biz transparent big showMd'>
              Back
            </button>
          </div>
        </form>
      ) : null}

      {response ? (
        <div className={styles.stepControllerWrap}>
          <div className={styles.changeTitle}>Change Email</div>

          <div className={styles.height12} />

          <StepControllerComponent
            nextStepResponse={response}
            finalAction={handleFinalAction}
            dataProps={{ email: inputValue, resetStepUp: () => setResponse(null) }}
          />
        </div>
      ) : null}
    </FormProvider>
  )
}
