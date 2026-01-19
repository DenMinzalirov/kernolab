import { ReactElement, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { pages } from 'constant'
import { getNetworkIcon } from 'utils/get-network-icon'
import { $stepUpBlockExpiration } from 'model/step-up-block-expiration'
import { $twoFaStatus } from 'model/two-fa'

import addressBookWhitelistBiz from '../../../assets/icons/address-book-whitelist-biz.svg'
import { Modal } from '../../../components'
import { BackButtonBiz } from '../../../components/back-button-biz'
import { CommonDropdownBiz } from '../../../components/common-dropdown-biz'
import { DropdownCheckbox } from '../../../components/dropdown-checkbox'
import { SuccessfullyBiz } from '../../../components/successfully-biz'
import { STEP_UP_SCOPE } from '../../../constant/step-up-scope'
import { StepControllerComponent } from '../../../features/step-controller'
import { WhitelistAddAddress } from '../../../features/whitelist/whitelist-add-address'
import useDebounce from '../../../hooks/use-debounce'
import { $assetsListData, CombinedObject } from '../../../model/cefi-combain-assets-data'
import { $currency } from '../../../model/currency'
import { $whiteList, getWhiteListFx } from '../../../model/white-list'
import { validateAddress } from '../../../utils'
import { addCommasToDisplayValue } from '../../../utils/add-commas-to-display-value'
import { validateStepUpAvailability } from '../../../utils/validate-step-up-availability'
import {
  AssetsServices,
  AuthResponse,
  MFAAddAuthResponse,
  StepUpAuthResponse,
  WithdrawalOffer,
} from '../../../wip/services'
import { WhitelistAddressResponse } from '../../../wip/services/white-list'
import { initApp } from '../../../wip/stores'
import { ACCOUNT_PAGES } from '../account-settings'
import { AddAddressWhitelistBiz } from '../modals-biz/add-address-whitelist-biz'
import { CONFIRMATION_MODAL_OPTIONS, ConfirmationModalBiz } from '../modals-biz/confirmation-modal-biz'
import { SecurityTimerModalBiz } from '../modals-biz/security-timer-modal-biz'
import { AddressBookRowBiz } from './address-book-row-biz'
import styles from './styles.module.scss'
import { ErrorViewBiz } from 'biz/step-controller-biz/error-view-biz'
import { useFindWhitelistAddress } from 'hooks/use-find-whitelist-address'

type Inputs = {
  amountSend: string
  amountReceive: string
  address: string
  memo: string
  checkBox: boolean
  addressName: string
  twoFaCode: string
  emailCode: string
  phoneCode: string
}

const defaultValues = {
  amountSend: '',
  amountReceive: '',
  address: '',
  memo: '',
  checkBox: false,
  addressName: '',
  twoFaCode: '',
  emailCode: '',
  phoneCode: '',
}

const STEPS = {
  ADDRESS: 'ADDRESS',
  INPUT: 'INPUT',
  SUMMARY: 'SUMMARY',
}

export function SendCryptoBiz() {
  const navigate = useNavigate()

  const assets = useUnit($assetsListData)
  const whiteList = useUnit($whiteList)
  const currency = useUnit($currency)
  const securityTimerData = useUnit($stepUpBlockExpiration)
  const twoFaStatus = useUnit($twoFaStatus)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'

  const location = useLocation()

  const sendListAssets = assets.filter(item => item.networksInfo.some(network => network.withdrawalAvailable))

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

  const watchAmountSend = watch('amountSend').replace(',', '.')
  const watchAddress = watch('address')
  const watchMemo = watch('memo')

  const [isLoading, setIsLoading] = useState(false)
  const [isShowAddressBook, setIsShowAddressBook] = useState(false)
  const [isAddWhitelist, setIsAddWhitelist] = useState(false)
  const [step, setStep] = useState(STEPS.ADDRESS)
  const [summaryInfo, setSummaryInfo] = useState<WithdrawalOffer | null>(null)
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>()
  const [isSuccessful, setIsSuccessful] = useState(false)

  const [selectedAsset, setSelectedAsset] = useState<CombinedObject | null>(location.state?.asset || null)
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null)

  const foundWhiteAddress = useFindWhitelistAddress({
    address: watchAddress,
    networkId: selectedNetworkId || '',
    tag: watchMemo,
    name: watch('addressName'),
  })

  const availableNetworks = selectedAsset?.networksInfo
    .filter(networkInfo => networkInfo.withdrawalAvailable)
    .map(networkInfo => networkInfo.networkId)

  const minimumWithdrawalAmount = selectedAsset?.networksInfo.find(
    networkInfo => networkInfo.withdrawalAvailable && networkInfo.networkId === selectedNetworkId
  )?.minimumWithdrawalAmount

  const handleHideAddressBook = () => {
    setIsShowAddressBook(false)
  }

  useEffect(() => {
    !whiteList.length && getWhiteListFx()

    if (selectedAsset && availableNetworks?.length) {
      setSelectedNetworkId(availableNetworks[0])
    }

    document.addEventListener('click', handleHideAddressBook)

    return () => {
      document.removeEventListener('click', handleHideAddressBook)
    }
  }, [selectedAsset])

  useEffect(() => {
    if (securityTimerData?.expiresAt) {
      const customClose = () => {
        if (window.history.length > 1) {
          navigate(-1)
        } else {
          navigate(pages.Base.path)
        }
        Modal.close()
      }

      Modal.open(<SecurityTimerModalBiz customClose={customClose} />, {
        variant: 'center',
        customCloseModal: customClose,
      })
    }
  }, [securityTimerData])

  const handleSetAddressBook = (address: WhitelistAddressResponse) => {
    setValue('address', address.address)
    setValue('memo', address.tag)
    const networkId = availableNetworks?.find(netId => netId === address.networkId)
    setSelectedNetworkId(networkId || null)
    setIsShowAddressBook(false)
  }

  const handleBack = () => {
    if (step === STEPS.INPUT) {
      setStep(STEPS.ADDRESS)
      return
    }
    if (step === STEPS.SUMMARY) {
      setStep(STEPS.INPUT)
      return
    }

    setStep(STEPS.ADDRESS)
  }

  const getWithdrawalInfo = async (valueAmountSend: string): Promise<WithdrawalOffer | undefined> => {
    try {
      const withdrawalInfo = await AssetsServices.withdrawalInfoRequest({
        assetId: selectedAsset?.assetId ?? '',
        networkId: selectedNetworkId ?? '',
        amount: valueAmountSend,
        destinationAddress: watchAddress,
        destinationTag: watchMemo,
      })
      setSummaryInfo(withdrawalInfo)
      return withdrawalInfo
    } catch (error: any) {
      // TODO: need handle total ERROR
      console.log('ERROR-getWithdrawalInfo', error)
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

      await initApp()
      setIsSuccessful(true)
    } catch (error: any) {
      // TODO: need handle total ERROR
      console.log('lastStepWithdrawal-ERROR', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startWithdrawal = async () => {
    if (!twoFaStatus) {
      Modal.open(
        <ConfirmationModalBiz
          options={CONFIRMATION_MODAL_OPTIONS.enable2FAPrompt}
          action={() => {
            navigate(pages.ACCOUNT_SETTINGS.path, { state: { currentPage: ACCOUNT_PAGES.SECURITY } })
            Modal.close()
          }}
        />,
        { variant: 'center' }
      )

      return
    }

    setIsLoading(true)
    try {
      if (foundWhiteAddress) {
        await handleWithdrawalWhitelist()
      } else {
        const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.WITHDRAWAL)
        stepUpRes && setResponse(stepUpRes)
      }
    } catch (error: any) {
      // TODO: need handle total ERROR
      console.log('startWithdrawal-ERROR', error)
    } finally {
      setIsLoading(false)
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

          await initApp()
          setIsSuccessful(true)
        }
      }
    } catch (error: any) {
      console.log('lastStepWithdrawal-ERROR', error)
      // TODO: need handle total ERROR
      setResponse(null)
      setStep(STEPS.ADDRESS)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    Modal.open(<WhitelistAddAddress />, {
      variant: 'center',
      isFullScreen: true,
    })
  }

  const handleWithdrawal = async () => {
    setIsLoading(true)
    try {
      if (step === STEPS.ADDRESS) {
        const isValidAddress = selectedNetworkId ? await validateAddress(watchAddress, selectedNetworkId) : ''
        if (!isValidAddress) {
          setError('address', {
            type: 'validate',
            message: 'Invalid',
          })
          setIsLoading(false)
          return
        }

        if (isAddWhitelist && selectedAsset && selectedNetworkId) {
          Modal.open(
            <AddAddressWhitelistBiz
              addressData={{
                asset: selectedAsset,
                address: watchAddress,
                networkId: selectedNetworkId,
                memo: watchMemo,
                setIsShowAddressBook: setIsShowAddressBook,
                setIsAddWhitelist: setIsAddWhitelist,
              }}
            />,
            {
              variant: 'center',
            }
          )
          setIsLoading(false)
          return
        }
        setStep(STEPS.INPUT)
      }

      if (step === STEPS.INPUT) {
        setStep(STEPS.SUMMARY)
      }

      if (step === STEPS.SUMMARY) {
        await startWithdrawal()
      }
    } catch (error) {
      console.log('ERROR-handleWithdrawal', error)
    }
    setIsLoading(false)
  }

  const handleCheckAddWhitelist = () => {
    setIsAddWhitelist(!isAddWhitelist)
  }

  const handleDisableBtn = () => {
    if (isLoading) return true
    if (step === STEPS.ADDRESS) {
      return !selectedAsset && !selectedNetworkId
    }
    if (step == STEPS.INPUT && minimumWithdrawalAmount) {
      return +watchAmountSend < +minimumWithdrawalAmount
    }
    return false
  }

  const handleBtnName = () => {
    if (step === STEPS.SUMMARY) {
      return 'Confirm & Send'
    }
    return 'Continue'
  }

  const debouncedChangeSend = useDebounce(async value => {
    const info = await getWithdrawalInfo(value)

    setValue('amountReceive', info ? (+value - Number(info?.fee || 0)).toString() : '')
  }, 500)

  const shortedAddress = (addressItem: string) => {
    if (addressItem.length <= 30) return addressItem
    return `${addressItem.slice(0, 27)}..${addressItem.slice(-3)}`
  }

  const rateAmount = (itemAmount: number) => {
    if (!selectedAsset) return '0'
    return itemAmount * selectedAsset[currencyType].price
  }

  const itemComponentNetwork = (selectedItemNetworkId: string): ReactElement => {
    if (!selectedItemNetworkId) return <div />

    const networkIcon = getNetworkIcon(selectedItemNetworkId)

    return (
      <div
        onClick={() => {
          if (isLoading) return
          setSelectedNetworkId(selectedItemNetworkId)
        }}
        className={styles.itemWrap}
      >
        <img style={{ height: 25, width: 25, borderRadius: 5 }} src={networkIcon} alt='' />
        {selectedItemNetworkId}
      </div>
    )
  }

  const assetDropDownComponent = (data: CombinedObject) => {
    if (!data) return <div className={styles.dropDownPlaceholderText}>Choose from the list</div>

    if (data.assetName === 'clear') {
      return (
        <div className={styles.dropDownCleareWrap}>
          <div>
            Currently, there are no assets available for send.
            <br />
            <br />
            Please check back later, or contact support if&nbsp;you&nbsp;believe this is an error.
          </div>
        </div>
      )
    }
    return (
      <div
        onClick={() => {
          if (isLoading) return
          setSelectedAsset(data)
        }}
        className={styles.itemWrap}
      >
        <img style={{ height: 25, width: 25, borderRadius: 5 }} src={data.icon} alt='' />
        {data.assetName} - {data.assetId}
      </div>
    )
  }

  if (isSuccessful) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrap}>
          <SuccessfullyBiz
            textData={{
              title: 'Crypto Sent Successfully!',
              description: 'Please allow some time for the transaction to reflect on the blockchain.',
              btnText: 'Send Crypto Again',
            }}
            action={() => {
              setValue('address', '')
              setValue('memo', '')
              setValue('amountSend', '')
              setValue('amountReceive', '')
              setSummaryInfo(null)
              setSelectedAsset(null)
              setSelectedNetworkId(null)
              setIsAddWhitelist(false)
              setStep(STEPS.ADDRESS)
              setResponse(null)
              setIsSuccessful(false)
            }}
          />
        </div>
      </div>
    )
  }

  const getStepStyle = () => {
    if (step === STEPS.INPUT) {
      return styles.containerWrapFixForInput
    }
    if (step === STEPS.SUMMARY) {
      return styles.containerWrapFixForSummary
    }
    return ''
  }

  return (
    <div className={styles.container}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleWithdrawal)}>
          <div className={clsx(styles.contentWrap, getStepStyle())}>
            {!response && (
              <>
                {step !== STEPS.ADDRESS ? <BackButtonBiz backFn={handleBack} padding={30} /> : null}
                {step === STEPS.SUMMARY ? (
                  <div className={styles.title}>Confirm Details</div>
                ) : (
                  <>
                    <div className={styles.title}>Send Crypto</div>
                    <div className={styles.description} style={{ textAlign: 'center' }}>
                      To send crypto, select the asset you wish to&nbsp;send and enter the recipient’s wallet address.
                      Make sure the address is correct and matches the selected network.
                    </div>
                  </>
                )}

                <div className={styles.adaptiveHeight} />

                {step === STEPS.ADDRESS && (
                  <>
                    <div className={styles.label}>Asset</div>

                    <div style={{ width: '100%', position: 'relative' }}>
                      <CommonDropdownBiz
                        showDropdownForSingleItem={true}
                        data={sendListAssets.length ? sendListAssets : [{ assetName: 'clear' }]}
                        selectedData={selectedAsset}
                        itemComponent={assetDropDownComponent}
                      />
                    </div>

                    <div style={{ height: 24 }} />

                    <div className={clsx(styles.label, errors.address && styles.colorRed)}>
                      Address {errors.address && errors.address?.type === 'required' ? ' Required' : ''}
                      {errors.address && errors.address?.type === 'validate' ? ' Invalid' : ''}
                    </div>

                    <div className='input-item-wrap-biz'>
                      <input
                        id='address'
                        type='text'
                        style={{ paddingRight: 50 }}
                        className={`input-form  ${errors.address ? 'error' : ''}`}
                        placeholder='Type here..'
                        {...register('address', { required: true })}
                      />

                      <div
                        onClick={e => {
                          e.stopPropagation()
                          setIsShowAddressBook(!isShowAddressBook)
                        }}
                        className={styles.addressBookIconWrap}
                      >
                        <img style={{ height: 18 }} src={addressBookWhitelistBiz} alt={''} />
                      </div>

                      {isShowAddressBook && (
                        <div className={styles.whiteListWrap}>
                          {whiteList.length ? (
                            whiteList.map(address => {
                              return (
                                <AddressBookRowBiz
                                  key={address.address + address.networkId}
                                  action={handleSetAddressBook}
                                  address={address}
                                />
                              )
                            })
                          ) : (
                            <div className={styles.emptyWhiteListWrap}>
                              <div className={styles.emptyWhiteListTitle}>Ooops.. Your whitelist is empty</div>
                              <button onClick={handleAddNew} className='btn-with-icon-biz light-blue'>
                                Add New +
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {errors.address?.type === 'validate' ? (
                      <ErrorViewBiz
                        errorMessage={
                          errors.address?.type === 'validate'
                            ? 'Invalid address entered. Please check and try again'
                            : ''
                        }
                      />
                    ) : null}

                    {selectedNetworkId ? (
                      <>
                        <div style={{ marginTop: 24, width: '100%', position: 'relative' }}>
                          <div className={styles.label}>Network</div>
                          <CommonDropdownBiz
                            data={availableNetworks || []}
                            itemComponent={itemComponentNetwork}
                            setSelectedData={setSelectedNetworkId}
                            selectedData={selectedNetworkId}
                          />
                        </div>

                        <div className={styles.label} style={{ marginTop: 24, width: '100%' }}>
                          Memo Tag
                        </div>
                        <div className='input-item-wrap-biz'>
                          <input
                            id='memo'
                            type='text'
                            className='input-form'
                            placeholder='Type here..'
                            {...register('memo')}
                          />
                        </div>

                        {foundWhiteAddress ? null : (
                          <div onClick={handleCheckAddWhitelist} className={styles.addWhitelist}>
                            <DropdownCheckbox checked={isAddWhitelist} /> Add Address to Whitelist
                          </div>
                        )}
                      </>
                    ) : null}
                  </>
                )}

                {step === STEPS.INPUT && (
                  <>
                    <div className={styles.inputContainer}>
                      <div className={styles.stepInputLabel}>You Send</div>

                      <div className='input-item-wrap-biz'>
                        <input
                          id='address'
                          type='text'
                          style={{ paddingRight: 120 }}
                          className={`input-form  ${errors.amountSend ? 'error' : ''}`}
                          placeholder={`Min ${addCommasToDisplayValue(minimumWithdrawalAmount, 4)}`}
                          {...register('amountSend', {
                            required: true,
                            validate: value => {
                              const numericValue = parseFloat(value)
                              const balance = Number(selectedAsset?.availableBalance || '0')

                              if (isNaN(numericValue)) {
                                return 'Please enter a valid number'
                              }
                              if (numericValue > balance) {
                                return `Insufficient Balance: ${selectedAsset?.availableBalance}`
                              }
                              return true
                            },
                            onChange: e => {
                              const value = e.target.value
                              setValue('amountSend', value.replace(',', '.'))
                              debouncedChangeSend(value)
                            },
                          })}
                        />

                        <div
                          onClick={() => {
                            setValue('amountSend', (selectedAsset?.availableBalance || 0).toString())
                            debouncedChangeSend((selectedAsset?.availableBalance || 0).toString())
                          }}
                          className={styles.addressBookIconWrap}
                        >
                          <div className={styles.inputAsset}>{selectedAsset?.assetId}</div>
                          <div className={styles.inputMax}>MAX</div>
                        </div>
                      </div>

                      {errors.amountSend?.type === 'validate' ? (
                        <ErrorViewBiz errorMessage={errors.amountSend?.message || ''} margin={'0'} />
                      ) : (
                        <div className={clsx(styles.stepInputLabel)}>
                          Balance: {addCommasToDisplayValue(selectedAsset?.availableBalance.toString() || '0', 6)}{' '}
                          {selectedAsset?.assetId}
                        </div>
                      )}
                    </div>

                    <div style={{ height: 24 }} />

                    {/*<div className={styles.inputContainer}>*/}
                    {/*  <div className={styles.stepInputLabel}>You Receive</div>*/}

                    {/*  <div className='input-item-wrap-biz'>*/}
                    {/*    <input*/}
                    {/*      disabled={true}*/}
                    {/*      style={{ paddingRight: 120 }}*/}
                    {/*      id='address'*/}
                    {/*      type='text'*/}
                    {/*      className={`input-form  ${errors.amountReceive ? 'error' : ''}`}*/}
                    {/*      placeholder={`Min ${addCommasToDisplayValue(minimumWithdrawalAmount, 4)}`}*/}
                    {/*      {...register('amountReceive', { required: true })}*/}
                    {/*    />*/}
                    {/*  </div>*/}
                    {/*</div>*/}

                    <div className={styles.transactionFeesWrap}>
                      <div className={styles.stepInputLabel}>Transaction Fees:</div>
                      <div className={styles.stepInputLabel}>
                        {addCommasToDisplayValue(summaryInfo?.fee || '0', 2)}{' '}
                        {summaryInfo?.assetId || selectedAsset?.assetId}
                      </div>
                    </div>
                  </>
                )}

                {step === STEPS.SUMMARY && (
                  <div className={styles.confirmDataWrap}>
                    <div className={styles.confirmData}>
                      <div className={styles.confirmTitle}>Recipient Details:</div>
                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>Address</div>
                        <div className={styles.confirmValue}>{shortedAddress(watchAddress)}</div>
                      </div>
                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>Network</div>
                        <div className={styles.confirmValue}>{selectedNetworkId}</div>
                      </div>
                      {watchMemo && (
                        <div className={styles.confirmDescriptionWrap}>
                          <div className={styles.confirmDescription}>Memo Tag</div>
                          <div className={styles.confirmValue}>{watchMemo}</div>
                        </div>
                      )}
                    </div>
                    <div className={styles.confirmData}>
                      <div className={styles.confirmTitle}>Transaction Details:</div>
                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>You Send</div>
                        <div style={{ textAlign: 'right' }}>
                          <div className={styles.confirmAsset}>
                            {selectedAsset?.assetId}{' '}
                            {addCommasToDisplayValue(
                              (+(summaryInfo?.fee || 0) + +(summaryInfo?.amount || 0)).toString(),
                              6
                            )}
                          </div>
                          <div className={styles.confirmDescription}>
                            {currency.symbol}
                            {addCommasToDisplayValue(
                              rateAmount(+(summaryInfo?.fee || 0) + +(summaryInfo?.amount || 0)).toString(),
                              2
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>Withdrawal Fee</div>
                        <div className={styles.confirmValue}>
                          {summaryInfo?.assetId} {Number(summaryInfo?.fee || '0')}
                        </div>
                      </div>
                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>Conversion Rate</div>
                        <div className={styles.confirmValue}>
                          1 {selectedAsset?.assetId} = {Number(selectedAsset?.[currencyType].price || '0')}{' '}
                          {currency.type}
                        </div>
                      </div>
                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>You Receive</div>
                        <div style={{ textAlign: 'right' }}>
                          <div className={styles.confirmAsset}>
                            {selectedAsset?.assetId} {addCommasToDisplayValue(summaryInfo?.amount, 6)}
                          </div>
                          <div className={styles.confirmDescription}>
                            {currency.symbol}
                            {addCommasToDisplayValue(rateAmount(+(summaryInfo?.amount || 0)).toString(), 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ flexGrow: 1 }} />

                {step === STEPS.SUMMARY && (
                  <div className={styles.confirmDescription} style={{ marginBottom: 48, textAlign: 'center' }}>
                    Please allow 24-72 hours for the withdrawal request to be processed.
                  </div>
                )}

                <div className={styles.buttonsWrap}>
                  <button disabled={handleDisableBtn()} type='submit' className='btn-biz blue big'>
                    {isLoading ? <span className='spinner-border' /> : handleBtnName()}
                  </button>

                  {step !== STEPS.ADDRESS ? (
                    <button type='button' onClick={handleBack} className='btn-biz transparent big showMd'>
                      Back
                    </button>
                  ) : null}
                </div>
              </>
            )}

            {response && ( //TODO add wrapper
              <>
                <BackButtonBiz backFn={() => setResponse(null)} padding={30} />
                <div className={styles.title}>Confirm Details</div>
                <StepControllerComponent nextStepResponse={response} finalAction={handleFinalAction} />
              </>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
