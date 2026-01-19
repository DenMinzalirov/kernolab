import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { pages } from 'constant'
import { STEP_UP_SCOPE } from 'constant/step-up-scope'
import { validateAddress } from 'utils'
import { handleError } from 'utils/error-handler'
import { validateStepUpAvailability } from 'utils/validate-step-up-availability'
import { WhitListServices } from 'wip/services/white-list'

import { BackButtonBiz } from '../../../components/back-button-biz'
import { SuccessfullyBiz } from '../../../components/successfully-biz'
import { StepControllerComponent } from '../../../features/step-controller'
import { getWhiteListFx } from '../../../model/white-list'
import { AuthResponse, MFAAddAuthResponse, StepUpAuthResponse } from '../../../wip/services'
import { WhitelistFormBiz } from '../whitelist-form-biz'
import styles from './styles.module.scss'
import { ErrorViewBiz } from 'biz/step-controller-biz/error-view-biz'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'
import { useFindWhitelistAddress } from 'hooks/use-find-whitelist-address'

const defaultValues = {
  address: '',
  network: '',
  memo: '',
  addressLabel: '',
}

const STEPS = {
  ADDRESS: 'ADDRESS',
  SUMMARY: 'SUMMARY',
  EDIT: 'EDIT',
}

export function ManageWhitelistBiz() {
  const navigate = useNavigate()
  const location = useLocation()
  const whitelistData = location.state?.data

  const { isMobileBiz } = useCurrentBreakpoint()

  const methods = useForm({ defaultValues })
  const {
    handleSubmit,
    formState: { errors, isDirty },
    clearErrors,
    watch,
    setValue,
    setError,
  } = methods

  const watchAddress = watch('address')
  const watchNetwork = watch('network')
  const watchMemo = watch('memo')
  const watchAddressName = watch('addressLabel')

  const [isLoading, setIsLoading] = useState(false)
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null)
  const [step, setStep] = useState(whitelistData?.id ? STEPS.EDIT : STEPS.ADDRESS)
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>()
  const [isSuccessful, setIsSuccessful] = useState(false)
  const [responseError, setResponseError] = useState('')

  const existingWhitelist = useFindWhitelistAddress({
    address: watchAddress,
    networkId: watchNetwork,
    tag: watchMemo,
    name: watchAddressName,
  })

  useEffect(() => {
    setValue('network', selectedNetworkId || '')
  }, [selectedNetworkId])

  useEffect(() => {
    if (whitelistData) {
      setSelectedNetworkId(whitelistData.networkId)
      setValue('address', whitelistData.address)
      setValue('memo', whitelistData.tag)
      setValue('addressLabel', whitelistData.name)
    }
  }, [])

  useEffect(() => {
    if (existingWhitelist && isDirty) {
      const message = 'Whitelist already exist.'

      setError('address', { type: 'validate', message })
      setError('network', { type: 'validate', message })
      setError('memo', { type: 'validate', message })
    } else {
      clearErrors()
    }
  }, [existingWhitelist])

  const handleBack = () => {
    setStep(STEPS.ADDRESS)
  }

  const handleDisableBtn = () => {
    if (isLoading) return true

    if (existingWhitelist) return true

    if (step === STEPS.ADDRESS) {
      return !selectedNetworkId
    }

    return false
  }

  const handleActionAddress = async () => {
    if (step === STEPS.ADDRESS) {
      setStep(STEPS.SUMMARY)
      return
    }

    setIsLoading(true)
    try {
      const isValidAddress = selectedNetworkId ? await validateAddress(watchAddress, selectedNetworkId) : ''
      if (!isValidAddress) {
        setError('address', { type: 'validate', message: 'Invalid Address' })
        return
      }

      const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.WITHDRAWAL)
      stepUpRes && setResponse(stepUpRes)
    } catch (error: any) {
      console.log('ERROR-handleActionAddress', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBtnName = () => {
    switch (step) {
      case STEPS.SUMMARY:
        return 'Confirm & Add to Whitelist'
      case STEPS.EDIT:
        return 'Update Whitelist'
      case STEPS.ADDRESS:
        return 'Add to Whitelist'
      default:
        return ''
    }
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    setIsLoading(true)

    const whitelistPayload = {
      name: watchAddressName,
      networkId: watchNetwork,
      address: watchAddress,
      tag: watchMemo,
    }

    try {
      const token = (responseData as StepUpAuthResponse).oneTimeAccessToken

      const whitelistAction =
        step === STEPS.EDIT
          ? () => WhitListServices.updateAddressWhitelist(whitelistPayload, whitelistData?.id || '', token)
          : () => WhitListServices.addAddressWhitelist(whitelistPayload, token)

      await whitelistAction()
      await getWhiteListFx()

      setIsSuccessful(true)
    } catch (error) {
      console.error('ERROR-addAddressWhitelist', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSuccessTitle = (actionStep: string, isMobile: boolean): string => {
    if (actionStep === STEPS.ADDRESS && !isMobile) return 'Address Whitelisted Successfully'
    if (actionStep === STEPS.EDIT && !isMobile) return 'Edits Saved Successfully'
    if (actionStep === STEPS.EDIT && isMobile) return 'Edits Saved'

    return 'Address Whitelisted'
  }

  const successTitle = getSuccessTitle(step, isMobileBiz)
  const successDescription =
    step === STEPS.EDIT ? 'Your changes have been saved and applied.' : 'Address now approved for future transactions.'

  if (isSuccessful) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrap}>
          <SuccessfullyBiz
            textData={{
              title: successTitle,
              description: successDescription,
              btnText: 'Return to Whitelist',
            }}
            action={() => {
              setValue('address', '')
              setValue('network', '')
              setValue('memo', '')
              setValue('addressLabel', '')
              setSelectedNetworkId(null)
              setStep(STEPS.ADDRESS)
              setResponse(null)
              setIsSuccessful(false)
              navigate(pages.WHITELIST.path)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(handleActionAddress)}
          className={clsx(styles.contentWrap, {
            [styles.contentWrapFix]: [STEPS.EDIT, STEPS.ADDRESS].includes(step),
          })}
        >
          {!response && (
            <>
              {step === STEPS.SUMMARY ? (
                <div className={styles.backBtnWrap}>
                  <BackButtonBiz backFn={handleBack} padding={30} />
                </div>
              ) : null}

              {step === STEPS.SUMMARY ? (
                <div className={styles.summaryTitle}>Confirm Details</div>
              ) : (
                <div className={styles.titleWrap}>
                  <div className={styles.title}>{step === STEPS.EDIT ? 'Edit Whitelist' : 'Add Whitelist'}</div>
                  <div className={styles.description}>
                    {step === STEPS.EDIT
                      ? // eslint-disable-next-line max-len
                        'To edit the whitelist, select the input you wish to modify. Ensure the changes are\u00A0accurate before saving, as this affects your approved recipient list.'
                      : // eslint-disable-next-line max-len
                        'To add to the whitelist, enter the information you wish to include. Ensure the details are accurate before saving, as this will affect your approved recipient list.'}
                  </div>
                </div>
              )}

              <div className={styles.heightSpacer} />

              {step === STEPS.ADDRESS || step === STEPS.EDIT ? (
                <>
                  <WhitelistFormBiz
                    methods={methods}
                    selectedNetworkId={selectedNetworkId}
                    setSelectedNetworkId={setSelectedNetworkId}
                    isLoading={isLoading}
                  />
                </>
              ) : null}

              {step === STEPS.SUMMARY && (
                <div className={styles.summaryWrap}>
                  <div className={styles.summaryRow}>
                    <div className={styles.summaryText}>Address</div>
                    <div className={styles.summaryAddressSubText}>{watchAddress}</div>
                  </div>

                  <div className={styles.summaryRow}>
                    <div className={styles.summaryText}>Network</div>
                    <div className={styles.summarySubText}>{watchNetwork}</div>
                  </div>

                  <div className={styles.summaryRow}>
                    <div className={styles.summaryText}>Memo Tag</div>
                    <div className={styles.summarySubText}>{watchMemo}</div>
                  </div>

                  <div className={styles.summaryRow}>
                    <div className={styles.summaryText}>Label</div>
                    <div className={styles.summarySubText}>{watchAddressName}</div>
                  </div>
                </div>
              )}

              <div className={styles.bottonWrap}>
                <div />

                {errors.address ? (
                  <ErrorViewBiz errorMessage={errors.address.message || 'Unknown Error'} margin={'0'} />
                ) : null}

                <button disabled={handleDisableBtn()} type='submit' className='btn-biz blue big'>
                  {isLoading ? <span className='spinner-border' /> : handleBtnName()}
                </button>
              </div>
            </>
          )}
          {response && (
            <div className={styles.stepControllerWrap}>
              <div className={styles.title}>{step === STEPS.EDIT ? 'Edit Whitelist' : 'Add Whitelist'}</div>
              <div className={styles.dynamicHeight} />
              <StepControllerComponent
                nextStepResponse={response}
                finalAction={handleFinalAction}
                dataProps={{ resetStepUp: () => setResponse(null) }}
              />
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  )
}
