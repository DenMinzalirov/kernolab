import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import moment from 'moment'
import clsx from 'clsx'

import { Modal } from 'components'
import { CommonDropdownBiz } from 'components/common-dropdown-biz'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { handleError } from 'utils/error-handler'
import {
  CryptoTravelRuleService,
  CustodialProvider,
  TravelRuleInfoRequest,
  WalletType,
} from 'wip/services/crypto-travel-rules'
import { HELP_LINKS } from 'config'
import { getTravelRuleDataFx, TravelRuleTransaction } from 'model/travel-rule-transactions'

import { countriesArray } from './countries'
import styles from './styles.module.scss'
import { walletTypeList } from './wallet-type-list'

type TCountries = {
  code: string
  name: string
  flag: string
}
type WalletTypeForm = {
  name: string
  value: WalletType
  icon: string
}

type Inputs = {
  ownerWallet: boolean
  fullName: string
  walletType: string
  countryCode: string
  otherProviderName?: string
  custodialProvider?: string
}

const defaultValues = {
  ownerWallet: false,
  fullName: '',
  walletType: '',
  countryCode: '',
  otherProviderName: '',
  custodialProvider: '',
}

type Props = {
  travelRuleData: TravelRuleTransaction
  setIsSuccess: (value: boolean) => void
}

export function TravelRuleForm({ travelRuleData, setIsSuccess }: Props) {
  const methods = useForm<Inputs>({ defaultValues })
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = methods

  const isDeposit = travelRuleData?.operationType === 'DEPOSIT'
  const isWithdraw = travelRuleData?.operationType === 'WITHDRAWAL'

  const watchOwnerWallet = watch('ownerWallet')

  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<TCountries>()

  const [selectedWallet, setSelectedWallet] = useState<WalletTypeForm>()

  const itemComponentCuntry = (item: TCountries) => {
    return (
      <div className={styles.countryItem}>
        {item?.flag && <div className={styles.countryItemFlag}>{item?.flag}</div>}
        <div className={clsx(styles.countryItemName, { [styles.itemPlaceholder]: !item?.code })}>
          {item?.name || 'Choose country'}
        </div>
      </div>
    )
  }

  const itemComponentWalletType = (item: any) => {
    return (
      <div className={styles.walletItem}>
        {item?.icon && <img src={item?.icon} alt='Wallet Icon' className={styles.walletItemIcon} />}
        <div className={clsx(styles.walletItemName, { [styles.itemPlaceholder]: !item?.name })}>
          {item?.name || 'Choose wallet type'}
        </div>
      </div>
    )
  }

  const handleSetSelectedWallet = (item: WalletTypeForm) => {
    setSelectedWallet(item)

    if (item.value === WalletType.OTHER) {
      setValue('walletType', WalletType.OTHER)
      setValue('custodialProvider', '')
      setValue('otherProviderName', '')
      return
    }

    if (item.value === WalletType.NON_CUSTODIAL) {
      setValue('walletType', WalletType.NON_CUSTODIAL)
      setValue('custodialProvider', '')
      setValue('otherProviderName', '')
      return
    }

    setValue('walletType', WalletType.CUSTODIAL)
    setValue('custodialProvider', item.value)
    setValue('otherProviderName', '')
  }

  const handleSetSelectedCountry = (item: TCountries) => {
    setSelectedCountry(item)
    setValue('countryCode', item.code)
  }

  const disabledBtn = () => {
    if (watchOwnerWallet) {
      return false
    }

    if (watch('fullName') && watch('countryCode') && watch('walletType')) {
      return false
    }

    return true
  }

  const transactionId = travelRuleData?.id

  const onSubmit = async (data: Inputs) => {
    setIsLoading(true)
    try {
      const dataParams: TravelRuleInfoRequest = {
        walletType: data.walletType as WalletType,
        fullName: data.fullName,
        countryCode: data.countryCode,
        custodialProvider: (data?.custodialProvider as CustodialProvider) || null,
        otherProviderName: data?.otherProviderName || null,
      }

      if (watchOwnerWallet && isDeposit) {
        await CryptoTravelRuleService.submitTravelRuleDepositWalletOwnership(transactionId)
        setIsSuccess(true)
      }

      if (watchOwnerWallet && isWithdraw) {
        await CryptoTravelRuleService.submitTravelRuleWithdrawalWalletOwnership(transactionId)
        setIsSuccess(true)
      }

      if (isDeposit && !watchOwnerWallet) {
        await CryptoTravelRuleService.submitDepositTransactionTravelRuleInfo(transactionId, dataParams)
        setIsSuccess(true)
      }

      if (isWithdraw && !watchOwnerWallet) {
        await CryptoTravelRuleService.submitWithdrawalTransactionTravelRuleInfo(transactionId, dataParams)
        setIsSuccess(true)
      }

      await getTravelRuleDataFx()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const TruncatedAddress = (text: string | undefined) => {
    if (!text) return null

    const start = text.slice(0, -5)
    const end = text.slice(-5)

    return (
      <div className={styles.truncatedAddress}>
        <span className={styles.truncatedAddressStart}>{start}</span>
        <span>{end}</span>
      </div>
    )
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={styles.title}>Additional Information&nbsp;Required</div>
        <div className={styles.description}>
          Under the{' '}
          <span
            onClick={() => {
              window.open(HELP_LINKS.FAQ)
            }}
            className={styles.link}
          >
            “Travel Rule”
          </span>{' '}
          regulation, you are required to submit the information below for deposits
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.infoContainer}>
          <div className={styles.infoRow}>
            <div className={styles.infoText}>Amount {isDeposit ? 'Received' : 'Sent'}:</div>
            <div className={styles.infoSubText}>
              {addCommasToDisplayValue(travelRuleData.amount || '', 8)} {travelRuleData.assetId}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoText}>Date:</div>
            <div className={styles.infoSubText}>
              {travelRuleData.createdAt ? moment(travelRuleData.createdAt).format('MMMM DD, YYYY') : 'no date'}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoText}>{isDeposit ? 'From' : 'To'}:</div>
            <div className={styles.infoSubText}>
              {TruncatedAddress(travelRuleData?.sourceAddress || travelRuleData?.targetAddress)}
            </div>
          </div>
        </div>

        <FormProvider {...methods}>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.checkBoxWrap}>
              <label htmlFor='checkBox' className={styles.containerCheckBox}>
                I am the owner of this wallet address
                <input id='checkBox' type='checkbox' {...register('ownerWallet')} />
                <span className={styles.checkmark} />
              </label>
            </div>

            {watchOwnerWallet ? null : (
              <>
                <div className={styles.dropDownWrap}>
                  <label htmlFor='walletType' className={styles.inputLabel}>
                    Wallet Type
                  </label>
                  <div className={styles.positionRelative}>
                    <CommonDropdownBiz
                      data={walletTypeList}
                      itemComponent={itemComponentWalletType}
                      setSelectedData={handleSetSelectedWallet}
                      selectedData={selectedWallet}
                    />
                  </div>
                </div>

                {selectedWallet?.name === 'Other' && (
                  <div className={clsx('input-item-wrap-new', styles.inputWrap)}>
                    <label htmlFor='provider' className={styles.inputLabel}>
                      Specify the Wallet Provider {/* Wallet Provider */}
                    </label>
                    <input
                      id='provider'
                      type='text'
                      className={clsx('input-form', styles.boxShadow, { ['error']: errors.otherProviderName })}
                      placeholder='Type here..'
                      {...register('otherProviderName', { required: true })}
                    />
                  </div>
                )}

                <div className={clsx('input-item-wrap-new', styles.inputWrap)}>
                  <label htmlFor='name' className={styles.inputLabel}>
                    {isDeposit ? "Sender's" : "Receiver's"} Full Name / Company Name
                  </label>
                  <input
                    id='name'
                    type='text'
                    className={clsx('input-form', styles.boxShadow, { ['error']: errors.fullName })}
                    placeholder='Type here..'
                    {...register('fullName', { required: true })}
                  />
                </div>

                <div className={styles.dropDownWrap}>
                  <label htmlFor='country' className={styles.inputLabel}>
                    {isDeposit ? "Sender's" : "Receiver's"} Country
                  </label>
                  <div className={styles.positionRelative}>
                    <CommonDropdownBiz
                      data={countriesArray}
                      itemComponent={itemComponentCuntry}
                      setSelectedData={handleSetSelectedCountry}
                      selectedData={selectedCountry}
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.spacer} />

            <button className={'btn-new primary big'} type='submit' disabled={disabledBtn()}>
              {isLoading ? <span className='spinner-border' /> : 'Submit'}
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
