import { useUnit } from 'effector-react'

import { calculateCefiPortfolioValueChange, getBalanceString } from 'utils'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { Currencies } from 'wip/stores'
import { $assetsRates } from 'model/cef-rates-coingecko'
import { $assetEurData, $assetsListData } from 'model/cefi-combain-assets-data'
import { $allStakingContracts, $campaignStakingContracts } from 'model/cefi-stacking'
import { $currency } from 'model/currency'

import { CardItem } from './card-item'
import styles from './styles.module.scss'

export function InfoCards() {
  const ratesRaw = useUnit($assetsRates)
  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'
  const assets = useUnit($assetsListData)
  const stackingList = useUnit($allStakingContracts)
  const superchargeList = useUnit($campaignStakingContracts)

  const totalCurrencyAmount = assets.reduce((acc, asset) => {
    return acc + asset[currencyType].cash
  }, 0)

  const fiatAsset = useUnit($assetEurData)

  const assetsWithChange = assets?.filter(item => item[currencyType].cash !== 0)
  const avgAssetChange = calculateCefiPortfolioValueChange(assetsWithChange)

  const currencySymbol = currency.symbol === Currencies.USD ? 'USD' : 'EUR'

  const stackingLocked = stackingList.reduce((acc, stackItem) => {
    const stackItemRate = ratesRaw?.find(
      rate => rate.toAssetId === currencySymbol && rate.fromAssetId === stackItem.assetId
    )
    return acc + stackItem.amount * Number(stackItemRate?.data?.currentPrice ?? 0)
  }, 0)

  const superchargeLocked = superchargeList.reduce((acc, stackItem) => {
    const stackItemRate = ratesRaw?.find(
      rate => rate.toAssetId === currencySymbol && rate.fromAssetId === stackItem.assetId
    )
    return acc + +stackItem.userStakingAmount * Number(stackItemRate?.data?.currentPrice ?? 0)
  }, 0)

  const allLocked = stackingLocked + superchargeLocked

  const stackingPayedRewardAmount = stackingList.reduce((acc, stackItem) => {
    const stackItemRate = ratesRaw?.find(
      rate => rate.toAssetId === currencySymbol && rate.fromAssetId === stackItem.assetId
    )
    return acc + stackItem.payedRewardAmount * Number(stackItemRate?.data?.currentPrice ?? 0)
  }, 0)

  const superchargePayedRewardAmount = superchargeList.reduce((acc, stackItem) => {
    const stackItemRate = ratesRaw?.find(
      rate => rate.toAssetId === currencySymbol && rate.fromAssetId === stackItem.assetId
    )
    return acc + +stackItem.payedRewardAmount * Number(stackItemRate?.data?.currentPrice ?? 0)
  }, 0)

  const allPayedRewardAmount = stackingPayedRewardAmount + superchargePayedRewardAmount

  const avgEarnChange = (): number => {
    const stacksChange = stackingList
      .filter(stack => +stack.amount)
      .map(stack => {
        const assetData = assets.find(asset => asset.assetId === stack.assetId)
        const stackItemRate = ratesRaw?.find(
          rate => rate.toAssetId === currencySymbol && rate.fromAssetId === stack.assetId
        )
        return {
          ...assetData,
          availableBalance: stack.amount,
          [currencyType]: {
            cash: stack.amount * (stackItemRate?.data.currentPrice || 0),
            price: stackItemRate?.data.currentPrice ?? 0,
            priceChangePercentage24h: stackItemRate?.data.priceChangePercentage24h ?? 0,
          },
        }
      })
    if (!stacksChange.length) return 0
    // TODO something
    return calculateCefiPortfolioValueChange(stacksChange as any) || 0
  }

  const cardItems = [
    {
      amount: getBalanceString(totalCurrencyAmount, 2) || '0',
      changeRate: avgAssetChange ? avgAssetChange.toString() : '0',
      title: 'Total Portfolio',
    },
    {
      amount: addCommasToDisplayValue(fiatAsset[currencyType].cash.toString() ?? '0', 2),
      changeRate: '',
      title: 'Fiat Balance',
    },
    {
      amount: getBalanceString(allLocked, 2),
      changeRate: avgEarnChange().toString(),
      title: 'Locked',
    },
    {
      amount: addCommasToDisplayValue(allPayedRewardAmount.toString() ?? '0'),
      changeRate: avgEarnChange().toString(),
      title: 'Earning Rewards',
    },
  ]

  return (
    <div className={styles.infoCards}>
      {cardItems.map(({ amount, changeRate, title }) => (
        <div key={title} className={styles.infoCardsItemWrap}>
          <CardItem amount={amount} changeRate={changeRate} title={title} />
        </div>
      ))}
    </div>
  )
}
