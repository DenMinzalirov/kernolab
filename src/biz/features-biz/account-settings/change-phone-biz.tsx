import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { BackButtonBiz } from 'components/back-button-biz'
import { SuccessfullyBiz } from 'components/successfully-biz'
import { regex } from 'constant'
import { StepControllerComponent } from 'features/step-controller'
import { getToken, saveRefreshToken, saveToken } from 'utils'
import { handleError } from 'utils/error-handler'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, PhoneChangeRequest, StepUpAuthResponse } from 'wip/services'
import { $userInfo, getUserInfoFx } from 'model/user-info'

import { SecurityTimerModalBiz } from '../modals-biz/security-timer-modal-biz'
import { ACCOUNT_PAGES } from './index'
import styles from './styles.module.scss'
import { ErrorViewBiz } from 'biz/step-controller-biz/error-view-biz'

type Inputs = {
  newPhone: string
}

const defaultValues = {
  newPhone: '',
}

type Props = {
  setPage: Dispatch<SetStateAction<string>>
}

export function ChangePhoneBiz({ setPage }: Props) {
  const userInfo = useUnit($userInfo)

  useEffect(() => {
    if (!userInfo.phone) {
      const userToken = getToken()
      userToken && getUserInfoFx()
    }
  }, [])

  const [isLoading, setIsLoading] = useState(false)
  const [responseError, setResponseError] = useState('')
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)
  const [isSuccessful, setIsSuccessful] = useState(false)

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
    setError,
    clearErrors,
  } = methods

  const inputValue = watch('newPhone')

  const onSubmit = async (formData: Inputs) => {
    setIsLoading(true)
    const newPhoneValue = formData.newPhone.toLowerCase()?.trim()

    const data: PhoneChangeRequest = { newPhone: newPhoneValue }

    try {
      const phoneRes = userInfo.phone
        ? await AuthServiceV4.changePhone({ newPhone: newPhoneValue })
        : await AuthServiceV4.addPhone({ phone: newPhoneValue })
      setResponse(phoneRes)
    } catch (error) {
      console.log('ERROR-changePhone', error)

      const errorMessage = handleError(error, true)
      if (errorMessage) {
        setError('newPhone', { message: errorMessage })
        setResponseError(errorMessage)
      }
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
    return (
      <div className={styles.changeFormWrapSuccessful}>
        <SuccessfullyBiz
          textData={{
            title: 'Phone Number\nSuccessfully Updated',
            description: '',
            btnText: 'Return to Settings',
          }}
          action={() => {
            setValue('newPhone', '')
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
            <div className={styles.changeTitle}>{userInfo?.phone ? 'Change' : 'Add'} Phone Number</div>
            <div className={styles.changeDescription}>
              To add your phone number please follow&nbsp;the&nbsp;steps&nbsp;specified.
            </div>
          </div>

          <div style={{ width: '100%', minHeight: 121 }}>
            <div className={clsx(styles.changeLabel, errors.newPhone && styles.colorRed)}>
              New phone number {errors.newPhone && errors.newPhone?.type === 'required' ? ' Required' : ''}
            </div>

            <div className='input-item-wrap-biz'>
              <input
                id='newPhone'
                type='text'
                className={clsx(`input-form ${errors.newPhone || responseError ? 'error' : ''}`)}
                placeholder='Type here..'
                disabled={isLoading}
                {...register('newPhone', {
                  required: true,
                  pattern: {
                    value: regex.phone,
                    message: 'Invalid phone number',
                  },
                  validate: value => {
                    const trimmedValue = value.replace(/[^+\d]/g, '')
                    if (trimmedValue.length < 8 || trimmedValue.length > 16) {
                      return 'Phone number must be between 8 and 16 characters long.'
                    }
                  },
                  onChange: event => {
                    responseError && setResponseError('')
                    let cleanedValue = event.target.value.replace(/[^0-9()\s_-]+/g, '')
                    if (cleanedValue.charAt(0) !== '+') {
                      cleanedValue = '+' + cleanedValue
                    }
                    setValue('newPhone', cleanedValue)
                  },
                })}
              />

              <ErrorViewBiz errorMessage={responseError} />
            </div>
          </div>

          <div className={styles.changeBtnWrap}>
            <button type='submit' className='btn-biz blue height-50'>
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
          <div className={styles.changeTitle}>{userInfo?.phone ? 'Change' : 'Add'} Phone Number</div>

          <div className={styles.height12} />

          <StepControllerComponent
            nextStepResponse={response}
            finalAction={handleFinalAction}
            dataProps={{ phone: inputValue, resetStepUp: () => setResponse(null) }}
          />
        </div>
      ) : null}
    </FormProvider>
  )
}
