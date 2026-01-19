import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { AssetsDropdown } from 'components'
import { CommonDropdownBiz } from 'components/common-dropdown-biz'
import { StepBackBtn } from 'components/step-back-btn'
import { SuccessPairsComponent } from 'components/success-pairs-component'
import { SuccessfullyBiz } from 'components/successfully-biz'
import { pages } from 'constant'
import { getBalanceString, roundingBalance } from 'utils'
import { handleError } from 'utils/error-handler'
import { AssetsServices, EVENT_NAMES, ExchangeInfo, useAnalytics } from 'wip/services'
import { initApp } from 'wip/stores'
import { isBiz } from 'config'
import { $assetsCefiExchangeRates } from 'model/cef-rates-exchange'
import { $assetEurData, $assetsListData, CombinedObject } from 'model/cefi-combain-assets-data'
import { $currency, LowercaseCurrencyType } from 'model/currency'
import ChangeIcon from 'assets/icons/ChangeIcon'
import mobileExchangeChangeIconSvh from 'assets/icons/mobile-exchange-change.svg'

import { AmountInput } from './ammount-input'
import { AmountInputMobile } from './ammount-input-mobile'
import { AmountInputPairs } from './ammount-input-pairs'
import { NavBlock } from './nav-block'
import styles from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'
import { TradeSummaryInfo } from './trade-summary-info'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

const defaultValues = {
  fromAmountCrypto: '',
  fromAmountCurrency: '',
  toAmountCrypto: '',
  toAmountCurrency: '',
}

export type ExchangeInputs = {
  fromAmountCrypto: string
  fromAmountCurrency: string
  toAmountCrypto: string
  toAmountCurrency: string
}

type Props = {
  asset: CombinedObject
  isSuccessfully: string
  setIsSuccessfully: Dispatch<SetStateAction<string>>
  setShowNavBlock?: Dispatch<SetStateAction<boolean>>
}

export function Exchange({ asset, isSuccessfully, setIsSuccessfully, setShowNavBlock }: Props) {
  const ratesCeFi = useUnit($assetsCefiExchangeRates)
  const assets = useUnit($assetsListData)
  const { myLogEvent } = useAnalytics()

  const { isMobilePairs } = useCurrentBreakpointPairs()

  const navigate = useNavigate()

  const currency = useUnit($currency)
  const currencyType: 'eur' | 'usd' = (currency?.type?.toLowerCase() as LowercaseCurrencyType) || 'eur'

  const [isLoading, setIsLoading] = useState(false)

  const methods = useForm<ExchangeInputs>({ defaultValues })
  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    clearErrors,
    register,
  } = methods

  const watchFromAmountCrypto = watch('fromAmountCrypto')
  const watchFromAmountCurrency = watch('fromAmountCurrency')
  const watchToAmountCrypto = watch('toAmountCrypto')
  const watchToAmountCurrency = watch('toAmountCurrency')

  const assetsToList = (selectedFromAsset: any): string[] => {
    return ratesCeFi
      .filter(assetRate => assetRate.fromAssetId === selectedFromAsset?.assetId)
      .map(assetRate => assetRate.toAssetId)
  }
  const assetsFromList = (selectedFromAsset: any): string[] => {
    return ratesCeFi
      .filter(assetRate => assetRate.toAssetId === selectedFromAsset.assetId)
      .map(assetRate => assetRate.fromAssetId)
  }

  const [selectedFromAsset, setSelectedFromAsset] = useState<CombinedObject | null | undefined>(null)
  const [selectedToAsset, setSelectedToAsset] = useState<CombinedObject | null | undefined>(null)
  const [isCurrency, setIsCurrency] = useState(false)
  const [focusName, setFocusName] = useState('')
  const [exchangeInfo, setExchangeInfo] = useState<ExchangeInfo | null>(null)

  const [requestError, setRequestError] = useState('')
  // const [isSuccessfully, setIsSuccessfully] = useState(false)

  // biz
  const [activePanelBiz, setActivePanelBiz] = useState('Exchange')
  const eurAsset = useUnit($assetEurData)

  //pairs
  // const [activePanelPairs, setActivePanelPairs] = useState('Exchange')

  useEffect(() => {
    if (isBiz) {
      if (activePanelBiz === 'Sell') {
        const fromAssetRates = ratesCeFi
          .filter(item => item.toAssetId === 'EUR')
          .map(assetRate => assetRate.fromAssetId)
        const fromAsset = assets.find(fromAssetItem => fromAssetRates.includes(fromAssetItem.assetId))
        setSelectedToAsset(eurAsset)
        fromAsset && setSelectedFromAsset(fromAsset)
      }
      if (activePanelBiz === 'Buy') {
        const toAssetRates = ratesCeFi.filter(item => item.fromAssetId === 'EUR').map(assetRate => assetRate.toAssetId)
        const toAsset = assets.find(toAssetItem => toAssetRates.includes(toAssetItem.assetId))
        setSelectedFromAsset(eurAsset)
        toAsset && setSelectedToAsset(toAsset)
      }
      if (activePanelBiz === 'Exchange') {
        if (!assetsToList(asset)?.length) {
          setSelectedFromAsset(assets.find(assetItem => assetsFromList(asset).includes(assetItem.assetId)))
          setSelectedToAsset(asset)
        } else {
          setSelectedFromAsset(asset)
          setSelectedToAsset(
            assets.find(
              assetItem => assetItem.assetId !== asset.assetId && assetsToList(asset).includes(assetItem.assetId)
            )
          )
        }
      }
    }
  }, [activePanelBiz])
  // end biz

  const fromToRate = ratesCeFi.find(
    rateCeFi => rateCeFi.fromAssetId === selectedFromAsset?.assetId && rateCeFi.toAssetId === selectedToAsset?.assetId
  )

  const toFromRate = ratesCeFi.find(
    rateCeFi => rateCeFi.fromAssetId === selectedToAsset?.assetId && rateCeFi.toAssetId === selectedFromAsset?.assetId
  )

  useEffect(() => {
    if (!assetsToList(asset)?.length) {
      setSelectedFromAsset(assets.find(assetItem => assetsFromList(asset).includes(assetItem.assetId)))
      setSelectedToAsset(asset)
    } else {
      setSelectedFromAsset(asset)
      setSelectedToAsset(
        assets.find(assetItem => assetItem.assetId !== asset.assetId && assetsToList(asset).includes(assetItem.assetId))
      )
    }
  }, [asset])

  useEffect(() => {
    reset()
    setIsCurrency(false)
  }, [selectedFromAsset, selectedToAsset])

  useEffect(() => {
    if (exchangeInfo && fromToRate && setShowNavBlock) {
      setShowNavBlock(false)
    }
  }, [exchangeInfo, fromToRate])

  useEffect(() => {
    if (focusName === 'fromAmountCrypto') {
      setValue(
        'fromAmountCurrency',
        roundingBalance((+watchFromAmountCrypto * (selectedFromAsset?.[currencyType]?.price || 0)).toString(), 2)
      )
      setValue(
        'toAmountCurrency',
        roundingBalance((+watchFromAmountCrypto * (selectedFromAsset?.[currencyType]?.price || 0)).toString(), 2)
      )
      setValue('toAmountCrypto', roundingBalance((+watchFromAmountCrypto * (fromToRate?.rate || 0)).toString(), 8))
    }
    if (focusName === 'fromAmountCurrency') {
      setValue(
        'fromAmountCrypto',
        roundingBalance((+watchFromAmountCurrency / (selectedFromAsset?.[currencyType]?.price || 0)).toString(), 8)
      )
      setValue('toAmountCurrency', roundingBalance(watchFromAmountCurrency, 2))
      setValue('toAmountCrypto', roundingBalance((+watchFromAmountCrypto * (fromToRate?.rate || 0)).toString(), 8))
    }
    if (focusName === 'toAmountCrypto') {
      setValue(
        'toAmountCurrency',
        roundingBalance((+watchToAmountCrypto * (selectedToAsset?.[currencyType]?.price || 0)).toString(), 2)
      )
      setValue(
        'fromAmountCurrency',
        roundingBalance((+watchToAmountCrypto * (selectedToAsset?.[currencyType]?.price || 0)).toString(), 2)
      )
      setValue('fromAmountCrypto', roundingBalance((+watchToAmountCrypto * (toFromRate?.rate || 0)).toString(), 2))
    }
    if (focusName === 'toAmountCurrency') {
      setValue(
        'toAmountCrypto',
        roundingBalance((+watchToAmountCurrency / (selectedToAsset?.[currencyType]?.price || 0)).toString(), 8)
      )
      setValue('fromAmountCurrency', roundingBalance(watchToAmountCurrency, 2))
      setValue('fromAmountCrypto', roundingBalance((+watchToAmountCrypto * (toFromRate?.rate || 0)).toString(), 8))
    }

    clearErrors()
    setRequestError('')
  }, [watchFromAmountCurrency, watchFromAmountCrypto, watchToAmountCurrency, watchToAmountCrypto])

  const changeAmountCurrency = (): void => {
    setIsCurrency(prev => !prev)
  }

  const handleMax = (): void => {
    if (isCurrency) {
      setValue(
        'fromAmountCurrency',
        roundingBalance(
          ((selectedFromAsset?.availableBalance || 0) * (selectedFromAsset?.[currencyType]?.price || 0)).toString(),
          2
        )
      )
      setValue('fromAmountCrypto', roundingBalance(selectedFromAsset?.availableBalance.toString(), 8))
      setValue(
        'toAmountCurrency',
        roundingBalance(
          ((selectedFromAsset?.availableBalance || 0) * (selectedFromAsset?.[currencyType]?.price || 0)).toString(),
          2
        )
      )
      setValue('toAmountCrypto', ((selectedFromAsset?.availableBalance || 0) * (fromToRate?.rate || 0)).toString())
    } else {
      setValue('fromAmountCrypto', roundingBalance(selectedFromAsset?.availableBalance?.toString() || '0', 8))
      setValue(
        'fromAmountCurrency',
        roundingBalance(
          ((selectedFromAsset?.availableBalance || 0) * (selectedFromAsset?.[currencyType]?.price || 0)).toString(),
          2
        )
      )
      setValue(
        'toAmountCurrency',
        roundingBalance(
          ((selectedFromAsset?.availableBalance || 0) * (selectedFromAsset?.[currencyType]?.price || 0)).toString(),
          2
        )
      )
      setValue(
        'toAmountCrypto',
        roundingBalance(((selectedFromAsset?.availableBalance || 0) * (fromToRate?.rate || 0)).toString(), 8)
      )
    }
  }

  const handleChange = (): void => {
    if (!assetsToList(selectedToAsset).includes(selectedFromAsset?.assetId || '')) return

    reset()
    setSelectedToAsset(selectedFromAsset)
    setSelectedFromAsset(selectedToAsset)
  }

  const changeFromAsset = (assetItem: any): void => {
    if (!assetsToList(assetItem).includes(selectedToAsset?.assetId || '')) {
      setSelectedToAsset(assets.find(assetOrigin => assetsToList(assetItem).includes(assetOrigin.assetId)))
    }
    setSelectedFromAsset(assetItem)
  }

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
        setIsSuccessfully('Exchange')
      } else {
        const exchangeInfoData = await AssetsServices.exchangeInfoAsset({
          amount: +watchFromAmountCrypto,
          from: selectedFromAsset?.assetId || '',
          to: selectedToAsset?.assetId || '',
        })
        setExchangeInfo(exchangeInfoData)
      }
    } catch (error) {
      const errorMessage = handleError(error, true)
      errorMessage && setRequestError(errorMessage)
    }
    setIsLoading(false)
  }

  const inputErrorHandler = (): string => {
    if (+watchFromAmountCrypto > +(selectedFromAsset?.availableBalance || 0)) {
      return 'Not Enough Balance'
    }
    if (Object.keys(errors).some(error => ['fromAmountCrypto', 'fromAmountCurrency'].includes(error))) {
      return 'Required'
    }
    return ''
  }

  const btnName = () => {
    if (isBiz) {
      if (exchangeInfo) return 'Confirm & Exchange'
      return 'Continue'
    }
    return exchangeInfo ? 'Confirm & Exchange' : 'Exchange'
  }

  const fromLabel = () => {
    if (isBiz) {
      if (activePanelBiz === 'Buy') return 'Sell'
      if (activePanelBiz === 'Sell') return 'Sell'
    }
    return 'From'
  }

  const toLabel = () => {
    if (isBiz) {
      if (activePanelBiz === 'Buy') return 'Buy'
      if (activePanelBiz === 'Sell') return 'Receive'
    }
    return 'To'
  }

  const backAction = (e: any) => {
    e.preventDefault()
    setExchangeInfo(null)
    setRequestError('')
    setShowNavBlock && setShowNavBlock(true)
  }

  if (isSuccessfully) {
    if (isBiz) {
      return (
        <div className={stylesBiz.contentSuccessfully}>
          <SuccessfullyBiz
            textData={{
              title: 'Exchange Completed Successfully',
              description: 'the exchanged cryptocurrency has been transferred to your wallet.',
              btnText: 'Return to Trade Dashboard',
            }}
            action={() => {
              setValue('fromAmountCrypto', '')
              setValue('fromAmountCurrency', '')
              setValue('toAmountCrypto', '')
              setValue('toAmountCurrency', '')
              setIsSuccessfully('')
              setExchangeInfo(null)
              setRequestError('')
            }}
          />
        </div>
      )
    }
    return (
      <SuccessPairsComponent
        title={'Exchange Completed Successfully'}
        description={'You can now view your updated balance in your portfolio'}
        btnText={'Go Back to Portfolio'}
        btnAction={() => navigate(pages.PORTFOLIO.path)}
      />
    )
  }

  if (!selectedFromAsset) return null

  const assetDropDownComponentBiz = (data: CombinedObject, changeAction: any) => {
    if (!data) return <div className={stylesBiz.dropDownPlaceholderText}>Choose from the list</div>

    if (data.assetName === 'clear') {
      return (
        <div className={stylesBiz.dropDownCleareWrap}>
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
          if (data.assetId === 'EUR') return
          changeAction(data)
        }}
        className={stylesBiz.itemWrap}
      >
        <img className='asset-icon' style={{ height: 30, width: 30 }} src={data.icon} alt='' />
        {data.assetName} - {data.assetId}
      </div>
    )
  }

  const bizDropDown = (data: 'from' | 'to') => {
    if (data === 'to') {
      return (
        <div style={{ position: 'relative' }}>
          <CommonDropdownBiz
            data={assets.filter(item => {
              return (
                item.assetId !== selectedToAsset?.assetId && assetsFromList(selectedFromAsset).includes(item.assetId)
              )
            })}
            itemComponent={(dataDrop: CombinedObject) => assetDropDownComponentBiz(dataDrop, setSelectedToAsset)}
            selectedData={selectedToAsset}
            isBlock={selectedToAsset?.assetId === 'EUR'}
          />
        </div>
      )
    }

    return (
      <div style={{ position: 'relative' }}>
        <CommonDropdownBiz
          data={assets.filter(item => {
            return item.assetId !== selectedFromAsset?.assetId && assetsFromList(asset).includes(item.assetId)
          })}
          itemComponent={(dataDrop: CombinedObject) => assetDropDownComponentBiz(dataDrop, changeFromAsset)}
          selectedData={selectedFromAsset}
          isBlock={selectedFromAsset?.assetId === 'EUR'}
        />
      </div>
    )
  }

  const fideumDropDown = (data: 'from' | 'to') => {
    if (data === 'to') {
      return (
        <AssetsDropdown
          assets={assets.filter((assetTo: any) => {
            return (
              assetTo.assetId !== selectedToAsset?.assetId && assetsToList(selectedFromAsset).includes(assetTo.assetId)
            )
          })}
          selectedData={selectedToAsset}
          setSelectedData={setSelectedToAsset}
        />
      )
    }

    return (
      <AssetsDropdown
        assets={assets.filter(item => {
          return item.assetId !== selectedFromAsset?.assetId && assetsFromList(asset).includes(item.assetId)
        })}
        selectedData={selectedFromAsset}
        setSelectedData={changeFromAsset}
      />
    )
  }

  return (
    <FormProvider {...methods}>
      {isBiz ? <div className={stylesBiz.title}>{exchangeInfo ? 'Confirm Details' : 'Trade Crypto'}</div> : null}
      {isBiz && !exchangeInfo ? (
        <NavBlock asset={asset} setActivePanel={setActivePanelBiz} activePanel={activePanelBiz} />
      ) : null}

      <form
        onSubmit={handleSubmit(handleExchange)}
        style={isBiz ? { flexGrow: 1, display: 'flex', flexDirection: 'column' } : {}}
      >
        <div className={isBiz ? stylesBiz.inputWrap : styles.inputWrap}>
          {exchangeInfo && fromToRate ? (
            <TradeSummaryInfo
              exchangeInfo={exchangeInfo}
              fromToRate={fromToRate}
              selectedFromAsset={selectedFromAsset}
              selectedToAsset={selectedToAsset}
              watchFromAmountCrypto={watchFromAmountCrypto}
              setExchangeInfo={setExchangeInfo}
              watchToAmountCurrency={watchToAmountCurrency}
              watchFromAmountCurrency={watchFromAmountCurrency}
            />
          ) : (
            <>
              {isBiz ? null : (
                <>
                  <div className={styles.title}>Exchange</div>
                  <div className={styles.description}>
                    Please enter the details for the transaction&nbsp;to&nbsp;proceed.
                  </div>
                </>
              )}

              <div className={isBiz ? styles.inputDesktopWrap : ''}>
                <div className={styles.amountRow}>
                  <div className={isBiz ? stylesBiz.width50 : styles.width50}>
                    <div className={isBiz ? stylesBiz.enterAmount : styles.enterAmount}>{fromLabel()}</div>
                    {isBiz ? bizDropDown('from') : fideumDropDown('from')}
                  </div>

                  <div className={isBiz ? stylesBiz.width50 : styles.width50}>
                    <div
                      className={isBiz ? stylesBiz.enterAmount : styles.enterAmount}
                      style={inputErrorHandler() ? { color: 'red' } : {}}
                    >
                      {inputErrorHandler() || 'Amount'}
                    </div>

                    {isBiz ? (
                      <AmountInput
                        currencyAmount={watchFromAmountCurrency}
                        cryptoAmount={watchFromAmountCrypto}
                        asset={selectedFromAsset}
                        changeAmountCurrency={changeAmountCurrency}
                        isCurrency={isCurrency}
                        direction='from'
                        setFocusName={setFocusName}
                        methods={methods}
                        handleMax={handleMax}
                      />
                    ) : null}

                    {!isBiz ? (
                      <AmountInputPairs
                        currencyAmount={watchFromAmountCurrency}
                        cryptoAmount={watchFromAmountCrypto}
                        asset={selectedFromAsset}
                        changeAmountCurrency={changeAmountCurrency}
                        isCurrency={isCurrency}
                        direction='from'
                        setFocusName={setFocusName}
                        methods={methods}
                        handleMax={handleMax}
                      />
                    ) : null}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: 88,
                    ...(isMobilePairs ? { width: '100%' } : {}),
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      ...(isMobilePairs ? { width: '100%' } : {}),
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: 13,
                        ...(isMobilePairs ? { justifyContent: 'space-between' } : {}),
                      }}
                    >
                      <div className={isBiz ? stylesBiz.enterAmount : styles.balance}>
                        Balance: {getBalanceString(+selectedFromAsset.availableBalance, 8)} {selectedFromAsset.symbol}
                      </div>
                    </div>
                    <div
                      style={isBiz ? { marginBottom: 12 } : {}}
                      className={isBiz ? stylesBiz.enterAmount : styles.enterAmount}
                    >
                      {toLabel()}
                    </div>
                  </div>
                  <div
                    style={{
                      display: ['Buy', 'Sell'].includes(activePanelBiz) || isMobilePairs ? 'none' : 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 36,
                    }}
                  >
                    <div style={{ flexGrow: 1, borderLeft: '1px solid var(--Deep-Space)', width: 1 }} />
                    <div
                      onClick={handleChange}
                      style={{
                        border: '1px solid var(--Deep-Space)',
                        borderRadius: '100%',
                        height: 26,
                        width: 26,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        opacity: assetsToList(selectedToAsset).includes(selectedFromAsset.assetId) ? 1 : 0.2,
                      }}
                    >
                      <ChangeIcon fill='var(--Deep-Space)' />
                    </div>
                    <div style={{ flexGrow: 1, borderRight: '1px solid var(--Deep-Space)', width: 1 }} />
                  </div>
                </div>
                <div className={styles.amountRow}>
                  <div className={isBiz ? stylesBiz.width50 : styles.width50}>
                    {isBiz ? bizDropDown('to') : fideumDropDown('to')}
                  </div>
                  <div className={isBiz ? stylesBiz.width50 : styles.width50}>
                    {!isBiz && isMobilePairs ? (
                      <div className={isBiz ? stylesBiz.enterAmount : styles.enterAmount}>Amount</div>
                    ) : null}

                    {isBiz ? (
                      <AmountInput
                        currencyAmount={watchToAmountCurrency}
                        cryptoAmount={watchToAmountCrypto}
                        asset={selectedToAsset}
                        changeAmountCurrency={changeAmountCurrency}
                        isCurrency={isCurrency}
                        direction='to'
                        setFocusName={setFocusName}
                        methods={methods}
                        handleMax={handleMax}
                      />
                    ) : null}

                    {!isBiz ? (
                      <AmountInputPairs
                        currencyAmount={watchToAmountCurrency}
                        cryptoAmount={watchToAmountCrypto}
                        asset={selectedToAsset}
                        changeAmountCurrency={changeAmountCurrency}
                        isCurrency={isCurrency}
                        direction='to'
                        setFocusName={setFocusName}
                        methods={methods}
                        handleMax={handleMax}
                      />
                    ) : null}
                  </div>
                </div>
                <div style={{ marginTop: 13 }} className={isBiz ? stylesBiz.enterAmount : styles.balance}>
                  Balance: {getBalanceString(selectedToAsset ? +selectedToAsset.availableBalance : 0, 8)}{' '}
                  {selectedToAsset?.symbol || ''}
                </div>

                {isBiz ? null : <div style={{ width: '100%', margin: '50px 0' }} />}
                <div className={isBiz ? clsx(stylesBiz.enterAmount, stylesBiz.textConversion) : styles.conversionRate}>
                  Conversion Rate: 1 {selectedFromAsset.assetId} = {getBalanceString(Number(fromToRate?.rate ?? 0), 8)}{' '}
                  {selectedToAsset?.assetId || ''}
                </div>

                {isBiz ? <div style={{ flexGrow: 1 }} /> : null}

                {requestError ? (
                  <div className={styles.requestErrorText}>{requestError}</div>
                ) : (
                  <div style={{ height: 30 }} />
                )}
              </div>

              <div style={isBiz ? {} : { display: 'none' }} className={stylesBiz.mobileBlockInputWrap}>
                <div className={stylesBiz.mobileBlockInput}>
                  <AmountInputMobile
                    methods={methods}
                    asset={selectedFromAsset}
                    direction='from'
                    setFocusName={setFocusName}
                    currencyAmount={watchFromAmountCurrency}
                    assetsList={[...assets, eurAsset].filter(item => {
                      return item.assetId !== selectedFromAsset?.assetId && assetsFromList(asset).includes(item.assetId)
                    })}
                    setSelectedData={changeFromAsset}
                  />
                  <div onClick={handleChange} className={stylesBiz.mobileChangeLineWrap}>
                    <div className={stylesBiz.mobileChangeLine} />
                    <img src={mobileExchangeChangeIconSvh} alt={''} style={{ cursor: 'pointer' }} />
                    <div className={stylesBiz.mobileChangeLine} />
                  </div>
                  <AmountInputMobile
                    methods={methods}
                    asset={selectedToAsset!}
                    direction='to'
                    setFocusName={setFocusName}
                    currencyAmount={watchToAmountCurrency}
                    assetsList={[...assets, eurAsset].filter(item => {
                      return (
                        item.assetId !== selectedToAsset?.assetId &&
                        assetsFromList(selectedFromAsset).includes(item.assetId)
                      )
                    })}
                    setSelectedData={setSelectedToAsset}
                  />
                </div>
                <div style={{ flexGrow: 1 }} />
                <div className={isBiz ? clsx(stylesBiz.enterAmount, stylesBiz.textConversion) : styles.conversionRate}>
                  Conversion Rate: 1 {selectedFromAsset.assetId} = {getBalanceString(Number(fromToRate?.rate ?? 0), 8)}{' '}
                  {selectedToAsset?.assetId || ''}
                </div>
                <div style={{ height: 48 }} />
              </div>
            </>
          )}
        </div>

        <div style={isBiz ? {} : { display: 'flex', flexDirection: 'row-reverse', gap: 10, alignItems: 'flex-end' }}>
          <button
            type='submit'
            className={isBiz ? 'btn-biz blue height-50' : clsx('btn-new primary big', styles.mainExchangeBtn)}
            disabled={isLoading || !!inputErrorHandler()}
          >
            {isLoading ? <span className='spinner-border' /> : btnName()}
          </button>

          {exchangeInfo && fromToRate && isBiz && (
            <button
              className={
                isBiz
                  ? clsx('btn-biz transparent height-50 showMd', stylesBiz.backBtn)
                  : clsx('btn-new', 'transparent', 'big', styles.backBtn)
              }
              onClick={backAction}
            >
              Back
            </button>
          )}

          {exchangeInfo && fromToRate && !isBiz && <StepBackBtn isLoading={false} backButtonFn={backAction} />}
        </div>
      </form>
    </FormProvider>
  )
}
