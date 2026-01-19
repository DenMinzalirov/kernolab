import React, { ReactElement, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { NavLink, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Spinner } from '../../../components'
import { BackButtonBiz } from '../../../components/back-button-biz'
import { CommonDropdownBiz } from '../../../components/common-dropdown-biz'
import { SuccessfullyBiz } from '../../../components/successfully-biz'
import { termsOfUseLink } from '../../../config'
import { pages } from '../../../constant'
import { STEP_UP_SCOPE } from '../../../constant/step-up-scope'
import { OperationType } from '../../../features/modals/withdraw-banking/fiat'
import { StepControllerComponent } from '../../../features/step-controller'
import useDebounce from '../../../hooks/use-debounce'
import { $assetEurData } from '../../../model/cefi-combain-assets-data'
import { addCommasToDisplayValue } from '../../../utils/add-commas-to-display-value'
import { validateStepUpAvailability } from '../../../utils/validate-step-up-availability'
import {
  AuthResponse,
  BankAddressResponse,
  FiatService,
  MFAAddAuthResponse,
  PageBankAddressResponse,
  StatusBankAddress,
  StepUpAuthResponse,
  UserLimitResponse,
  WithdrawalOfferResponse,
} from '../../../wip/services'
import styles from './styles.module.scss'

type Inputs = {
  amountSend: string
}

const defaultValues = {
  amountSend: '',
}

const STEPS = {
  ADDRESS: 'ADDRESS',
  SUMMARY: 'SUMMARY',
}

export function SendFiatBiz() {
  const navigate = useNavigate()
  const eurAsset = useUnit($assetEurData)

  const methods = useForm<Inputs>({ defaultValues })
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = methods

  const watchAmountSend = watch('amountSend')

  const [operationTypes, setOperationTypes] = useState<OperationType[]>([
    { name: 'Inside Europe (SEPA)', isActive: true },
    { name: 'Outside Europe (SWIFT)', isActive: false },
  ])
  const [limits, setLimits] = useState<UserLimitResponse>({
    maxWithdrawalAmount: '',
    maxDepositAmount: '',
    minWithdrawalAmount: '50',
    minDepositAmount: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [bankAddresses, setBankAddresses] = useState<BankAddressResponse[]>([])
  const [selectedAddress, setSelectedAddress] = useState<BankAddressResponse>()
  const [withdrawalInfoData, setWithdrawalInfoData] = useState<WithdrawalOfferResponse>()
  const [step, setStep] = useState(STEPS.ADDRESS)
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>()
  const [isSuccessful, setIsSuccessful] = useState(false)

  const getBankAddress = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const address = await FiatService.getAllBankAddress()
      if (address.content.length > 0) {
        setBankAddresses(address.content)
        setSelectedAddress(address.content[0])
      }
    } catch (e) {
      console.log('getAllBankAddress-ERROR', e)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getBankAddress().catch(e => console.log('getAllBankAddress-ERROR', e))

    FiatService.getFiatLimits()
      .then(res => {
        setLimits({
          maxWithdrawalAmount: addCommasToDisplayValue(res.maxWithdrawalAmount, 2),
          maxDepositAmount: addCommasToDisplayValue(res.maxDepositAmount, 2),
          minWithdrawalAmount: addCommasToDisplayValue(res.minWithdrawalAmount, 2),
          minDepositAmount: addCommasToDisplayValue(res.minDepositAmount, 2),
        })
      })
      .catch(e => {
        console.log('ERROR-getFiatMinWithdrawalAmount', e)
      })
  }, [])

  const getWithdrawalInfo = async (value: string) => {
    try {
      if (selectedAddress) {
        const data = await FiatService.fiatWithdrawalInfo({
          operationType: selectedAddress.operationType,
          bankAddressUuid: selectedAddress.addressUuid,
          amount: value,
        })

        setWithdrawalInfoData(data)
      }
    } catch (error: any) {
      console.log('ERROR-Fiat-getWithdrawalInfo', error)
    }
  }

  useEffect(() => {
    if (selectedAddress) {
      setOperationTypes([
        { name: 'Inside Europe (SEPA)', isActive: selectedAddress.operationType === 'SEPA' },
        { name: 'Outside Europe (SWIFT)', isActive: selectedAddress.operationType === 'SWIFT_XML' },
      ])
    }

    if (watchAmountSend) {
      getWithdrawalInfo(watchAmountSend)
    }
  }, [selectedAddress])

  const debouncedChangeSend = useDebounce(async (value: string) => {
    await getWithdrawalInfo(value)
  }, 500)

  const handleFiatWithdrawal = async () => {
    if (step === STEPS.ADDRESS) {
      setStep(STEPS.SUMMARY)
    }

    if (step === STEPS.SUMMARY) {
      const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.FIAT_WITHDRAWAL)
      stepUpRes && setResponse(stepUpRes)
    }
  }

  const openDeposit = () => {
    navigate(pages.RECEIVE_FIAT.path)
  }

  const handleDisableBtn = () => {
    if (isLoading) return true

    if (
      step === STEPS.ADDRESS &&
      (+watchAmountSend < +limits.minWithdrawalAmount ||
        +(withdrawalInfoData?.amount || 0) + +(withdrawalInfoData?.fee || 0) > +eurAsset.availableBalance)
    ) {
      return true
    }

    if (step === STEPS.ADDRESS && +(watchAmountSend || 0) > +eurAsset.availableBalance) {
      return true
    }

    return false
  }

  const handleBack = () => {
    setStep(STEPS.ADDRESS)
  }

  const handleFinalAction = async (responseData: AuthResponse | StepUpAuthResponse | MFAAddAuthResponse) => {
    if (!selectedAddress) return

    setIsLoading(true)

    try {
      await FiatService.fiatWithdrawal({
        bankAddressUuid: selectedAddress.addressUuid,
        amount: watchAmountSend,
        fee: withdrawalInfoData?.fee || '',
        token: (responseData as StepUpAuthResponse).oneTimeAccessToken,
      })
      setIsSuccessful(true)
    } catch (error: any) {
      console.log('handleFiatWithdraw-ERROR', error)
    } finally {
      setIsLoading(false)
    }
  }

  const itemComponentAddresses = (selectedItemAddress: BankAddressResponse): ReactElement => {
    const trimmedStr = selectedItemAddress?.iban.replace(/\s/g, '')
    const iban = `Account Ending in ****${trimmedStr?.substring(trimmedStr.length - 4)}`
    return (
      <div style={{ marginLeft: 20 }}>
        <div className={styles.bankName}>{selectedItemAddress?.name || ''}</div>
        <div className={styles.description}>{iban}</div>
      </div>
    )
  }

  if (!bankAddresses.length && isLoading) {
    return (
      <div className={styles.container}>
        <div className={clsx(styles.contentWrap, styles.contentWrapFix)}>
          <div className='justify-row-center' style={{ height: '100%' }}>
            <Spinner />
          </div>
        </div>
      </div>
    )
  }

  if (!bankAddresses.length && !isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrap} style={{ justifyContent: 'center' }}>
          <div className={styles.title}>Send Fiat Not Available</div>
          <div className={styles.heightMd12Lg24} />
          <div className={clsx(styles.descriptionNotAvailable, styles.hideMd)}>
            According to the{' '}
            <NavLink to={termsOfUseLink()} target='_blank' className={styles.link}>
              Terms & Conditions
            </NavLink>{' '}
            to be able to withdraw your funds to any bank account, you must first make a deposit with the desired bank
            account. You can withdraw your funds to the bank accounts from which deposits have been made.
          </div>

          <div className={clsx(styles.descriptionNotAvailable, styles.showMdInline)}>
            According to the{' '}
            <NavLink to={termsOfUseLink()} target='_blank' className={styles.link}>
              Terms & Conditions
            </NavLink>{' '}
            to&nbsp;be&nbsp;able&nbsp;to&nbsp;send your funds to&nbsp;any bank account, you must first make a deposit
            with the desired bank account.
            <br />
            <br />
            You can send your funds to&nbsp;the&nbsp;bank accounts from&nbsp;which&nbsp;deposits have been made.
          </div>
          <div className={styles.dynamicHeight} />
          <button
            onClick={() => {
              openDeposit()
            }}
            className='btn-biz red big'
          >
            Deposit
          </button>
        </div>
      </div>
    )
  }

  if (isSuccessful) {
    return (
      <div className={styles.container}>
        <div className={clsx(styles.contentWrap, styles.contentWrapFix)}>
          <SuccessfullyBiz
            textData={{
              title: 'Fiat Sent Successfully!',
              description: 'Please allow 24-72 hours for the withdrawal request to be processed.',
              btnText: 'Send Fiat Again',
            }}
            action={() => {
              setValue('amountSend', '')
              setWithdrawalInfoData(undefined)
              setStep(STEPS.ADDRESS)
              setResponse(null)
              setIsSuccessful(false)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleFiatWithdrawal)}>
          <div className={styles.contentWrap}>
            {!response && (
              <>
                {step !== STEPS.ADDRESS ? <BackButtonBiz backFn={handleBack} padding={30} /> : null}

                {step === STEPS.SUMMARY ? (
                  <div className={styles.title}>Confirm Details</div>
                ) : (
                  <>
                    <div className={styles.title}>Send Fiat</div>
                    <div className={styles.height12} />
                    <div className={clsx(styles.description, styles.hideMd)} style={{ textAlign: 'center' }}>
                      The bank account from which you are withdrawing must be under your full name.
                      <br />
                      Please note that the bank to&nbsp;which&nbsp;you&nbsp;are&nbsp;withdrawing may charge
                      an&nbsp;additional fee for&nbsp;the&nbsp;transaction.
                    </div>
                    <div className={clsx(styles.description, styles.showMd)} style={{ textAlign: 'center' }}>
                      The withdrawal bank account must be in your name. Your bank may charge an additional transaction
                      fee.
                    </div>
                  </>
                )}

                <div className={styles.dynamicHeight} />

                {step === STEPS.ADDRESS && (
                  <>
                    <div className={styles.label} style={{ marginBottom: 12 }}>
                      Payment Method
                    </div>
                    <div className={styles.switcherWrap}>
                      {operationTypes.map(operation => {
                        return (
                          <div
                            key={operation.name}
                            className={clsx(styles.switcherItem, { [styles.switcherItemActive]: operation.isActive })}
                          >
                            {operation.name}
                          </div>
                        )
                      })}
                    </div>

                    <div style={{ position: 'relative', marginTop: 24 }}>
                      <div className={styles.label} style={{ marginBottom: 12 }}>
                        Bank Account
                      </div>
                      <CommonDropdownBiz
                        data={bankAddresses}
                        itemComponent={itemComponentAddresses}
                        setSelectedData={setSelectedAddress}
                        selectedData={selectedAddress}
                      />
                    </div>

                    <div className={styles.label} style={{ marginBottom: 10, marginTop: 24 }}>
                      You Send
                    </div>
                    <div className='input-item-wrap-biz'>
                      <input
                        style={{
                          paddingRight: 120,
                          ...(errors.amountSend ? { border: '1px solid red' } : {}),
                        }}
                        id='address'
                        type='text'
                        className='input-form'
                        placeholder={`Min ${addCommasToDisplayValue(limits.minWithdrawalAmount, 4)}`}
                        {...register('amountSend', {
                          required: true,
                          onChange: e => {
                            const value = e.target.value
                            setValue('amountSend', value.replace(',', '.'))
                            debouncedChangeSend(value)
                          },
                        })}
                      />
                      <div
                        onClick={e => {
                          setValue('amountSend', Number(eurAsset?.availableBalance || 0).toString())
                          debouncedChangeSend(Number(eurAsset?.availableBalance || 0).toString())
                        }}
                        className={styles.addressBookIconWrap}
                      >
                        <div className={styles.inputAsset}>{eurAsset?.assetId}</div>
                        <div className={styles.inputMax}>MAX</div>
                      </div>
                    </div>
                    <div className={styles.label} style={{ marginTop: 10 }}>
                      Balance: {addCommasToDisplayValue(eurAsset?.availableBalance.toString() || '0', 2)}{' '}
                      {eurAsset?.assetId}
                    </div>

                    <div style={{ height: 36 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div className={styles.label}>Transaction Fees:</div>
                      <div className={styles.label}>
                        {addCommasToDisplayValue(withdrawalInfoData?.fee || '0', 2)} {eurAsset.assetId}
                      </div>
                    </div>
                  </>
                )}

                {step === STEPS.SUMMARY && (
                  <div className={styles.confirmDataWrap}>
                    <div className={styles.confirmData}>
                      <div className={styles.confirmTitle}>Bank Details:</div>
                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>Payment Method</div>
                        <div className={styles.confirmValue}>
                          {operationTypes.find(operation => operation.isActive)?.name || selectedAddress?.operationType}
                        </div>
                      </div>

                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>IBAN</div>
                        <div className={styles.confirmValue}>{selectedAddress?.iban}</div>
                      </div>

                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>Account Holder</div>
                        <div className={styles.confirmValue}>{selectedAddress?.name}</div>
                      </div>
                    </div>

                    <div className={styles.confirmData}>
                      <div className={styles.confirmTitle}>Withdrawal Details:</div>
                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>You Send</div>
                        <div className={styles.confirmAsset}>
                          {addCommasToDisplayValue(
                            (+(withdrawalInfoData?.amount || 0) + +(withdrawalInfoData?.fee || 0)).toString(),
                            2
                          )}{' '}
                          {eurAsset.assetId}
                        </div>
                      </div>

                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>Withdrawal Fee</div>
                        <div className={styles.confirmValue}>
                          {addCommasToDisplayValue(withdrawalInfoData?.fee, 2)} {eurAsset.assetId}
                        </div>
                      </div>

                      <div className={styles.confirmDescriptionWrap}>
                        <div className={styles.confirmDescription}>You Receive</div>
                        <div className={styles.confirmAsset}>
                          {addCommasToDisplayValue(withdrawalInfoData?.amount, 2)} {eurAsset.assetId}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ flexGrow: 1 }} />
                {step === STEPS.SUMMARY && (
                  <div className={styles.label} style={{ marginBottom: 48, textAlign: 'center' }}>
                    Please allow 24-72 hours for the withdrawal request to be processed.
                  </div>
                )}

                {step === STEPS.ADDRESS && +(watchAmountSend || 0) > +eurAsset.availableBalance && (
                  <div className={styles.label} style={{ marginBottom: 48, textAlign: 'center', color: '#D52941' }}>
                    Insufficient balance.
                  </div>
                )}

                <div className={styles.buttonsWrap}>
                  <button disabled={handleDisableBtn()} type='submit' className='btn-biz blue big'>
                    {isLoading ? <span className='spinner-border' /> : 'Continue'}
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
                <div className={styles.title}>Send Fiat</div>
                <div className={styles.height12} />
                <StepControllerComponent
                  nextStepResponse={response}
                  finalAction={handleFinalAction}
                  dataProps={{ resetStepUp: () => setResponse(null) }}
                />
              </>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
