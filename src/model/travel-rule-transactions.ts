import { createEffect, createEvent, createStore } from 'effector'

import { CryptoOperationServices } from 'wip/services/crypto-operations'
import { CryptoTravelRuleService } from 'wip/services/crypto-travel-rules'
import depositIconSvg from 'assets/icons/history/deposit-icon.svg'
import withdrawalIconSvg from 'assets/icons/history/withdrawal-icon.svg'

import { TITLE_TXN_HISTORY } from './cefi-transactions-history'

export type TravelRuleTransaction = {
  title: string
  operationType: 'DEPOSIT' | 'WITHDRAWAL'
  icon: string
  //TravelRuleWithdrawalTransactionResponse & TravelRuleDepositTransactionResponse
  status: 'NOT_REQUIRED' | 'TRIGGERED' | 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'
  createdAt: string //date-time
  //TravelRuleDepositTransactionResponse
  depositTransactionId?: number //integer int64
  //TravelRuleWithdrawalTransactionResponse
  withdrawalTransactionId?: number //integer int64
  //UserDeposit & UserWithdrawal
  id: number
  targetAddress: string
  assetId: string
  networkId: string
  amount: string
  blockchainHash: string
  transactionTimestamp: string
  state: string
  //UserWithdrawal
  fee?: string
  //UserDeposit
  sourceAddress?: string
}

export const $travelRuleData = createStore<TravelRuleTransaction[]>([])

export const getTravelRuleDataFx = createEffect(async () => {
  try {
    const depositTravelRule = await CryptoTravelRuleService.getDepositTravelRuleTransactions()
    const withdrawTravelRule = await CryptoTravelRuleService.getWithdrawalTravelRuleTransactions()

    let depositTransactions: TravelRuleTransaction[] = []
    let withdrawalTransactions: TravelRuleTransaction[] = []

    if (depositTravelRule.length) {
      const depositDetails = await CryptoOperationServices.getUserDeposits()

      depositTransactions = depositTravelRule.flatMap(transaction => {
        const history = depositDetails?.deposits?.find(txn => txn.id === transaction.depositTransactionId)
        return history
          ? [
              {
                ...transaction,
                ...history,
                title: TITLE_TXN_HISTORY.DEPOSIT,
                operationType: 'DEPOSIT' as const,
                icon: depositIconSvg,
              },
            ]
          : []
      })
    }

    if (withdrawTravelRule.length) {
      const withdrawalDetails = await CryptoOperationServices.getUserWithdrawals()

      withdrawalTransactions = withdrawTravelRule.flatMap(transaction => {
        const history = withdrawalDetails?.withdrawals?.find(txn => txn.id === transaction.withdrawalTransactionId)
        return history
          ? [
              {
                ...transaction,
                ...history,
                title: TITLE_TXN_HISTORY.WITHDRAWAL,
                operationType: 'WITHDRAWAL' as const,
                icon: withdrawalIconSvg,
              },
            ]
          : []
      })
    }

    return [...depositTransactions, ...withdrawalTransactions]
  } catch (error) {
    console.error('Error fetching travel rule data:', error)
    // throw error // Проброс ошибки для верхнего уровня
  }
})

$travelRuleData.on(getTravelRuleDataFx.doneData, (_, payload) => payload)

export const $hasTravelRuleModalBeenShown = createStore(false)

export const hasTravelRuleModalBeenShownEv = createEvent<boolean>()

$hasTravelRuleModalBeenShown.on(hasTravelRuleModalBeenShownEv, (s, p) => p)
