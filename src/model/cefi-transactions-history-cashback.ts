import { createEffect, createStore } from 'effector'

import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { TransactionsServices } from 'wip/services'
import earningRewardIconSvg from 'assets/icons/history/earning-reward-icon.svg'

import { TITLE_TXN_HISTORY } from './cefi-transactions-history'

export const $txnsHistoryCashback = createStore<any[]>([])

export const getTxnsHistoryCashbackFx = createEffect(async () => {
  const resData = await TransactionsServices.getHistoryCashback()

  const preparedData = resData.map(cashback => {
    return {
      ...cashback,
      title: TITLE_TXN_HISTORY.CASHBACK,
      transactionType: TYPE_TXN_HISTORY.CASHBACK,
      icon: earningRewardIconSvg,
    }
  })

  return preparedData
})

$txnsHistoryCashback.on(getTxnsHistoryCashbackFx.doneData, (_, repos) => repos)
