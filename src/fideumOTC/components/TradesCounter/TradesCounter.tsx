import React, { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { OTCTrade, OTCTradeServices, PageOTCTrade } from '../../../wip/services/fideumOTC-services/OTC-trade'
import { formatAmount } from '../../features-fideumOTC/trades-fideumOTC/utils'
import { $filters, FilterState } from '../../model/filters-fideumOTC'
import { $tradesOTC } from '../../model/trades-fideumOTC'
import { transformFiltersToQueryParams } from '../../utils/transformFiltersToQueryParams'
import styles from './TradesCounter.module.scss'

interface TradesCounterProps {
  className?: string
}

export const TradesCounter: React.FC<TradesCounterProps> = ({ className }) => {
  const filters = useUnit($filters)
  const trades = useUnit($tradesOTC)

  const [totalCountTrades, setTotalCountTrades] = useState('~')
  const [profitEur, setProfitEur] = useState('~')
  const [valueEur, setValueEur] = useState('~')

  // double
  async function fetchAllOTCTrades(filtersParams: FilterState, size = 10000): Promise<OTCTrade[]> {
    const transformFiltersParams = transformFiltersToQueryParams(filtersParams)
    let page = 0
    const all: OTCTrade[] = []
    let last = false

    while (!last) {
      const res: PageOTCTrade = await OTCTradeServices.getOTCTrades({
        ...transformFiltersParams,
        page,
        size,
      })

      if (Array.isArray(res.content) && res.content.length > 0) {
        all.push(...res.content)
      }

      if (typeof res.last === 'boolean') {
        last = res.last
      } else {
        last = true
      }
      page += 1
    }

    return all
  }
  // rate ammount side currency
  const profitAllEur = (tradesItem: OTCTrade[]) => {
    return tradesItem.reduce(
      (acc, item) => {
        if (item.status == 'FAILED') return acc

        const from = item.instrument.substring(0, 3) //btc
        // base - counter
        let baseAmount
        let counterAmount
        let baseProfit
        let counterProfit

        if (item.currency === from) {
          baseAmount = +item.amount
          counterAmount = +item.amount * +item.executedPrice

          baseProfit = item.side === 'BUY' ? +item.clientLeftAmount - baseAmount : baseAmount - +item.clientLeftAmount
          counterProfit =
            item.side === 'BUY' ? +item.clientRightAmount - counterAmount : counterAmount - +item.clientRightAmount
        } else {
          baseAmount = +item.amount / +item.executedPrice
          counterAmount = +item.amount
          baseProfit = item.side === 'SELL' ? +item.clientLeftAmount - baseAmount : baseAmount - +item.clientLeftAmount
          counterProfit =
            item.side === 'SELL' ? +item.clientRightAmount - counterAmount : counterAmount - +item.clientRightAmount
        }
        const totalEurTrade =
          (item.currency === from ? baseAmount : counterAmount) *
          (item.currency === from ? +item.baseCurrencyToEurRate : +item.counterCurrencyToEurRate)

        const baseProfitEur = baseProfit * +item.baseCurrencyToEurRate
        const counterProfitEur = counterProfit * +item.counterCurrencyToEurRate

        return {
          ...acc,
          valueEur: acc.valueEur + totalEurTrade,
          profitEur: acc.profitEur + (baseProfitEur + counterProfitEur),
        }
      },
      { profitEur: 0, valueEur: 0 }
    )
  }

  useEffect(() => {
    fetchAllOTCTrades(filters, 2000)
      .then(res => {
        setTotalCountTrades((res?.length || 0).toString())
        const profitData = profitAllEur(res)
        setProfitEur((profitData?.profitEur || 0).toFixed(2))
        setValueEur((profitData?.valueEur || 0).toFixed(2))
      })
      .catch(error => {
        console.error('fetchAllOTCTrades', error)
      })
  }, [trades])

  return (
    <div className={clsx(styles.tradesCounter, className)}>
      <div>Total trades: {totalCountTrades}</div>
      <div>Value EUR: {formatAmount(valueEur)}</div>
      <div>Profit EUR: {formatAmount(profitEur)}</div>
    </div>
  )
}
