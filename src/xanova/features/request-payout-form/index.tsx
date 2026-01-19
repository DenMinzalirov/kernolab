import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CommonDropdown, Modal, Spinner } from 'components'
import { pages } from 'constant'
import { STEP_UP_SCOPE } from 'constant/step-up-scope'
import { StepControllerComponent, STEPS } from 'features/step-controller'
import { validateAddress } from 'utils'
import { handleError } from 'utils/error-handler'
import { validateStepUpAvailability } from 'utils/validate-step-up-availability'
import {
  AssetsServices,
  AuthResponse,
  MFAAddAuthResponse,
  StepUpAuthResponse,
  WithdrawalOffer,
  WithdrawalOfferFiat,
  XanovaFiatServices,
  XanovaServices,
} from 'wip/services'
import { initApp } from 'wip/stores'
import { $requestPayoutForm, requestPayoutFormResetEv, RequestPayoutFormValues } from 'model'
import { $assetsListData } from 'model/cefi-combain-assets-data'
import { $membershipStatus } from 'model/membership-status'
import { $stepControllerNextStep } from 'model/step-controller'
import { $stepUpBlockExpiration, stepUpBlockExpirationFx } from 'model/step-up-block-expiration'
import { $twoFaStatus } from 'model/two-fa'

import {
  DEFAULT_PAYOUT_METHOD_OPTION,
  FIAT_ASSET_ID,
  REQUEST_PAYOUT_METHOD_TABS,
  REQUEST_PAYOUT_METHODS,
} from '../../constants/request-payout-methods'
import styles from './styles.module.scss'
import { useCurrentBreakpointXanova } from 'hooks/use-current-breakpoint-xanova'
import { StepsLayoutXanova } from 'xanova/components/steps-layout'
import { SuccessContentXanova } from 'xanova/components/success-content/success-content'
import { SecurityTimerModalXanova } from 'xanova/modal/security-timer-modal-xanova'

const STEPS_LAYOUT = [
  { label: '2FA Code', value: STEPS.MFA_VERIFY },
  { label: 'Email Code', value: STEPS.CONFIRM_EMAIL },
]

type Inputs = {
  amount: string
  network: string
  address: string
  iban: string
  beneficiaryName: string
}

export function RequestPayoutForm() {
  const navigate = useNavigate()

  const { isDesktopXanova } = useCurrentBreakpointXanova()

  const activeStep = useUnit($stepControllerNextStep)
  const assetsListData = useUnit($assetsListData)
  const twoFaStatus = useUnit($twoFaStatus)
  const stepUpBlockExpiration = useUnit($stepUpBlockExpiration)
  const membershipStatus = useUnit($membershipStatus)

  const requestPayoutForm = useUnit($requestPayoutForm)

  const { amount, assetId, network, walletAddress, iban, beneficiaryName } = requestPayoutForm
  const isDataCryptoReady = !!amount && !!assetId && !!network && !!walletAddress
  const isDataFiatReady = !!iban && !!beneficiaryName && !!amount

  const initialMethod = requestPayoutForm.method || REQUEST_PAYOUT_METHOD_TABS.CRYPTO
  const initialAssetId =
    requestPayoutForm.assetId ||
    REQUEST_PAYOUT_METHODS.find(option => option.method === initialMethod)?.assetId ||
    DEFAULT_PAYOUT_METHOD_OPTION?.assetId ||
    ''

  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>()
  const [isLoading, setIsLoading] = useState(() => {
    return isDataCryptoReady || isDataFiatReady
  })
  const [summaryInfo, setSummaryInfo] = useState<WithdrawalOffer | null>(null)
  const [offerFiat, setOfferFiat] = useState<WithdrawalOfferFiat | null>(null)
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(requestPayoutForm.network || null)
  const [selectedMethod, setSelectedMethod] = useState<RequestPayoutFormValues['method']>(initialMethod)
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId)
  const [isSuccessful, setIsSuccessful] = useState(false)

  const selectedAsset = useMemo(
    () => assetsListData.find(asset => asset.assetId === selectedAssetId) ?? null,
    [assetsListData, selectedAssetId]
  )

  useEffect(() => {
    const option = REQUEST_PAYOUT_METHODS.find(item => item.assetId === selectedAssetId)
    if (option && option.method !== selectedMethod) {
      setSelectedMethod(option.method)
    }
  }, [selectedAssetId, selectedMethod])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    getValues,
  } = useForm<Inputs>({
    defaultValues: {
      amount: requestPayoutForm?.amount || '',
      network: requestPayoutForm?.network || '',
      address: requestPayoutForm?.walletAddress || '',
      iban: requestPayoutForm?.iban || '',
      beneficiaryName: requestPayoutForm?.beneficiaryName || '',
    },
  })

  const availableNetworks = useMemo(
    () =>
      selectedAsset?.networksInfo
        .filter(networkInfo => networkInfo.withdrawalAvailable)
        .map(networkInfo => networkInfo.networkId),
    [selectedAsset]
  )

  useEffect(() => {
    if (!availableNetworks || availableNetworks.length === 0) {
      setSelectedNetworkId(null)
      return
    }

    if (!selectedNetworkId || !availableNetworks.includes(selectedNetworkId)) {
      setSelectedNetworkId(availableNetworks[0])
    }
  }, [availableNetworks, selectedNetworkId])

  const minimumWithdrawalAmount = useMemo(
    () =>
      selectedAsset?.networksInfo.find(
        networkInfo => networkInfo.withdrawalAvailable && networkInfo.networkId === selectedNetworkId
      )?.minimumWithdrawalAmount,
    [selectedAsset, selectedNetworkId]
  )

  const isCryptoMethod = selectedMethod === REQUEST_PAYOUT_METHOD_TABS.CRYPTO
  const isFiatMethod = selectedMethod === REQUEST_PAYOUT_METHOD_TABS.BANK
  const isDesktopCryptoLoading = isLoading && isDesktopXanova && isCryptoMethod
  const isDesktopBankLoading = isLoading && isDesktopXanova && isFiatMethod

  const onSubmitCrypto = async () => {
    if (!twoFaStatus) {
      handleError({ message: 'TWO_FA_OFF' })
      return
    }

    if (!isCryptoMethod || !selectedAssetId || !selectedNetworkId) {
      return
    }

    const stepUpBlockInfo = stepUpBlockExpiration?.expiresAt || (await stepUpBlockExpirationFx()).expiresAt

    if (stepUpBlockInfo) {
      Modal.open(<SecurityTimerModalXanova />, { variant: 'center' })
      return
    }

    const inputData = getValues()

    setIsLoading(true)

    try {
      const isValidAddress = await validateAddress(inputData.address, selectedNetworkId || '')

      if (!isValidAddress) {
        setError('address', { type: 'validate', message: 'Invalid' })
        return
      }

      const prepareData = {
        assetId: selectedAssetId,
        networkId: selectedNetworkId,
        amount: inputData.amount,
        destinationAddress: inputData.address,
        destinationTag: '',
      }

      await XanovaServices.requestCashout({
        assetId: selectedAssetId,
        amount: inputData.amount,
      })

      const withdrawalInfo = await AssetsServices.withdrawalInfoRequest(prepareData)

      setSummaryInfo(withdrawalInfo)
      requestPayoutFormResetEv()

      const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.WITHDRAWAL)
      stepUpRes && setResponse(stepUpRes)
    } catch (error: any) {
      handleError(error)
      isDesktopXanova && navigate(pages.PAYOUTS.path)
      console.log('ERROR-getWithdrawalInfo', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitBank = async () => {
    if (!isFiatMethod) {
      return
    }

    if (!twoFaStatus) {
      handleError({ message: 'TWO_FA_OFF' })
      return
    }

    const stepUpBlockInfo = stepUpBlockExpiration?.expiresAt || (await stepUpBlockExpirationFx()).expiresAt

    if (stepUpBlockInfo) {
      Modal.open(<SecurityTimerModalXanova />, { variant: 'center' })
      return
    }

    const data = getValues()

    try {
      const requestCashoutData = {
        assetId: FIAT_ASSET_ID,
        amount: data.amount,
      }

      const offerData = {
        assetId: FIAT_ASSET_ID,
        iban: data.iban,
        amount: data.amount,
        fee: '',
        name: data.beneficiaryName,
      }

      /* кешоут  */
      await XanovaServices.requestCashout(requestCashoutData)

      /* офер */
      const offerResponse = await XanovaFiatServices.getWithdrawalOffer(offerData)

      setOfferFiat(offerResponse)
      const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.WITHDRAWAL)
      stepUpRes && setResponse(stepUpRes)
    } catch (error: any) {
      handleError(error)
      isDesktopXanova && navigate(pages.PAYOUTS.path)
      console.log('ERROR-getWithdrawalOffer', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = () => {
    if (isCryptoMethod) {
      onSubmitCrypto()
    }

    if (isFiatMethod) {
      onSubmitBank()
    }
  }

  useEffect(() => {
    if (isDesktopXanova && isDataCryptoReady && selectedMethod === REQUEST_PAYOUT_METHOD_TABS.CRYPTO) {
      requestPayoutFormResetEv()
      onSubmitCrypto()
      return
    }

    if (isDesktopXanova && isDataFiatReady && selectedMethod === REQUEST_PAYOUT_METHOD_TABS.BANK) {
      requestPayoutFormResetEv()
      onSubmitBank()
      return
    }
  }, [isDesktopXanova])

  const handleFinalActionCrypto = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    if (!summaryInfo) return

    try {
      setIsLoading(true)
      const data = {
        assetId: summaryInfo?.assetId || selectedAssetId,
        networkId: summaryInfo?.networkId || '',
        amount: summaryInfo?.amount || '',
        fee: summaryInfo?.fee || '',
        destinationAddress: summaryInfo?.destinationAddress || '',
        destinationTag: summaryInfo?.destinationTag || '',
        addToWhitelist: summaryInfo?.addToWhitelist || false,
      }
      if ((responseData as StepUpAuthResponse).oneTimeAccessToken) {
        await AssetsServices.withdrawalAsset(data, (responseData as StepUpAuthResponse).oneTimeAccessToken)
        await initApp()
        setIsLoading(false)
        setIsSuccessful(true)
      }
    } catch (error: any) {
      handleError(error)
      console.log('lastStepWithdrawal-ERROR', error)
      setResponse(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalActionFiat = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    if (!offerFiat) return
    const dataInput = getValues()

    try {
      setIsLoading(true)
      const data = {
        assetId: FIAT_ASSET_ID,
        iban: offerFiat.iban,
        amount: offerFiat.amount,
        fee: offerFiat.fee,
        name: dataInput.beneficiaryName,
      }
      if ((responseData as StepUpAuthResponse).oneTimeAccessToken) {
        /* вывод */
        await XanovaFiatServices.createWithdrawalRequest(data, (responseData as StepUpAuthResponse).oneTimeAccessToken)

        await initApp()
        setIsLoading(false)
        setIsSuccessful(true)
      }
    } catch (error: any) {
      handleError(error)
      console.log('createWithdrawalRequest-ERROR', error)
      setResponse(null)
    } finally {
      setIsLoading(false)
    }
  }
  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    if (isCryptoMethod) {
      handleFinalActionCrypto(responseData)
    }
    if (isFiatMethod) {
      handleFinalActionFiat(responseData)
    }
  }

  const handleBack = () => {
    if (isDesktopXanova) {
      navigate(pages.PAYOUTS.path)
      setResponse(null)
    } else {
      setResponse(null)
    }
  }

  const itemComponent = (value: string) => {
    if (!value) return <div className={styles.networkPlaceholder}>Please select</div>

    return <div className={styles.networkActive}>{value}</div>
  }

  const renderLoadingLayout = (steps: typeof STEPS_LAYOUT, layoutStep: string) => (
    <StepsLayoutXanova steps={steps} activeStep={layoutStep}>
      <div className={styles.stepControllerWrap}>
        <Spinner />
      </div>
    </StepsLayoutXanova>
  )

  const renderSuccessLayout = (steps: typeof STEPS_LAYOUT) => (
    <StepsLayoutXanova steps={steps} activeStep={'success'}>
      <SuccessContentXanova
        title={'Money on the Way!'}
        btnText={'Return to Payouts'}
        action={() => {
          navigate(pages.PAYOUTS.path)
        }}
        subTitle={
          // eslint-disable-next-line max-len
          'We’ve started processing your transfer. You’ll receive your funds soon—check your payout history for updates.'
        }
      />
    </StepsLayoutXanova>
  )

  const renderForm = () => (
    <form className={styles.containerForm} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.titleForm}>Request Payout</h2>

      <div className='input-wrap-xanova'>
        <label htmlFor='amount' className={errors.amount ? 'text-error' : ''}>
          {errors.amount ? '' : 'Amount'} {errors.amount?.message}
        </label>
        <input
          id='amount'
          type='text'
          className={clsx(errors.amount && 'error')}
          placeholder='Type here..'
          inputMode='decimal'
          {...register('amount', {
            required: 'Required',
            min: {
              value: minimumWithdrawalAmount || 0,
              message: `minimum amount is ${+(minimumWithdrawalAmount || 0)}`,
            },
            max: {
              value: +(membershipStatus.availableCommissions || Infinity),
              message: 'Insufficient balance',
            },
            validate: value => (!!value && Number(value) > 0 ? true : 'Invalid amount'),
            onChange: event => {
              const value = event.target.value
              setValue('amount', value.replace(',', '.'), { shouldValidate: true })
            },
          })}
        />
        <span className='currency'>$</span>
      </div>

      <div>
        <p className={styles.methodLabel}>Method</p>
        <div className={styles.radioGroup} role='radiogroup' aria-label='Payout method'>
          {REQUEST_PAYOUT_METHODS.map(method => (
            <label key={method.assetId} className='radio-wrap-xanova' htmlFor={`payout-${method.assetId}`}>
              <input
                id={`payout-${method.assetId}`}
                type='radio'
                value={method.assetId}
                checked={selectedAssetId === method.assetId}
                onChange={() => {
                  setSelectedAssetId(method.assetId)
                  setSelectedMethod(method.method)
                  if (method.method !== REQUEST_PAYOUT_METHOD_TABS.CRYPTO) {
                    setSelectedNetworkId(null)
                  }
                }}
                disabled={method.disabled}
              />
              <span className='radio-xanova-box' />
              <span className='radio-xanova-text'>{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {isCryptoMethod && (
        <>
          <div style={{ position: 'relative' }}>
            <p className={clsx(styles.networkLabel, errors.network ? styles.networkLabelError : '')}>
              Network {errors.network?.message}
            </p>
            <CommonDropdown
              data={availableNetworks || []}
              selectedData={selectedNetworkId}
              itemComponent={itemComponent}
              setSelectedData={option => {
                setSelectedNetworkId(option)
              }}
            />
          </div>

          <div className='input-wrap-xanova'>
            <label htmlFor='address' className={errors.address ? 'text-error' : ''}>
              Wallet Address {errors.address?.message}
            </label>
            <input
              id='address'
              type='text'
              className={clsx(errors.address && 'error')}
              placeholder='Type here..'
              {...register('address', {
                required: 'Required',
                setValueAs: value => (typeof value === 'string' ? value.trim() : value),
              })}
            />
          </div>
        </>
      )}

      {isFiatMethod && (
        <>
          <div className='input-wrap-xanova'>
            <label htmlFor='iban' className={errors.iban ? 'text-error' : ''}>
              IBAN {errors.iban?.message}
            </label>
            <input
              id='iban'
              type='text'
              className={clsx(errors.iban && 'error')}
              placeholder='Type here..'
              {...register('iban', {
                required: 'Required',
                setValueAs: value => (typeof value === 'string' ? value.trim() : value),
              })}
            />
          </div>

          <div className='input-wrap-xanova'>
            <label htmlFor='beneficiaryName' className={errors.beneficiaryName ? 'text-error' : ''}>
              Beneficiary Name {errors.beneficiaryName?.message}
            </label>
            <input
              id='beneficiaryName'
              type='text'
              className={clsx(errors.beneficiaryName && 'error')}
              placeholder='Type here..'
              {...register('beneficiaryName', {
                required: 'Required',
                setValueAs: value => (typeof value === 'string' ? value.trim() : value),
              })}
            />
          </div>
        </>
      )}

      <button type='submit' className={clsx('btn-xanova gold', styles.button)} disabled={isLoading}>
        {isLoading ? <span className='spinner-border black' /> : 'Request'}
      </button>
    </form>
  )

  if (isDesktopCryptoLoading || isDesktopBankLoading) {
    return renderLoadingLayout(STEPS_LAYOUT, activeStep)
  }

  if ((isSuccessful && isCryptoMethod) || (isSuccessful && isFiatMethod)) {
    return renderSuccessLayout(STEPS_LAYOUT)
  }

  if (response) {
    return (
      <StepsLayoutXanova steps={STEPS_LAYOUT} activeStep={activeStep}>
        <div className={styles.stepControllerWrap}>
          <h2 className={clsx(styles.titleForm, styles.alignTextCenter)}>Withdrawal</h2>
          <StepControllerComponent
            nextStepResponse={response}
            finalAction={handleFinalAction}
            dataProps={{
              resetStepUp: handleBack,
            }}
          />
        </div>
      </StepsLayoutXanova>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>{renderForm()}</div>
    </div>
  )
}
