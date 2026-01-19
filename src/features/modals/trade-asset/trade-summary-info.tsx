import React from 'react'
import { useUnit } from 'effector-react'

import { BackButtonBiz } from 'components/back-button-biz'
import { getBalanceString } from 'utils'
import { ExchangeInfo, ExchangeRate } from 'wip/services'
import { isBiz } from 'config'
import { $currency } from 'model/currency'

import styles from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'

export interface TradeSummaryInfo {
  exchangeInfo: ExchangeInfo
  fromToRate: ExchangeRate
  selectedFromAsset: any
  selectedToAsset: any
  watchFromAmountCrypto: string
  setExchangeInfo?: React.Dispatch<React.SetStateAction<ExchangeInfo | null>>
  watchFromAmountCurrency?: string
  watchToAmountCurrency?: string
  title?: string
}

export function TradeSummaryInfo({
  exchangeInfo,
  fromToRate,
  selectedFromAsset,
  selectedToAsset,
  watchFromAmountCrypto,
  setExchangeInfo,
  watchFromAmountCurrency,
  watchToAmountCurrency,
  title,
}: TradeSummaryInfo) {
  const currency = useUnit($currency)

  const handleBack = () => {
    setExchangeInfo && setExchangeInfo(null)
  }

  return (
    <>
      <div className={isBiz ? 'display-none' : styles.summaryWrap}>
        <div className={styles.title}>{title ? title : 'Exchange Preview'}</div>
        <div className={styles.descriptionPreviev}>Make sure the following information is correct.</div>
        <div>
          <div className={styles.line} />
          <div className={styles.height24} />

          <div className={styles.enterAmount}>From</div>
          <div className={styles.titleAmount}>
            {exchangeInfo.fromAssetId} {getBalanceString(+watchFromAmountCrypto, 8)}
          </div>
          <div style={{ height: 27 }} />
          <div className={styles.enterAmount}>To</div>
          <div className={styles.titleAmount}>
            {exchangeInfo.toAssetId} {getBalanceString(+exchangeInfo.remainingAmount, 8)}
          </div>
          <div className={styles.height24} />
          <div className={styles.line} />
          <div className={styles.height24} />

          <div className={styles.conversionRate}>
            Conversion Rate: 1 {selectedFromAsset.assetId} = {getBalanceString(Number(fromToRate?.rate || 0), 8)}{' '}
            {selectedToAsset.assetId}
          </div>
          <div style={{ height: 5 }} />
          <div className={styles.conversionRate}>
            Transaction Fee: {getBalanceString(+exchangeInfo.totalFeeAmount, 8)} {exchangeInfo.toAssetId}
          </div>

          <div style={{ height: 30 }} />
        </div>
      </div>

      <div className={isBiz ? stylesBiz.summaryWrap : 'display-none'}>
        <div className={stylesBiz.backWrap}>
          <BackButtonBiz backFn={handleBack} padding={30} />
        </div>
        <div className={stylesBiz.confirmDataWrap}>
          <div className={stylesBiz.fromToRow}>
            <div className={stylesBiz.enterAmount}>From</div>
            <div className={stylesBiz.fromToAmountWrap}>
              <div className={stylesBiz.cryptoAmount}>
                {exchangeInfo.fromAssetId} {watchFromAmountCrypto}
              </div>
              <div className={stylesBiz.enterAmount}>
                {currency.symbol} {watchFromAmountCurrency}
              </div>
            </div>
          </div>
          <div className={stylesBiz.ratesWrap}>
            <div className={stylesBiz.conversionRate}>
              <div className={stylesBiz.enterAmount}>Transaction Fee</div>
              <div className={stylesBiz.conversionAmount}>
                {getBalanceString(+exchangeInfo.totalFeeAmount, 8)} {exchangeInfo.toAssetId}
              </div>
            </div>
            <div className={stylesBiz.conversionRate}>
              <div className={stylesBiz.enterAmount}>Conversion Rate</div>
              <div className={stylesBiz.conversionAmount}>
                1 {selectedFromAsset.assetId} = {getBalanceString(Number(fromToRate?.rate || 0), 8)}{' '}
                {selectedToAsset.assetId}
              </div>
            </div>
          </div>
          <div className={stylesBiz.fromToRow}>
            <div className={stylesBiz.enterAmount}>To</div>
            <div className={stylesBiz.fromToAmountWrap}>
              <div className={stylesBiz.cryptoAmount}>
                {exchangeInfo.toAssetId} {getBalanceString(+exchangeInfo.remainingAmount, 8)}
              </div>
              <div className={stylesBiz.enterAmount}>
                {currency.symbol} {watchToAmountCurrency}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
