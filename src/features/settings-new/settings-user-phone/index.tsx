import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { SuccessPairs } from 'features/success-pairs'

import { HeaderTitle, Modal, Spinner } from '../../../components'
import { pages, regex } from '../../../constant'
import { ErrorInfoIcon } from '../../../icons/error-info-icon'
import { $userInfo, getUserInfoFx } from '../../../model/user-info'
import { handleError } from '../../../utils/error-handler'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from '../../../wip/services'
import { SecurityTimerModal } from '../../modals/security-timer-modal'
import { StepControllerComponent } from '../../step-controller'
import styles from './styles.module.scss'

type Inputs = {
  newPhone: string
}

const defaultValues = {
  newPhone: '+',
}

export function SettingsUserPhone() {
  const navigate = useNavigate()
  const userInfo = useUnit($userInfo)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Inputs>({ defaultValues })
  const inputValue = watch('newPhone')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccessful, setIsSuccessful] = useState(false)
  const [responseError, setResponseError] = useState('')
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)
  const [isAdd, setIsAdd] = useState(false)

  const onSubmit = async (formData: Inputs) => {
    setIsLoading(true)
    const newPhoneValue = formData.newPhone.replace(/[^+\d]/g, '')

    try {
      const phoneRes = userInfo.phone
        ? await AuthServiceV4.changePhone({ newPhone: newPhoneValue })
        : await AuthServiceV4.addPhone({ phone: newPhoneValue })
      setIsAdd(!!userInfo.phone)
      setResponse(phoneRes)
    } catch (error) {
      console.log('ERROR-changePhone or ERROR-addPhone', error)
      const errorMessage = handleError(error, true)
      errorMessage && setResponseError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalAction = () => {
    if (isAdd) {
      getUserInfoFx().then(() => null)

      Modal.open(<SecurityTimerModal />, {
        variant: 'center',
      })

      setIsSuccessful(true)
      getUserInfoFx().then(() => null)
    } else {
      setIsSuccessful(true)
      getUserInfoFx().then(() => null)
    }
  }

  if (isSuccessful) {
    return (
      <SuccessPairs
        title={'Phone Number\nSuccessfully Added'}
        description={
          'Your phone number has been successfully added to your account. You can now use it for verification and security purposes.'
        }
        headerTitle={'Add Phone Number'}
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
      <HeaderTitle headerTitle={'Add Phone Number'} showBackBtn backBtnTitle={'Settings'} />
      {/*</div>*/}
      <div className={styles.contentWrap}>
        <div>
          {!isLoading ? <div className={styles.title}>Add Phone Number</div> : null}

          {isLoading ? <Spinner /> : null}
          {!response && !isLoading && (
            <form onSubmit={handleSubmit(onSubmit)} className={styles.formWrap}>
              <div className={styles.description}>
                {`To ${userInfo.phone ? 'change' : 'add'} your phone number please follow`} <br />
                the steps specified.
              </div>
              <div style={{ height: 48 }} />
              <div style={{ width: '100%' }} className='input-item-wrap-new'>
                <label htmlFor='code' className={'input-label'}>
                  Phone Number
                </label>

                <input
                  type='text'
                  className='input-form'
                  style={errors.newPhone ? { border: '1px solid var(--P-System-Red)' } : {}}
                  placeholder={`Enter your ${userInfo.phone ? 'new' : ''} phone number`}
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
              </div>

              <div className={styles.errorWrap}>
                {errors.newPhone || responseError ? (
                  <div style={{ display: 'flex', gap: 7, marginTop: 7 }}>
                    <ErrorInfoIcon />
                    <div className={styles.errorText}>{errors.newPhone?.message || responseError}</div>
                  </div>
                ) : null}
              </div>

              <div style={{ height: 100 }} />

              <div className={styles.button}>
                <button
                  type='submit'
                  className={clsx('btn-new primary big', ['', '+'].includes(inputValue) ? styles.buttonDisable : {})}
                  disabled={isLoading || ['', '+'].includes(inputValue)}
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
              dataProps={{ phone: inputValue, resetStepUp: () => setResponse(null) }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
