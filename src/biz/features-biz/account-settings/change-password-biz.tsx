import { Dispatch, SetStateAction, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import clsx from 'clsx'

import { Modal } from 'components'
import { BackButtonBiz } from 'components/back-button-biz'
import { SuccessfullyBiz } from 'components/successfully-biz'
import { StepControllerComponent } from 'features/step-controller'
import { saveRefreshToken, saveToken } from 'utils'
import { handleError } from 'utils/error-handler'
import { validateHintPassword } from 'utils/validate-рint-зassword'
import { getUserInfoFx } from 'model/user-info'
import eye from 'assets/icons/eye.svg'
import eyeOff from 'assets/icons/eye-off.svg'

import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from '../../../wip/services'
import { SecurityTimerModalBiz } from '../modals-biz/security-timer-modal-biz'
import { ACCOUNT_PAGES } from './index'
import styles from './styles.module.scss'
import { ErrorViewBiz } from 'biz/step-controller-biz/error-view-biz'

type Inputs = {
  currentPassword: string
  newPassword: string
  repeatNewPassword: string
}

const defaultValues = {
  currentPassword: '',
  newPassword: '',
  repeatNewPassword: '',
}

type Props = {
  setPage: Dispatch<SetStateAction<string>>
}

const STEP = {
  ENTER_PASSWORDS: 'Enter Old and New Password',
  CONFIRM_PASSWORD: 'Confirm New Password',
}
const hints = ['Min 8 characters', 'One Uppercase', 'One Lowercase', 'One Number', 'One Sign']

export function ChangePasswordBiz({ setPage }: Props) {
  const [step, setStep] = useState(STEP.ENTER_PASSWORDS)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [responseError, setResponseError] = useState('')
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)
  const [isSuccessful, setIsSuccessful] = useState(false)

  const methods = useForm<Inputs>({ defaultValues, mode: 'onChange' })
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
    getValues,
  } = methods

  const inputValue = watch('currentPassword')
  const watchNewPassword = watch('newPassword')

  const toggleShowPassword = (): void => {
    setShowPassword(prevState => !prevState)
  }

  const isSamePassword = (repeatPassword: string): boolean => {
    const password = getValues('newPassword')
    return repeatPassword === password
  }

  const onSubmit = async (formData: Inputs) => {
    if (step === STEP.ENTER_PASSWORDS) {
      setStep(STEP.CONFIRM_PASSWORD)
      return
    }

    setIsLoading(true)

    try {
      const stepUpRes = await AuthServiceV4.changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      stepUpRes && setResponse(stepUpRes)
    } catch (error) {
      console.log('ERROR-changeEmail', error)

      const errorMessage = handleError(error, true)

      if (errorMessage) {
        setStep(STEP.ENTER_PASSWORDS)
        setError('currentPassword', { message: errorMessage })
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

  const handleBack = () => {
    step === STEP.CONFIRM_PASSWORD ? setStep(STEP.ENTER_PASSWORDS) : setPage(ACCOUNT_PAGES.SECURITY)
  }

  if (isSuccessful) {
    return (
      <div className={styles.changeFormWrapSuccessful}>
        <SuccessfullyBiz
          textData={{
            title: 'Password Updated',
            description: '',
            btnText: 'Return to Settings',
          }}
          action={() => {
            setResponse(null)
            setIsSuccessful(false)
            setPage(ACCOUNT_PAGES.SECURITY)
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
            <div className={styles.changeTitle}>Change Password</div>
            <div className={styles.changeDescription} style={{ textAlign: 'center' }}>
              To add your phone number, please follow&nbsp;the&nbsp;steps&nbsp;specified.
            </div>
          </div>

          <div className={styles.minHeight12} />

          <div style={{ width: '100%' }}>
            {step === STEP.ENTER_PASSWORDS && (
              <>
                <div>
                  <div className={clsx(styles.changeLabel, errors.currentPassword && styles.colorRed)}>
                    Current Password
                    {errors.currentPassword && errors.currentPassword.type === 'required' ? ' Required' : ''}
                  </div>
                  <div className='input-item-wrap-biz'>
                    <input
                      id='currentPassword'
                      type={showPassword ? 'text' : 'password'}
                      className={clsx(`input-form ${errors.currentPassword || responseError ? 'error' : ''}`)}
                      maxLength={128}
                      placeholder='Type here..'
                      {...register('currentPassword', {
                        required: true,
                      })}
                    />
                    <div onClick={toggleShowPassword}>
                      <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye-biz' />
                    </div>
                  </div>
                </div>

                {errors.currentPassword?.message ? (
                  <ErrorViewBiz errorMessage={errors.currentPassword?.message || ''} />
                ) : null}

                <div className={styles.height24}></div>

                <div>
                  <div className={clsx(styles.changeLabel, errors.newPassword?.type === 'required' && styles.colorRed)}>
                    New Password
                    {errors.newPassword && errors.newPassword.type === 'required' ? ' Required' : ''}
                  </div>
                  <div className='input-item-wrap-biz'>
                    <input
                      id='newPassword'
                      type={showPassword ? 'text' : 'password'}
                      className={clsx(
                        `input-form ${errors.newPassword?.type === 'required' || responseError ? 'error' : ''}`
                      )}
                      maxLength={128}
                      placeholder='Type here..'
                      {...register('newPassword', {
                        required: !!hints.length,
                        validate: validateHintPassword,
                      })}
                    />
                    <div onClick={toggleShowPassword}>
                      <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye-biz' />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === STEP.CONFIRM_PASSWORD && (
              <div>
                <div className={clsx(styles.changeLabel, errors.repeatNewPassword && styles.colorRed)}>
                  Repeat New Password
                  {errors.repeatNewPassword && errors.repeatNewPassword.type === 'required' ? ' Required' : ''}
                </div>
                <div className='input-item-wrap-biz'>
                  <input
                    id='repeatNewPassword'
                    type={showPassword ? 'text' : 'password'}
                    className={clsx(`input-form ${errors.repeatNewPassword || responseError ? 'error' : ''}`)}
                    maxLength={128}
                    placeholder='Type here..'
                    {...register('repeatNewPassword', {
                      required: true,
                      min: 0,
                      validate: isSamePassword,
                    })}
                  />
                  <div onClick={toggleShowPassword}>
                    <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye-biz' />
                  </div>
                </div>
              </div>
            )}

            {step === STEP.ENTER_PASSWORDS && (
              <>
                <div className={styles.height12}></div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {hints.map(text => {
                    return (
                      <div
                        className={clsx(
                          styles.hintText,
                          watchNewPassword ? styles.colorGreen : styles.colorDarkGrey,
                          errors.newPassword?.message?.includes(text) && styles.colorRed
                        )}
                        key={text}
                      >
                        {text}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* {responseError ? <ErrorViewBiz errorMessage={responseError} /> : null} */}
          </div>

          <div className={styles.minHeight12} />

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
          <div className={styles.changeTitle}>Change Password</div>

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
