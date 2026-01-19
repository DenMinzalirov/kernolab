import React from 'react'
import { useUnit } from 'effector-react'

import { HintData } from 'features/launchpad-purchase'

import { $assetsListData } from '../../model/cefi-combain-assets-data'
import { $currency } from '../../model/currency'
import { addCommasToDisplayValue } from '../../utils/add-commas-to-display-value'
import styles from './styles.module.scss'

type HintProps = {
  hintData: HintData
}

export function LaunchpadCalculatedHint({ hintData }: HintProps) {
  const assets = useUnit($assetsListData)
  const FIAsset = assets.find(asset => asset.assetId === 'FI')

  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'

  const asset = assets.find(assetItem => assetItem.assetId === hintData?.buyingAssetId)

  const rateConvert = (rate: number, value: number) => {
    return addCommasToDisplayValue((value / rate).toString(), 2)
  }

  return (
    <div className={styles.hint}>
      <div>
        Allocation purchase: {addCommasToDisplayValue(hintData.allocationPurchase.toString(), 2)}{' '}
        {hintData.buyingAssetId}
      </div>
      {hintData.tierFeePercent && hintData.allocationPurchase ? (
        <div>
          Tier {hintData.targetTier} Fee ({hintData.tierFeePercent * 100 || 1}%):{' '}
          {addCommasToDisplayValue(hintData.tierFee.toString(), 2)} {hintData.buyingAssetId}
        </div>
      ) : null}

      {/*<div>*/}
      {/*  Equivalent:{' '}*/}
      {/*  <span className={styles.descriptionCurrency}>*/}
      {/*    ≈{currency.symbol}*/}
      {/*    {asset*/}
      {/*      ? addCommasToDisplayValue((asset[currencyType].price * +hintData.allocationPurchase).toString(), 2)*/}
      {/*      : 0}*/}
      {/*  </span>*/}
      {/*</div>*/}

      {hintData.missingFiAmount < 0 ? (
        <div>
          Upgrade to Tier {hintData.targetTier}: {addCommasToDisplayValue(hintData.lockedFi.toString(), 6)} FI
        </div>
      ) : null}

      {hintData.buyingAssetCount ? (
        <div>
          Upgrade to Tier {hintData.targetTier}: {addCommasToDisplayValue(hintData.buyingAssetCount.toString(), 2)}{' '}
          {hintData.buyingAssetId} + {addCommasToDisplayValue(FIAsset?.availableBalance.toString(), 6)} FI
          {/*// hintData.lockedFi.toString()*/}
        </div>
      ) : null}

      {hintData.exchangeInfoData ? (
        <>
          <div style={{ height: 3 }} />
          <div style={{ fontSize: 7 }}>
            * Your current FI Balance: {rateConvert(hintData.exchangeInfoData.rate, +(FIAsset?.availableBalance || 0))}{' '}
            {hintData.buyingAssetId} ({addCommasToDisplayValue(FIAsset?.availableBalance.toString(), 6)} FI)
          </div>
          <div style={{ fontSize: 7 }}>
            * {hintData.buyingAssetId} to FI Exchange:{' '}
            {rateConvert(hintData.exchangeInfoData.rate, +(hintData.exchangeInfoData?.remainingAmount || 0))}{' '}
            {hintData.buyingAssetId} (
            {addCommasToDisplayValue(hintData.exchangeInfoData?.remainingAmount?.toString(), 6)} FI)
          </div>
          <div style={{ fontSize: 7 }}>
            * Conversion Fee:{' '}
            {rateConvert(hintData.exchangeInfoData.rate, +(hintData.exchangeInfoData?.totalFeeAmount || 0))}{' '}
            {hintData.buyingAssetId} (
            {addCommasToDisplayValue(hintData.exchangeInfoData?.totalFeeAmount?.toString(), 6)} FI)
          </div>
        </>
      ) : null}
    </div>
  )
}
