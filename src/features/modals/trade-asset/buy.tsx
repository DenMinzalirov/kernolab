import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { AssetsDropdown } from 'components'
import { StepBackBtn } from 'components/step-back-btn'
import { SuccessPairsComponent } from 'components/success-pairs-component'
import { pages } from 'constant'
import { getBalanceString, roundingBalance } from 'utils'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { handleError } from 'utils/error-handler'
import { AssetsServices, EVENT_NAMES, ExchangeInfo, useAnalytics } from 'wip/services'
import { Currencies, initApp } from 'wip/stores'
import { isBiz } from 'config'
import { $assetsCefiExchangeRates } from 'model/cef-rates-exchange'
import { $assetEurData, $assetsListData } from 'model/cefi-combain-assets-data'
import infoIconError from 'assets/icons/info-icon-error.svg'

import { AmountInputPairs } from './ammount-input-pairs'
import { ExchangeInputs } from './exchange'
import styles from './styles.module.scss'
import { TradeSummaryInfo } from './trade-summary-info'

const defaultValues = {
  toAmountCrypto: '',
  toAmountCurrency: '',
}

type Props = {
  asset: any
  isSuccessfully: string
  setIsSuccessfully: Dispatch<SetStateAction<string>>
  setShowNavBlock?: Dispatch<SetStateAction<boolean>>
}

export function Buy({ asset, isSuccessfully, setIsSuccessfully, setShowNavBlock }: Props) {
  const ratesCeFi = useUnit($assetsCefiExchangeRates)
  const assets = useUnit($assetsListData)
  const eurData = useUnit($assetEurData)

  const navigate = useNavigate()

  const { myLogEvent } = useAnalytics()

  const methods = useForm<ExchangeInputs>({ defaultValues })
  const {
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    setError,
    reset,
  } = methods

  const [selectedFromAsset, setSelectedFromAsset] = useState(asset)
  const [isCurrency, setIsCurrency] = useState(false)
  const [focusName, setFocusName] = useState('')
  const [requestError, setRequestError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [exchangeInfo, setExchangeInfo] = useState<ExchangeInfo | null>(null)
  // const [isSuccessfully, setIsSuccessfully] = useState(false)

  const watchToAmountCrypto = watch('toAmountCrypto')
  const watchToAmountCurrency = watch('toAmountCurrency')

  useEffect(() => {
    reset()
    setIsCurrency(false)
  }, [selectedFromAsset])

  const changeAmountCurrency = (): void => {
    setIsCurrency(prev => !prev)
  }

  const eurAssetRate = ratesCeFi.find(
    rate => rate.fromAssetId === 'EUR' && rate.toAssetId === selectedFromAsset.assetId
  )
  const eurAssetsList = ratesCeFi.filter(rate => rate.fromAssetId === 'EUR').map(assetItem => assetItem.toAssetId)

  const handleMax = (): void => {
    clearErrors()
    setValue('toAmountCrypto', roundingBalance((eurData.availableBalance * (eurAssetRate?.rate || 0)).toString(), 8))
    setValue('toAmountCurrency', roundingBalance(eurData.availableBalance.toString(), 2))
  }

  useEffect(() => {
    if (focusName === 'toAmountCrypto') {
      setValue(
        'toAmountCurrency',
        roundingBalance((+watchToAmountCrypto * (eurAssetRate ? 1 / eurAssetRate.rate : 0)).toString(), 2)
      )
      if (eurData.availableBalance * (eurAssetRate?.rate || 0) < +watchToAmountCrypto) {
        setError('toAmountCrypto', { type: 'manual', message: 'ERROR-Crypto' })
      } else clearErrors()
    }
    if (focusName === 'toAmountCurrency') {
      setValue(
        'toAmountCrypto',
        roundingBalance((+watchToAmountCurrency / (eurAssetRate ? 1 / eurAssetRate.rate : 0)).toString(), 8)
      )
      if (eurData.availableBalance < +watchToAmountCurrency) {
        setError('toAmountCrypto', { type: 'manual', message: 'ERROR' })
      } else clearErrors()
    }

    setRequestError('')
  }, [watchToAmountCurrency, watchToAmountCrypto])

  useEffect(() => {
    if (exchangeInfo && eurAssetRate && setShowNavBlock) {
      setShowNavBlock(false)
    }
  }, [exchangeInfo, eurAssetRate])

  const handleExchange = async (): Promise<void> => {
    setIsLoading(true)

    try {
      if (exchangeInfo) {
        await AssetsServices.exchangeAsset({
          amount: +watchToAmountCrypto / (eurAssetRate?.rate || 1),
          info: exchangeInfo as ExchangeInfo,
        })

        myLogEvent(EVENT_NAMES.WEB_EXCHANGE, { ...exchangeInfo })

        await initApp()

        setIsSuccessfully('Buy')
        setRequestError('')
      } else {
        const exchangeInfoData = await AssetsServices.exchangeInfoAsset({
          amount: +watchToAmountCrypto / (eurAssetRate?.rate || 1),
          from: 'EUR',
          to: selectedFromAsset.assetId,
        })
        setExchangeInfo(exchangeInfoData)
        setRequestError('')
      }
    } catch (error) {
      const errorMessage = handleError(error, true)
      errorMessage && setRequestError(errorMessage)
    }
    setIsLoading(false)
  }

  const backAction = (e: any) => {
    e.preventDefault()
    setExchangeInfo(null)
    setRequestError('')
    setShowNavBlock && setShowNavBlock(true)
  }

  const isErrorToAmountCrypto = errors.toAmountCrypto?.type === 'manual'

  if (isSuccessfully) {
    return (
      <SuccessPairsComponent
        title={'Purchase Completed Successfully'}
        description={'You can now view your updated balance in your portfolio'}
        btnText={'Go Back to Portfolio'}
        btnAction={() => navigate(pages.PORTFOLIO.path)}
      />
    )
  }

  return (
    <FormProvider {...methods}>
      {exchangeInfo && eurAssetRate ? (
        <TradeSummaryInfo
          exchangeInfo={exchangeInfo}
          fromToRate={eurAssetRate}
          selectedFromAsset={eurData}
          selectedToAsset={selectedFromAsset}
          watchFromAmountCrypto={(+watchToAmountCrypto / (eurAssetRate?.rate || 1)).toString()}
          title={'Buy Preview'}
        />
      ) : (
        <>
          <div className={styles.title}>Buy</div>
          <div className={styles.description}>Please enter the details for the transaction&nbsp;to&nbsp;proceed.</div>

          <div className={styles.amountRow}>
            <div className={styles.width50}>
              <div className={styles.enterAmount}>Buy</div>
              <AssetsDropdown
                assets={assets.filter(
                  item => item.assetId !== selectedFromAsset.assetId && eurAssetsList.includes(item.assetId)
                )}
                selectedData={selectedFromAsset}
                setSelectedData={setSelectedFromAsset}
              />
            </div>
            <div className={styles.width50}>
              <div className={styles.enterAmount}>Amount</div>
              <AmountInputPairs
                currencyAmount={watchToAmountCurrency}
                cryptoAmount={watchToAmountCrypto}
                asset={selectedFromAsset}
                changeAmountCurrency={changeAmountCurrency}
                isCurrency={isCurrency}
                direction='to'
                setFocusName={setFocusName}
                methods={methods}
                isEurFixed
                handleMax={handleMax}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 13, justifyContent: 'space-between' }}>
            <div className={clsx(styles.balance, isErrorToAmountCrypto ? styles.error : '')}>
              {isErrorToAmountCrypto ? <img src={infoIconError} alt={''} className={styles.errorIcon} /> : null}
              {isErrorToAmountCrypto ? 'Insufficient Balance:' : 'Balance:'}{' '}
              {getBalanceString(+eurData.availableBalance, 2)} EUR
            </div>
          </div>

          {isBiz ? (
            <div className={styles.enoughBalanceEur}>
              {isErrorToAmountCrypto ? 'Not enough fiat balance. Top up your balance to be able to buy.' : ' '}
            </div>
          ) : null}

          <div style={{ height: 58 }} />
          <div className={styles.enterAmount}>Total</div>
          <div className={styles.totalAmount}>
            {Currencies.EUR} {addCommasToDisplayValue(watchToAmountCurrency) || 0}
          </div>
          <div style={{ width: '100%', borderTop: '1px solid rgba(38, 40, 50, 0.1)', margin: '25px 0' }} />
          <div className={styles.conversionRate}>
            Conversion Rate: 1 {selectedFromAsset.assetId} = {Currencies.EUR} {eurAssetRate ? 1 / eurAssetRate.rate : 0}
          </div>
        </>
      )}

      {requestError ? <div className={styles.requestErrorText}>{requestError}</div> : <div style={{ height: 30 }} />}

      <div style={isBiz ? {} : { display: 'flex', flexDirection: 'row-reverse', gap: 10 }}>
        <button
          className={`btn-new primary big ${isErrorToAmountCrypto ? 'red' : ''}`}
          disabled={isLoading}
          onClick={async () => {
            if (isErrorToAmountCrypto) {
              handleMax()
            } else {
              await handleExchange()
            }
          }}
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {isLoading ? (
            <span className='spinner-border' />
          ) : // eslint-disable-next-line no-nested-ternary
          isErrorToAmountCrypto ? (
            'Top Up Balance'
          ) : exchangeInfo ? (
            'Confirm Buy'
          ) : (
            'Buy'
          )}
        </button>

        {exchangeInfo && eurAssetRate && isBiz && (
          <button className={clsx('btn-new', 'transparent', 'big', styles.backBtn)} onClick={backAction}>
            Back
          </button>
        )}

        {exchangeInfo && eurAssetRate && !isBiz && <StepBackBtn isLoading={false} backButtonFn={backAction} />}
      </div>
    </FormProvider>
  )
}
