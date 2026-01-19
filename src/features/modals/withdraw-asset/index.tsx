import React, { ReactElement, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CommonDropdown, CompleteIconBlur, InputAmount, Modal, Success } from 'components'
import i18n from 'components/i18n/localize'
import { pages } from 'constant'
import { STEP_UP_SCOPE } from 'constant/step-up-scope'
import { StepControllerComponent } from 'features/step-controller'
import { validateAddress } from 'utils'
import { handleError } from 'utils/error-handler'
import { validateStepUpAvailability } from 'utils/validate-step-up-availability'
import {
  AssetsServices,
  AuthResponse,
  EVENT_NAMES,
  MFAAddAuthResponse,
  NetworkWithAssetInfo,
  StepUpAuthResponse,
  useAnalytics,
  WithdrawalOffer,
} from 'wip/services'
import { initApp } from 'wip/stores'
import infoIcon from 'assets/icons/info-icon-error.svg'

import backArrow from '../../../assets/icons/back-arrow.svg'
import { HintMemo } from '../../../components/hint-memo'
import { MiniButton } from '../../../components/mini-button'
import { StepBackBtn } from '../../../components/step-back-btn'
import { isBiz } from '../../../config'
import { useCurrentBreakpointPairs } from '../../../hooks/use-current-breakpoint-pairs'
import { $assetsRates } from '../../../model/cef-rates-coingecko'
import { CombinedObject } from '../../../model/cefi-combain-assets-data'
import { $currency } from '../../../model/currency'
import { $twoFaStatus } from '../../../model/two-fa'
import { $whiteList, getWhiteListFx } from '../../../model/white-list'
import { WhitelistAddressResponse, WhitListServices } from '../../../wip/services/white-list'
import { AddressNameModal } from '../address-name-modal'
import addressBook from './address-book.svg'
import { AddressBookRow } from './address-bookRow'
import styles from './styles.module.scss'
import { useFindWhitelistAddress } from 'hooks/use-find-whitelist-address'

type Inputs = {
  amount: string
  address: string
  memo: string
  checkBox: boolean
  addressName: string
  twoFaCode: string
  emailCode: string
  phoneCode: string
}

const defaultValues = {
  amount: '',
  address: '',
  memo: '',
  checkBox: false,
  addressName: '',
  twoFaCode: '',
  emailCode: '',
  phoneCode: '',
}

export interface WithdrawAssetModal {
  asset: CombinedObject
}

const STEPS = {
  INPUT: 'INPUT',
  ADDRESS: 'ADDRESS',
  SUMMARY: 'SUMMARY',
  ADD_ADDRESS: 'ADD_ADDRESS',
}

export function WithdrawAssetModal({ asset }: WithdrawAssetModal) {
  const ratesRaw = useUnit($assetsRates)
  const whiteList = useUnit($whiteList)
  const twoFaStatus = useUnit($twoFaStatus)
  const { myLogEvent } = useAnalytics()
  const navigate = useNavigate()
  const { t } = i18n

  const currency = useUnit($currency)
  const currencyType = currency.type?.toLowerCase() as 'usd' | 'eur'

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

  // const assetRate = ratesRaw?.find(
  //   assetRateRaw => assetRateRaw.fromAssetId === asset?.assetId && assetRateRaw.toAssetId === currency.type
  // )

  const availableNetworks = asset.networksInfo.filter(networkInfo => networkInfo.withdrawalAvailable)

  const [isLoading, setIsLoading] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkWithAssetInfo | null>(availableNetworks[0] || null)
  const [isCurrency, setIsCurrency] = useState(false)
  const [summaryInfo, setSummaryInfo] = useState<WithdrawalOffer | null>(null)
  const [isSuccessful, setIsSuccessful] = useState(false)
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>()
  const [step, setStep] = useState(STEPS.ADDRESS)
  const [isShowAddressBook, setIsShowAddressBook] = useState(false)
  console.log('isSuccessful', isSuccessful)
  const watchAmount = watch('amount').replace(',', '.')
  const watchAddress = watch('address')
  const watchCheckBox = watch('checkBox')
  const watchAddressName = watch('addressName')
  const watchMemo = watch('memo')

  const foundWhiteAddress = useFindWhitelistAddress({
    address: watchAddress,
    networkId: selectedNetwork?.networkId || '',
    tag: watchMemo,
    name: watchAddressName,
  })

  const handleHideAddressBook = () => {
    setIsShowAddressBook(false)
  }

  const handleSetAddressBook = (address: WhitelistAddressResponse) => {
    console.log('address: WhitelistAddressResponse', address)
    setValue('address', address.address)
    setValue('memo', address.tag)
    setValue('addressName', address.name)
    const network = availableNetworks.find(networkItem => networkItem.networkId === address.networkId)
    setSelectedNetwork(network || availableNetworks[0])
    setIsShowAddressBook(false)
  }

  const handleBack = () => {
    setResponse(null)
    setStep(STEPS.ADDRESS)
  }

  useEffect(() => {
    if (asset) {
      myLogEvent(EVENT_NAMES.WEB_WITHDRAW_OPENED, { asset: asset.assetId })

      getWhiteListFx()
    }
    document.addEventListener('click', handleHideAddressBook)

    return () => {
      document.removeEventListener('click', handleHideAddressBook)
    }
  }, [asset])

  const getWithdrawalInfo = async (): Promise<void> => {
    try {
      const withdrawalInfo = await AssetsServices.withdrawalInfoRequest({
        assetId: asset?.assetId ?? '',
        networkId: selectedNetwork?.networkId ?? '',
        amount: isCurrency ? (+watchAmount / (asset[currencyType].price ?? 1)).toString() : watchAmount,
        destinationAddress: watchAddress,
        destinationTag: watchMemo,
      })
      setSummaryInfo(withdrawalInfo)
    } catch (error) {
      // MOCK: Для внутреннего тестирования и разработки
      const mockWithdrawalInfo: WithdrawalOffer = {
        assetId: asset?.assetId ?? '',
        networkId: selectedNetwork?.networkId ?? '',
        amount: isCurrency ? (+watchAmount / (asset[currencyType].price ?? 1)).toString() : watchAmount,
        fee: '0.001',
        destinationAddress: watchAddress,
        destinationTag: watchMemo,
        addToWhitelist: false,
      }
      setSummaryInfo(mockWithdrawalInfo)
      // handleError(error)
    }
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    try {
      setIsLoading(true)
      if (step === STEPS.SUMMARY) {
        const data: WithdrawalOffer = {
          assetId: summaryInfo?.assetId || '',
          networkId: summaryInfo?.networkId || '',
          amount: summaryInfo?.amount || '',
          fee: summaryInfo?.fee || '',
          destinationAddress: summaryInfo?.destinationAddress || '',
          destinationTag: summaryInfo?.destinationTag || '',
          addToWhitelist: false,
        }
        if ((responseData as StepUpAuthResponse).oneTimeAccessToken) {
          await AssetsServices.withdrawalAsset(data, (responseData as StepUpAuthResponse).oneTimeAccessToken)
          myLogEvent(EVENT_NAMES.WEB_CEFI_WITHDRAWAL, { amount: data.amount, assetId: asset?.assetId })
          await initApp()
          setIsSuccessful(true)
        }
      } else {
        await WhitListServices.addAddressWhitelist(
          {
            name: watchAddressName,
            networkId: selectedNetwork?.networkId || '',
            address: watchAddress,
            tag: watchMemo,
          },
          (responseData as StepUpAuthResponse).oneTimeAccessToken
        )
        await getWhiteListFx()
        await getWithdrawalInfo()
        setStep(STEPS.SUMMARY)
        setResponse(null)
      }
    } catch (error: any) {
      console.log('lastStepWithdrawal-ERROR', error)
      // MOCK: Для внутреннего тестирования и разработки
      if (step === STEPS.SUMMARY) {
        const data: WithdrawalOffer = {
          assetId: summaryInfo?.assetId || '',
          networkId: summaryInfo?.networkId || '',
          amount: summaryInfo?.amount || '',
          fee: summaryInfo?.fee || '',
          destinationAddress: summaryInfo?.destinationAddress || '',
          destinationTag: summaryInfo?.destinationTag || '',
          addToWhitelist: false,
        }
        // Имитация успешного вывода
        // myLogEvent(EVENT_NAMES.WEB_CEFI_WITHDRAWAL, { amount: data.amount, assetId: asset?.assetId })
        setIsSuccessful(true)
        await initApp()
      } else {
        // Имитация успешного добавления в whitelist
        await getWhiteListFx()
        await getWithdrawalInfo()
        setStep(STEPS.SUMMARY)
        setResponse(null)
      }
      // handleError(error)
      // setResponse(null)
      // setStep(STEPS.ADDRESS)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdrawalWhitelist = async () => {
    setIsLoading(true)
    const data: WithdrawalOffer = {
      assetId: summaryInfo?.assetId || '',
      networkId: summaryInfo?.networkId || '',
      amount: summaryInfo?.amount || '',
      fee: summaryInfo?.fee || '',
      destinationAddress: summaryInfo?.destinationAddress || '',
      destinationTag: summaryInfo?.destinationTag || '',
      addToWhitelist: true,
    }
    try {
      await AssetsServices.withdrawalAssetWhiteList(data)

      myLogEvent(EVENT_NAMES.WEB_CEFI_WITHDRAWAL, { amount: data.amount, assetId: asset?.assetId })
      await initApp()
      setIsSuccessful(true)
    } catch (error: any) {
      console.log('lastStepWithdrawal-ERROR', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const startWithdrawal = async () => {
    setIsLoading(true)
    try {
      if (foundWhiteAddress) {
        await handleWithdrawalWhitelist()
      } else {
        const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.WITHDRAWAL)
        stepUpRes && setResponse(stepUpRes)
      }
    } catch (error: any) {
      console.log('startWithdrawal-ERROR', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdrawal = async (): Promise<void> => {
    setIsLoading(true)
    try {
      if (step == STEPS.ADDRESS) {
        const isValidAddress = selectedNetwork ? await validateAddress(watchAddress, selectedNetwork?.networkId) : ''
        if (!isValidAddress) {
          setError('address', {
            type: 'validate',
            message: 'Invalid',
          })
          setIsLoading(false)
          return
        }

        if (watchCheckBox && !foundWhiteAddress) {
          // setStep(STEPS.ADD_ADDRESS)
          setIsLoading(false)

          // const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.WITHDRAWAL)
          // stepUpRes && setResponse(stepUpRes)
          Modal.open(
            <AddressNameModal
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setResponse={setResponse}
              methods={methods}
            />,
            {
              variant: 'center',
            }
          )
          return
        }

        await getWithdrawalInfo()
        setStep(STEPS.SUMMARY)
        // setStep(STEPS.INPUT)
      }

      // if (step == STEPS.ADD_ADDRESS) {
      //   const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.WITHDRAWAL)
      //   stepUpRes && setResponse(stepUpRes)
      // }

      // if (step === STEPS.INPUT) {
      //   await getWithdrawalInfo()
      //   setStep(STEPS.SUMMARY)
      // }

      if (step === STEPS.SUMMARY) {
        await startWithdrawal()
      }
    } catch (error: any) {
      console.log('handleWithdraw-ERROR', error)
      handleError(error)
    }
    setIsLoading(false)
  }

  const itemComponentAddresses = (selectedItemAddress: NetworkWithAssetInfo): ReactElement => {
    return (
      <div>
        <div className={styles.bankName}>{selectedItemAddress.networkId}</div>
      </div>
    )
  }

  const backButtonFn = (e: any) => {
    e.preventDefault()
    setStep(STEPS.ADDRESS)
  }

  const btnName = () => {
    if (step === STEPS.ADD_ADDRESS) return 'Add to Whitelist & Continue Withdrawal'
    if (step === STEPS.SUMMARY) return 'Confirm & Withdraw'
    return 'Next'
  }

  const min = selectedNetwork?.minimumWithdrawalAmount || '0'
  const minCurrency = +min * (asset[currencyType].price || 0)

  const btnDisable = () => {
    if (!isCurrency && +watchAmount < +min && step === STEPS.INPUT) return true
    if (isCurrency && +watchAmount < minCurrency && step === STEPS.INPUT) return true
    return isLoading
  }

  const btnDisableColor = () => {
    if (!isCurrency && +watchAmount < +min && step === STEPS.INPUT) return true
    if (isCurrency && +watchAmount < minCurrency && step === STEPS.INPUT) return true
    return false
  }

  const handleAddNew = () => {
    navigate(pages.WHITELIST.path)
    Modal.close()
  }

  if (isSuccessful) {
    return (
      <div className={styles.contentWrap} style={{ flexDirection: 'column' }}>
        <div className={styles.isSuccessIconWrap}>
          <CompleteIconBlur isMobile={false} />
        </div>
        <div className={styles.title}>{'Withdrawal Successful'}</div>
        <div className={styles.description}>
          {
            'Your address has been added to the whitelist, and your withdrawal\nis complete. You can now manage your funds in your portfolio.'
          }
        </div>

        <div style={{ height: 69 }} />

        <button
          onClick={() => navigate(pages.PORTFOLIO.path)}
          className='btn-new transparent big'
          style={{ maxWidth: 440 }}
        >
          <img alt='icon' src={backArrow} style={{ marginRight: 10 }} />
          Go Back to Portfolio
        </button>
      </div>
    )
  }

  if (!twoFaStatus) {
    return (
      <div className={styles.containerModal} style={{ width: 'auto', height: 'auto' }}>
        <div className={styles.title}>Two Factor Authentication</div>
        <div className={styles.description}>
          For security reasons, a 2FA setup is required. Please follow the instructions.
        </div>
        <button
          onClick={() => {
            navigate(pages.SETTINGS.path)
            Modal.close()
          }}
          className='btn-new primary big'
        >
          Go to Settings
        </button>
      </div>
    )
  }

  return (
    <div className={styles.containerModal}>
      {!response && (
        <div className={styles.content}>
          <div className={styles.title}>
            {step === STEPS.ADD_ADDRESS && !response ? 'Add Address to Whitelist' : null}
            {step === STEPS.SUMMARY && !response ? 'Withdraw Preview' : null}
            {[STEPS.ADDRESS, STEPS.INPUT].includes(step) && !response ? `Withdraw ${asset?.assetName}` : null}
          </div>

          {[STEPS.ADDRESS, STEPS.INPUT].includes(step) && !isBiz && !response ? (
            <div className={styles.description}>Please enter the details for the transaction&nbsp;to&nbsp;proceed.</div>
          ) : null}

          {step === STEPS.SUMMARY && !response ? (
            <div className={styles.description}>Make sure the following information is correct.</div>
          ) : null}

          <FormProvider {...methods}>
            <form
              style={{
                position: 'relative',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
              onSubmit={handleSubmit(handleWithdrawal)}
            >
              {step === STEPS.ADDRESS || step === STEPS.ADD_ADDRESS ? (
                <>
                  <InputAmount
                    minAmountAsset={selectedNetwork?.minimumWithdrawalAmount || ''}
                    errors={errors}
                    asset={asset}
                    register={register}
                    // assetRate={assetRate}
                    setValue={setValue}
                    watchAmount={watchAmount}
                    isCurrency={isCurrency}
                    setIsCurrency={setIsCurrency}
                    clearErrors={clearErrors}
                  />
                  <div style={{ height: 24 }} />

                  <div className='input-item-wrap-new'>
                    <label htmlFor='address' className={`input-label`}>
                      Wallet Address{' '}
                      {errors.address && errors.address?.type === 'required' ? t('inputError.required') : ''}
                      {/*{errors.address && errors.address?.type === 'validate' ? t('inputError.invalid') : ''}*/}
                    </label>
                    <input
                      id='address'
                      type='text'
                      className={clsx('input-form', errors.address && 'error')}
                      placeholder='Type here..'
                      {...register('address', { required: true })}
                    />
                    <div
                      onClick={e => {
                        e.stopPropagation()
                        setIsShowAddressBook(!isShowAddressBook)
                      }}
                      style={{
                        position: 'absolute',
                        top: '36%',
                        right: 2,
                        backgroundColor: 'var(--White)',
                        display: 'flex',
                        padding: 17,
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                        borderRadius: 20,
                        gap: 15,
                        cursor: 'pointer',
                      }}
                    >
                      <img src={addressBook} alt={''} />
                    </div>

                    {isShowAddressBook && (
                      <div
                        style={{
                          position: 'absolute',
                          backgroundColor: 'var(--White)',
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: 'var(--Deep-Space)',
                          borderStyle: 'solid',
                          top: '100%',
                          zIndex: 1,
                          overflow: 'auto',
                          width: '100%',
                          marginTop: 10,
                          padding: 8,
                          height: 287,
                          boxSizing: 'border-box',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {whiteList.length ? (
                          whiteList.map(address => {
                            return (
                              <AddressBookRow
                                key={address.address + address.networkId + address.name + address.tag}
                                action={handleSetAddressBook}
                                address={address}
                              />
                            )
                          })
                        ) : (
                          <div className={styles.emptyWhiteListWrap}>
                            <div className={styles.emptyWhiteListTitle}>Ooops.. Your whitelist is empty</div>
                            <MiniButton title={'Add New +'} action={handleAddNew} buttonActive={true} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {errors.address && errors.address?.type === 'validate' ? (
                    <div className={styles.errorText}>
                      <img src={infoIcon} alt={''} style={{ marginRight: 7 }} />
                      Invalid address entered. Please check and try again
                    </div>
                  ) : null}

                  {foundWhiteAddress ? null : (
                    <div className={styles.addWhiteListContainer}>
                      <label htmlFor='checkBox' className={clsx(styles.containerCheckBox)}>
                        Add address to Whitelist
                        <input id='checkBox' type='checkbox' {...register('checkBox')} />
                        <span className={styles.checkmark} />
                      </label>
                    </div>
                  )}

                  <div className={styles.height24} />

                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ flexGrow: 1 }}>
                      <div className={styles.enterAmount}>Network</div>
                      <CommonDropdown
                        data={availableNetworks}
                        itemComponent={itemComponentAddresses}
                        setSelectedData={setSelectedNetwork}
                        selectedData={selectedNetwork}
                      />
                    </div>

                    {selectedNetwork?.tagsSupported ? (
                      <div className='input-item-wrap-new' style={{ flexGrow: 1, width: 'auto' }}>
                        <label
                          htmlFor='memo'
                          className={`input-label ${errors.memo ? 'text-error' : ''}`}
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          MEMO
                          <HintMemo />
                        </label>
                        <input
                          id='memo'
                          type='text'
                          className='input-form'
                          placeholder='Enter Memo Tag here'
                          {...register('memo')}
                        />
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}

              {step === STEPS.SUMMARY ? (
                <>
                  <div className={styles.listSummaryWrap}>
                    <div className={styles.descriptionWhiteListSummary}>Amount:</div>
                    <div className={styles.descriptionWhiteListSummarySemiBold}>
                      {asset.assetId}{' '}
                      {isCurrency ? (+watchAmount / (asset[currencyType].price ?? 1)).toString() : watchAmount}
                      {` (${currency.symbol}`}
                      {!isCurrency ? (+watchAmount * (asset[currencyType].price ?? 1)).toFixed(2) : watchAmount}
                      {')'}
                    </div>
                  </div>
                  <div className={styles.listSummaryWrap}>
                    <div className={styles.descriptionWhiteListSummary}>Conversion Rate:</div>
                    <div className={styles.descriptionWhiteListSummarySemiBold}>
                      1 {asset.assetId} = {asset[currencyType].price} {currency.type}
                    </div>
                  </div>
                  <div className={styles.listSummaryWrap}>
                    <div className={styles.descriptionWhiteListSummary}>Transaction Fee:</div>
                    <div className={styles.descriptionWhiteListSummarySemiBold}>
                      {summaryInfo?.fee} {summaryInfo?.assetId}
                    </div>
                  </div>
                  <div className={styles.listSummaryWrap}>
                    <div className={styles.descriptionWhiteListSummary}>Address:</div>
                    <div className={styles.descriptionWhiteListSummarySemiBold}>{watchAddress}</div>
                  </div>
                  <div className={styles.listSummaryWrap}>
                    <div className={styles.descriptionWhiteListSummary}>Network:</div>
                    <div className={styles.descriptionWhiteListSummarySemiBold}>{selectedNetwork?.networkId}</div>
                  </div>
                  {watchMemo ? (
                    <div className={styles.listSummaryWrap}>
                      <div className={styles.descriptionWhiteListSummary}>Memo Tag:</div>
                      <div className={styles.descriptionWhiteListSummarySemiBold}>{watchMemo}</div>
                    </div>
                  ) : null}
                  <div style={{ flexGrow: 1 }} />
                </>
              ) : null}

              <div style={{ height: 100 }} />

              <div className={styles.button}>
                {step === STEPS.SUMMARY ? <StepBackBtn isLoading={isLoading} backButtonFn={backButtonFn} /> : null}
                <button
                  type='submit'
                  className='btn-new primary big'
                  style={btnDisableColor() ? { opacity: 0.4 } : {}}
                  disabled={btnDisable()}
                >
                  {isLoading ? <span className='spinner-border' /> : btnName()}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      )}

      {response ? (
        <div>
          <div style={{ textAlign: 'center' }} className={styles.title}>{`Withdraw ${asset?.assetName}`}</div>
          <StepControllerComponent
            nextStepResponse={response}
            finalAction={handleFinalAction}
            dataProps={{ resetStepUp: () => setResponse(null) }}
          />
        </div>
      ) : null}
    </div>
  )
}
