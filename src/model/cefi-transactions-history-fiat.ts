import { createEffect, createStore } from 'effector'

import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { TransactionsServices } from 'wip/services'
import depositIconSvg from 'assets/icons/history/deposit-icon.svg'
import withdrawalIconSvg from 'assets/icons/history/withdrawal-icon.svg'

import { TITLE_TXN_HISTORY } from './cefi-transactions-history'

export const $transactionsHistoryFiat = createStore<any[]>([])

export const getTransactionsHistoryFiatFx = createEffect(async () => {
  const deposits = await TransactionsServices.getHistoryFiatDeposit()
  const preparedDeposit = deposits.map(deposit => ({
    ...deposit,
    title: TITLE_TXN_HISTORY.TOP_UP,
    transactionType: TYPE_TXN_HISTORY.FIAT,
    icon: depositIconSvg,
  }))

  const withdraws = await TransactionsServices.getHistoryFiatWithdraw()
  const preparedWithdraws = withdraws.map(withdraw => ({
    ...withdraw,
    title: TITLE_TXN_HISTORY.WITHDRAWAL,
    transactionType: TYPE_TXN_HISTORY.FIAT,
    icon: withdrawalIconSvg,
  }))

  const result = [...preparedDeposit, ...preparedWithdraws]

  return result
})

$transactionsHistoryFiat.on(getTransactionsHistoryFiatFx.doneData, (_, repos) => repos)
