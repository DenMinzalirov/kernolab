import { ReactElement, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CommonDropdown, Modal } from 'components'
import { StepBackBtn } from 'components/step-back-btn'
import { SuccessPairsComponent } from 'components/success-pairs-component'
import { pages } from 'constant'
import { STEP_UP_SCOPE } from 'constant/step-up-scope'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { handleError } from 'utils/error-handler'
import { validateStepUpAvailability } from 'utils/validate-step-up-availability'
import {
  AuthResponse,
  BankAddressResponse,
  FiatService,
  MFAAddAuthResponse,
  StepUpAuthResponse,
  UserLimitResponse,
  WithdrawalOfferResponse,
} from 'wip/services'
import { $assetEurData } from 'model/cefi-combain-assets-data'
import { $twoFaStatus } from 'model/two-fa'
import dangerOrange from 'assets/icons/danger-orange.svg'
import infoIcon from 'assets/icons/info-icon.svg'

import { StepControllerComponent } from '../../step-controller'
import styles from './styles.module.scss'

// Функция для создания мок-данных
const createMockWithdrawalInfo = (
  amount: string,
  bankAddressUuid: string,
  operationType: string
): WithdrawalOfferResponse => {
  const amountNum = parseFloat(amount) || 0
  // Комиссия: 0 для SEPA, 25 для SWIFT
  const fee = operationType === 'SWIFT_XML' ? '25.00' : '0.00'

  return {
    transactionId: Math.floor(Math.random() * 1000000),
    operationType,
    bankAddressUuid,
    amount: amountNum.toFixed(2),
    fee,
  }
}

export type OperationType = {
  name: string
  isActive: boolean
}

type Inputs = {
  amount: string
}

const defaultValues = {
  amount: '',
}

const STEPS = {
  INPUT: 'INPUT',
  SUMMARY: 'SUMMARY',
}

export interface WithdrawalFiat {
  bankAddresses: BankAddressResponse[]
}

export function WithdrawalFiat({ bankAddresses }: WithdrawalFiat) {
  const twoFaStatus = useUnit($twoFaStatus)
  const eurAsset = useUnit($assetEurData)

  const navigate = useNavigate()

  const methods = useForm<Inputs>({ defaultValues })
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = methods

  const watchAmount = watch('amount')

  const [selectedAddress, setSelectedAddress] = useState(bankAddresses[0])
  const [step, setStep] = useState(STEPS.INPUT)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccessful, setIsSuccessful] = useState(false)
  const [limits, setLimits] = useState<UserLimitResponse>({
    maxWithdrawalAmount: '10000',
    maxDepositAmount: '',
    minWithdrawalAmount: '50',
    minDepositAmount: '',
  })
  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>()
  const [withdrawalInfoData, setWithdrawalInfoData] = useState<WithdrawalOfferResponse>()
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([
    { name: 'Inside Europe (SEPA)', isActive: true },
    { name: 'Outside Europe (SWIFT)', isActive: false },
  ])
  const activeType = operationTypes.find(operationType => operationType.isActive)

  const itemComponentAddresses = (selectedItemAddress: BankAddressResponse): ReactElement => {
    const trimmedStr = selectedItemAddress?.iban.replace(/\s/g, '')
    const iban = `Account Ending in ****${trimmedStr?.substring(trimmedStr.length - 4)}`
    const operationType = selectedItemAddress?.operationType

    return (
      <div style={{ marginLeft: 10 }}>
        <div className={styles.bankName}>{selectedItemAddress?.name || ''}</div>
        <div className={styles.bankIban}>
          {iban} | {operationType}
        </div>
      </div>
    )
  }

  useEffect(() => {
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

  useEffect(() => {
    if (selectedAddress) {
      setOperationTypes([
        { name: 'Inside Europe (SEPA)', isActive: selectedAddress.operationType === 'SEPA' },
        { name: 'Outside Europe (SWIFT)', isActive: selectedAddress.operationType === 'SWIFT_XML' },
      ])
    }
  }, [selectedAddress])

  const handleFiatWithdraw = async () => {
    setIsLoading(true)

    try {
      const operationType = activeType?.name === 'Outside Europe (SWIFT)' ? 'SWIFT_XML' : 'SEPA'

      if (step === STEPS.INPUT) {
        const data = await FiatService.fiatWithdrawalInfo({
          operationType,
          bankAddressUuid: selectedAddress.addressUuid,
          amount: watchAmount,
        })

        setWithdrawalInfoData(data || createMockWithdrawalInfo(watchAmount, selectedAddress.addressUuid, operationType))
        setStep(STEPS.SUMMARY)
      }

      if (step === STEPS.SUMMARY) {
        const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.FIAT_WITHDRAWAL)
        stepUpRes && setResponse(stepUpRes)
      }
    } catch (error: any) {
      console.log('handleFiatWithdraw-ERROR', error)
      const operationType = activeType?.name === 'Outside Europe (SWIFT)' ? 'SWIFT_XML' : 'SEPA'
      setWithdrawalInfoData(createMockWithdrawalInfo(watchAmount, selectedAddress.addressUuid, operationType))
      setStep(STEPS.SUMMARY)
      // handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalAction = async (responseData: AuthResponse | MFAAddAuthResponse | StepUpAuthResponse) => {
    setIsLoading(true)
    try {
      // await FiatService.fiatWithdrawal({
      //   bankAddressUuid: selectedAddress.addressUuid,
      //   amount: withdrawalInfoData?.amount || '',
      //   fee: withdrawalInfoData?.fee || '',
      //   token: (responseData as StepUpAuthResponse).oneTimeAccessToken,
      // })
      setIsSuccessful(true)
    } catch (error) {
      console.log('handleFiatWithdraw-ERROR', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  // const switchAction = (item: OperationType) => {
  //   const newStateOperations: OperationType[] = operationTypes.map(originOperationType => {
  //     return { ...originOperationType, isActive: originOperationType.name === item.name }
  //   })
  //   setOperationTypes(newStateOperations)
  // }

  const isNotEnoughBalance = () => {
    if (+watchAmount > +limits.maxWithdrawalAmount) return true
    return +watchAmount > eurAsset.availableBalance
  }

  const placeholder = () => {
    return `Min ${limits.minWithdrawalAmount || 0}; max ${limits.maxWithdrawalAmount || 0}`
  }

  const receiveAmount = () => {
    return Number(watchAmount || 0) - Number(withdrawalInfoData?.fee || 0)
  }

  const validateInput = (data: string): boolean => {
    return Number(data.replace(',', '.')) >= +limits.minWithdrawalAmount
  }

  const isDisabledBtn = () => {
    if (step === STEPS.SUMMARY) {
      const sendAmount = +(watchAmount || 0)
      return sendAmount > +eurAsset.availableBalance || sendAmount <= 0
    }
    return +limits.minWithdrawalAmount > +watchAmount || isLoading || isNotEnoughBalance()
  }

  const handleBack = () => {
    setStep(STEPS.INPUT)
  }

  if (!twoFaStatus) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className={styles.twoFaTitle}>Two Factor Authentication</div>
        <div className={styles.twoFaDescription} style={{ maxWidth: 440 }}>
          For security reasons, a 2FA setup is required. Please follow the instructions.
        </div>
        <div style={{ height: 50 }} />
        <button
          onClick={() => {
            navigate(pages.SETTINGS.path)
            Modal.close()
          }}
          className='btn-new primary big'
          style={{ maxWidth: 440 }}
        >
          Go to Settings
        </button>
      </div>
    )
  }

  if (isSuccessful) {
    return (
      <SuccessPairsComponent
        title={'Withdrawal Requested'}
        description={'Please allow 24-72 hours for the withdrawal request to be processed.'}
        btnText={'Go Back to Banking'}
        btnAction={() => navigate(pages.BANKING.path)}
      />
    )
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {!response && (
          <FormProvider {...methods}>
            <form
              className={styles.formWrap}
              // style={{ position: 'relative', width: 440, minHeight: 705, display: 'flex', flexDirection: 'column' }}
              onSubmit={handleSubmit(handleFiatWithdraw)}
            >
              {step === STEPS.INPUT ? (
                <>
                  <div className={styles.transfer}>Withdraw</div>
                  <div style={{ height: 24 }}></div>
                  <div className={styles.transferDescription} style={{ margin: '0 -5px' }}>
                    {/*Please fill in the necessary information to withdraw.*/}
                    The bank account from which you are withdrawing must be under your full name.
                    <br />
                    Please note that the bank to which you are withdrawing may charge
                    <br />
                    an additional fee for the transaction
                  </div>
                  {/*<div className={clsx(styles.transferDescription, styles.transferDescription2)}>*/}
                  {/*  The bank account from which you are withdrawing must be under your full name.*/}
                  {/*</div>*/}
                  <div style={{ height: 36 }} />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 20,
                      // width: 440
                    }}
                  >
                    <div className={clsx(styles.blockGap12, styles.positionRelative)}>
                      <div className={styles.titleInfoBlock}>Bank Account</div>
                      <CommonDropdown
                        data={bankAddresses}
                        itemComponent={itemComponentAddresses}
                        setSelectedData={setSelectedAddress}
                        selectedData={selectedAddress}
                      />
                    </div>
                    <div className={styles.blockGap12}>
                      <div className={styles.titleInfoBlock}>Send</div>
                      <div className='input-item-wrap-new' style={{ position: 'relative', flexGrow: 1 }}>
                        <input
                          id='amount'
                          inputMode='decimal'
                          style={{
                            border: `1px solid ${errors.amount ? 'var(--P-System-Red)' : 'var(--Deep-Space-10)'}`,
                          }}
                          // className={styles.input}
                          className='input-form'
                          placeholder={placeholder()}
                          {...register('amount', {
                            required: true,
                            validate: validateInput,
                            onChange(event) {
                              const value = event.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                              setValue('amount', value.trim())
                            },
                          })}
                          onKeyDown={e => {
                            if (
                              !/[0-9.,]/.test(e.key) &&
                              e.key !== 'Backspace' &&
                              e.key !== 'ArrowLeft' &&
                              e.key !== 'ArrowRight' &&
                              e.key !== 'Delete' &&
                              e.key !== 'Tab'
                            ) {
                              e.preventDefault()
                            }
                          }}
                        />
                        <div className={styles.currencyType}>
                          <div className={styles.btnTitle}>EUR</div>
                        </div>
                      </div>
                      <div
                        style={isNotEnoughBalance() ? { color: 'var(--P-System-Red)' } : {}}
                        className={styles.balanceAmount}
                      >
                        Balance: {addCommasToDisplayValue(eurAsset.availableBalance.toString(), 2)} EUR
                      </div>
                    </div>
                  </div>

                  <div
                    className={styles.transferDescription}
                    style={{
                      ...(isNotEnoughBalance() ? { color: 'var(--P-System-Red)' } : {}),
                      marginBottom: 36,
                    }}
                  >
                    {isNotEnoughBalance()
                      ? +watchAmount > +limits.maxWithdrawalAmount
                        ? 'Max withdrawal amount is exceeded'
                        : 'Not enough balance.'
                      : ''}
                  </div>
                </>
              ) : null}

              {step === STEPS.SUMMARY ? (
                <>
                  <div className={styles.transfer}>Withdraw Summary</div>
                  <div style={{ height: 50 }} />
                  <div className={styles.blockGap12}>
                    <div className={styles.infoBlockTitle}>Bank Details:</div>
                    <div className={styles.infoBlockDescription}>
                      <div>Payment Method</div>
                      <div className={styles.infoBlockDescriptionAmount}>{activeType?.name}</div>
                    </div>

                    <div className={styles.infoBlockDescription}>
                      <div>IBAN</div>
                      <div className={styles.infoBlockDescriptionAmount}>{selectedAddress.iban}</div>
                    </div>

                    <div className={styles.infoBlockDescription}>
                      <div>Bank name</div>
                      <div className={styles.infoBlockDescriptionAmount}>{selectedAddress.name}</div>
                    </div>
                  </div>
                  <div style={{ height: 36 }} />
                  <div className={styles.blockGap12}>
                    <div className={styles.infoBlockTitle}>Withdrawal Details:</div>
                    <div className={styles.infoBlockDescription}>
                      <div>Send</div>
                      <div className={styles.infoBlockDescriptionAmountBig}>
                        {addCommasToDisplayValue(
                          (+(withdrawalInfoData?.amount || 0) + +(withdrawalInfoData?.fee || 0)).toFixed(2),
                          2
                        ) || '0.00'}{' '}
                        EUR
                      </div>
                    </div>

                    <div className={styles.infoBlockDescription}>
                      <div>
                        Withdrawal Fee {activeType?.name === 'Outside Europe (SWIFT)' ? '(Include SWIFT fee)' : ''}
                      </div>
                      <div className={styles.infoBlockDescriptionAmount}>
                        {addCommasToDisplayValue(withdrawalInfoData?.fee, 2) || '0.00'} EUR
                      </div>
                    </div>

                    <div className={styles.infoBlockDescription}>
                      <div>Receive</div>
                      <div className={styles.infoBlockDescriptionAmountBig}>
                        {+(withdrawalInfoData?.amount || 0) || '0.00'} EUR
                      </div>
                    </div>

                    <div
                      className={styles.transferDescription}
                      style={{
                        color:
                          +(watchAmount || 0) + +(withdrawalInfoData?.fee || 0) > +eurAsset.availableBalance
                            ? 'var(--P-System-Red)'
                            : 'var(--Deep-Space)',
                        marginBottom: 36,
                      }}
                    >
                      {+(watchAmount || 0) > +eurAsset.availableBalance ? 'Not enough balance.' : ''}
                    </div>
                  </div>
                </>
              ) : null}

              <div className={styles.autoHeight} />

              <div style={{ marginTop: 'auto' }}>
                {step === STEPS.SUMMARY ? (
                  <div className={styles.transferDescription} style={{ marginBottom: 36 }}>
                    <img src={infoIcon} alt={''} style={{ marginRight: 7, marginBottom: 2 }} />
                    Please allow 24-72 hours for the withdrawal request to be processed.
                  </div>
                ) : null}

                {step === STEPS.INPUT && activeType?.name === 'Outside Europe (SWIFT)' ? (
                  <div style={{ flexGrow: 1, display: 'flex', marginBottom: 36 }}>
                    <div className={styles.attentionText}>
                      <img className={styles.attentionIcon} alt='' src={dangerOrange} />
                      <div>Please note that SWIFT withdrawals incur a €25 fee.</div>
                    </div>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: 12 }}>
                  {step === STEPS.SUMMARY ? <StepBackBtn isLoading={isLoading} backButtonFn={handleBack} /> : null}

                  <button
                    type='submit'
                    className='btn-new primary big'
                    disabled={isDisabledBtn()}
                    style={{ opacity: isDisabledBtn() ? 0.5 : 1, marginTop: 'auto' }}
                  >
                    {isLoading ? <span className='spinner-border' /> : 'Confirm & Withdraw'}
                  </button>
                </div>
              </div>
            </form>
          </FormProvider>
        )}

        {response && (
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: 440, minHeight: 705 }}>
            <div className={styles.transfer}>Withdraw</div>
            <div style={{ height: 16 }} />
            <StepControllerComponent nextStepResponse={response} finalAction={handleFinalAction} />
          </div>
        )}
      </div>
    </>
  )
}
