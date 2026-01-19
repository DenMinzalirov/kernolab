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
import { $assetEurData, $assetsListData, CombinedObject } from 'model/cefi-combain-assets-data'
import infoIconError from 'assets/icons/info-icon-error.svg'

import { AmountInputPairs } from './ammount-input-pairs'
import { ExchangeInputs } from './exchange'
import styles from './styles.module.scss'
import { TradeSummaryInfo } from './trade-summary-info'

const defaultValues = {
  fromAmountCrypto: '',
  fromAmountCurrency: '',
}

type Props = {
  asset: CombinedObject
  isSuccessfully: string
  setIsSuccessfully: Dispatch<SetStateAction<string>>
  setShowNavBlock?: Dispatch<SetStateAction<boolean>>
}

export function Sell({ asset, isSuccessfully, setIsSuccessfully, setShowNavBlock }: Props) {
  const ratesCeFi = useUnit($assetsCefiExchangeRates)
  const assets = useUnit($assetsListData)
  const eurData = useUnit($assetEurData)
  const { myLogEvent } = useAnalytics()

  const navigate = useNavigate()

  const methods = useForm<ExchangeInputs>({ defaultValues })
  const {
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    setError,
    reset,
  } = methods

  const [selectedFromAsset, setSelectedFromAsset] = useState<any | null>(asset)

  const assetRateToEUR = ratesCeFi?.find(
    assetRaw => assetRaw.toAssetId === 'EUR' && assetRaw.fromAssetId === selectedFromAsset.assetId
  )

  const eurRate = assetRateToEUR ? assetRateToEUR.rate : 0

  const [isCurrency, setIsCurrency] = useState(false)
  const [focusName, setFocusName] = useState('')
  const [requestError, setRequestError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [exchangeInfo, setExchangeInfo] = useState<ExchangeInfo | null>(null)
  // const [isSuccessfully, setIsSuccessfully] = useState(false)

  useEffect(() => {
    reset()
  }, [selectedFromAsset])

  const watchFromAmountCrypto = watch('fromAmountCrypto')
  const watchFromAmountCurrency = watch('fromAmountCurrency')

  const changeAmountCurrency = (): void => {
    setIsCurrency(prev => !prev)
  }

  const assetEurRate = ratesCeFi.find(
    rate => rate.toAssetId === 'EUR' && rate.fromAssetId === selectedFromAsset.assetId
  )
  const eurAssetsList = ratesCeFi.filter(rate => rate.toAssetId === 'EUR').map(assetItem => assetItem.fromAssetId)

  const handleMax = (): void => {
    clearErrors()
    setValue('fromAmountCrypto', roundingBalance(selectedFromAsset.availableBalance, 8))
    setValue('fromAmountCurrency', roundingBalance((selectedFromAsset.availableBalance * (eurRate || 0)).toString(), 2))
  }

  useEffect(() => {
    if (focusName === 'fromAmountCrypto') {
      setValue('fromAmountCurrency', roundingBalance((+watchFromAmountCrypto * (eurRate || 1)).toString(), 2))
    }
    if (focusName === 'fromAmountCurrency') {
      setValue('fromAmountCrypto', roundingBalance((+watchFromAmountCurrency / (eurRate || 0)).toString(), 8))
    }

    if (+watchFromAmountCrypto > selectedFromAsset.availableBalance) {
      setError('fromAmountCrypto', { type: 'manual', message: 'ERROR-Crypto' })
    } else clearErrors()

    setRequestError('')
  }, [watchFromAmountCurrency, watchFromAmountCrypto])

  useEffect(() => {
    if (exchangeInfo && assetEurRate && setShowNavBlock) {
      setShowNavBlock(false)
    }
  }, [exchangeInfo, assetEurRate])

  const handleExchange = async (): Promise<void> => {
    setIsLoading(true)

    try {
      if (exchangeInfo) {
        await AssetsServices.exchangeAsset({
          amount: +watchFromAmountCrypto,
          info: exchangeInfo as ExchangeInfo,
        })

        myLogEvent(EVENT_NAMES.WEB_EXCHANGE, { ...exchangeInfo })

        await initApp()

        setIsSuccessfully('Sell')
        setRequestError('')
      } else {
        const exchangeInfoData = await AssetsServices.exchangeInfoAsset({
          amount: +watchFromAmountCrypto,
          from: selectedFromAsset.assetId,
          to: 'EUR',
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

  if (isSuccessfully) {
    return (
      <SuccessPairsComponent
        title={'Sale Completed Successfully'}
        description={'You can now view your updated balance in your portfolio'}
        btnText={'Go Back to Portfolio'}
        btnAction={() => navigate(pages.PORTFOLIO.path)}
      />
    )
  }

  function calculateEurValue(balance: number, rate: number): number {
    return parseFloat((balance * rate).toFixed(2))
  }

  const eurValue = calculateEurValue(+selectedFromAsset.availableBalance, eurRate)
  const eurValueFormat = addCommasToDisplayValue(eurValue.toString(), 2)

  const isErrorFromAmountCrypto = errors.fromAmountCrypto?.type === 'manual'

  return (
    <FormProvider {...methods}>
      {exchangeInfo && assetEurRate ? (
        <TradeSummaryInfo
          exchangeInfo={exchangeInfo}
          fromToRate={assetEurRate}
          selectedFromAsset={eurData}
          selectedToAsset={selectedFromAsset}
          watchFromAmountCrypto={watchFromAmountCrypto}
          title={'Sell Preview'}
        />
      ) : (
        <>
          <div className={styles.title}>Sell</div>
          <div className={styles.description}>Please enter the details for the transaction&nbsp;to&nbsp;proceed.</div>

          <div className={styles.amountRow}>
            <div className={styles.width50}>
              <div className={styles.enterAmount}>Sell</div>
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
                currencyAmount={watchFromAmountCurrency}
                cryptoAmount={watchFromAmountCrypto}
                asset={selectedFromAsset}
                changeAmountCurrency={changeAmountCurrency}
                isCurrency={isCurrency}
                direction='from'
                setFocusName={setFocusName}
                methods={methods}
                isEurFixed
                handleMax={handleMax}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 13, justifyContent: 'space-between' }}>
            <div className={clsx(styles.balance, isErrorFromAmountCrypto ? styles.error : '')}>
              {isErrorFromAmountCrypto ? <img src={infoIconError} alt={''} className={styles.errorIcon} /> : null}
              {isErrorFromAmountCrypto ? 'Insufficient Balance:' : 'Balance:'}{' '}
              {getBalanceString(+selectedFromAsset.availableBalance, 8)} {selectedFromAsset.assetId} / {eurValueFormat}{' '}
              EUR
            </div>
          </div>

          {isBiz ? (
            <div className={styles.enoughBalanceEur}>
              {isErrorFromAmountCrypto ? 'Not enough fiat balance. Top up your balance to be able to buy.' : ' '}
            </div>
          ) : null}

          <div style={{ height: 58 }} />
          <div className={styles.enterAmount}>Total</div>
          <div className={styles.totalAmount}>
            {Currencies.EUR} {watchFromAmountCurrency || 0}
          </div>
          <div style={{ width: '100%', borderTop: '1px solid rgba(38, 40, 50, 0.1)', margin: '25px 0' }} />
          <div className={styles.conversionRate}>
            Conversion Rate: 1 {selectedFromAsset.assetId} = {Currencies.EUR} {eurRate}
          </div>
        </>
      )}

      {requestError ? <div className={styles.requestErrorText}>{requestError}</div> : <div style={{ height: 30 }} />}

      <div style={isBiz ? {} : { display: 'flex', flexDirection: 'row-reverse', gap: 10 }}>
        <button
          className={`btn-new primary big ${isErrorFromAmountCrypto ? 'red' : ''}`}
          disabled={isLoading}
          onClick={async () => {
            if (isErrorFromAmountCrypto) {
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
          isErrorFromAmountCrypto ? (
            'Top Up Balance'
          ) : exchangeInfo ? (
            'Confirm Sell'
          ) : (
            'Sell'
          )}
        </button>

        {exchangeInfo && assetEurRate && isBiz && (
          <button className={clsx('btn-new', 'transparent', 'big', styles.backBtn)} onClick={backAction}>
            Back
          </button>
        )}

        {exchangeInfo && assetEurRate && !isBiz && <StepBackBtn isLoading={false} backButtonFn={backAction} />}
      </div>
    </FormProvider>
  )
}
