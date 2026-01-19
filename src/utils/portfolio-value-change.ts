import { sumBy } from 'lodash'

import { CombinedObject } from '../model/cefi-combain-assets-data'
import { $currency } from '../model/currency'

const getCefiPreviousTotalCash = <T extends Partial<CombinedObject>>(assets: Array<T>) => {
  const currencyType = $currency.getState().type.toLowerCase() as 'eur' | 'usd'

  return assets.reduce((acc, asset) => {
    return (
      acc +
      ((+(asset?.[currencyType]?.price ?? 0) * 100) / (+(asset?.[currencyType]?.priceChangePercentage24h ?? 0) + 100)) *
        +(asset?.availableBalance ?? 0)
    )
  }, 0)
}

const getCefiTotalCash = <T extends Partial<CombinedObject>>(assets: Array<T>): number => {
  const currencyType = $currency.getState().type.toLowerCase() as 'eur' | 'usd'
  return sumBy(assets, `${currencyType}.cash`)
}

export const calculateCefiPortfolioValueChange = <T extends Partial<CombinedObject>>(assets: Array<T>): number => {
  return (getCefiTotalCash(assets) * 100) / getCefiPreviousTotalCash(assets) - 100
}
