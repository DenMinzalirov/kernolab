import { Dispatch, SetStateAction } from 'react'

import { FilterOptionsType } from 'features/modals/transaction-filter'
import { OperationType, TransactionsNewServices } from 'wip/services/transactions-new'

import { TITLE_TXN_HISTORY_NEW, TYPE_TXN_HISTORY } from '../constants'
import { fetchBizTransactionHistory } from './fetch-biz-txn-history'
import { fetchStakingTransactionHistory } from './fetch-staking-txn-history'
import { getLocalIcon } from './get-local-icon'
import { getTitle } from './get-title'
import { parseFilters } from './parse-filters'
import { CryptoAndFiatHistoryTypeNew, StakingUniqueFieldsResponse, UnifiedHistoryTypeForBiz } from './type'

type Props = {
  currentFilterOptions: FilterOptionsType[]
  transactionType: string
  page: number
  setLoading: Dispatch<SetStateAction<boolean>>
  setError: Dispatch<unknown>
  setLastPage: Dispatch<SetStateAction<boolean>>
  setTxnCryptoAndFiat: Dispatch<SetStateAction<CryptoAndFiatHistoryTypeNew[]>>
  setTxnStaking: Dispatch<SetStateAction<StakingUniqueFieldsResponse[]>>
  setTxnBiz: Dispatch<SetStateAction<UnifiedHistoryTypeForBiz[]>>
}

export const loadTransactions = async ({
  currentFilterOptions,
  transactionType,
  page,
  setLoading,
  setError,
  setLastPage,
  setTxnCryptoAndFiat,
  setTxnStaking,
  setTxnBiz,
}: Props) => {
  setLoading(true)
  setError(null)

  const { fromDate, toDate, assetIds, operationTypes } = parseFilters(currentFilterOptions, transactionType)
  const operationTypesArray = []

  if (operationTypes.length) {
    operationTypesArray.push(...operationTypes)
  } else if (transactionType === TYPE_TXN_HISTORY.CRYPTO) {
    operationTypesArray.push(
      OperationType.CRYPTO_DEPOSIT,
      OperationType.CRYPTO_WITHDRAW,
      OperationType.EXCHANGE,
      OperationType.LAUNCHPAD_CLAIM_REFUND,
      OperationType.LAUNCHPAD_CLAIM_TOKEN,
      OperationType.LAUNCHPAD_STAKE_ALLOCATION,
      OperationType.REWARD,
      OperationType.STAKING_REWARD
    )
  } else if (transactionType === TYPE_TXN_HISTORY.FIAT) {
    operationTypesArray.push(OperationType.FIAT_DEPOSIT, OperationType.FIAT_WITHDRAW)
  } else if (transactionType === TYPE_TXN_HISTORY.CASHBACK) {
    operationTypesArray.push(OperationType.CASHBACK)
  } else if (transactionType === TYPE_TXN_HISTORY.STAKING) {
    operationTypesArray.push(
      OperationType.STAKING_CAMPAIGN_CLOSE,
      OperationType.STAKING_CAMPAIGN_CREATE,
      OperationType.STAKING_POS_CREATE,
      OperationType.STAKING_POS_CLOSE,
      OperationType.STAKING_ROLLING_CREATE,
      OperationType.STAKING_ROLLING_CLOSE,
      OperationType.STAKING_ROLLING_LEVELED_CREATE,
      OperationType.STAKING_ROLLING_LEVELED_CLOSE,
      OperationType.STAKING_SIMPLE_CREATE,
      OperationType.STAKING_SIMPLE_CLOSE,
      OperationType.STAKING_REWARD
    )
  } else if (transactionType === TYPE_TXN_HISTORY.BIZ) {
    operationTypesArray.push(
      OperationType.CRYPTO_DEPOSIT,
      OperationType.CRYPTO_WITHDRAW,
      OperationType.EXCHANGE,
      OperationType.FIAT_DEPOSIT,
      OperationType.FIAT_WITHDRAW,
      OperationType.OTC_DEPOSIT,
      OperationType.OTC_EXCHANGE,
      OperationType.OTC_REFUND
    )
  }

  try {
    const operationHistoryResponse = await TransactionsNewServices.getOperationHistory({
      from: fromDate,
      to: toDate,
      assetIds: assetIds.length ? assetIds : [],
      operationTypes: operationTypesArray,
      page,
      sort: [{ field: 'operationTime', sort: 'desc' }],
    })

    const content = operationHistoryResponse.content

    setLastPage(operationHistoryResponse.last)

    if (!content.length) {
      setTxnCryptoAndFiat([])
      setTxnStaking([])
      setTxnBiz([])
      return
    }

    const groupedByOperationType = content.reduce(
      (acc, txn) => {
        const { operationType, id } = txn
        if (!acc[operationType]) acc[operationType] = []
        acc[operationType].push(id)
        return acc
      },
      {} as Record<string, number[]>
    )

    if ([TYPE_TXN_HISTORY.CRYPTO, TYPE_TXN_HISTORY.FIAT].includes(transactionType)) {
      const [
        launchpadClaimRefundHistory,
        launchpadClaimTokenHistory,
        launchpadStakeAllocationHistory,
        depositHistory,
        exchangeHistory,
        rewardHistory,
        withdrawHistory,
        stakingRewardHistory,
      ] = await Promise.all([
        groupedByOperationType.LAUNCHPAD_CLAIM_REFUND
          ? TransactionsNewServices.getLaunchpadClaimRefundHistory(groupedByOperationType.LAUNCHPAD_CLAIM_REFUND)
          : [],

        groupedByOperationType.LAUNCHPAD_CLAIM_TOKEN
          ? TransactionsNewServices.getLaunchpadClaimTokenHistory(groupedByOperationType.LAUNCHPAD_CLAIM_TOKEN)
          : [],

        groupedByOperationType.LAUNCHPAD_STAKE_ALLOCATION
          ? TransactionsNewServices.getLaunchpadStakeAllocationHistory(
              groupedByOperationType.LAUNCHPAD_STAKE_ALLOCATION
            )
          : [],

        groupedByOperationType[
          transactionType === TYPE_TXN_HISTORY.CRYPTO ? OperationType.CRYPTO_DEPOSIT : OperationType.FIAT_DEPOSIT
        ]
          ? TransactionsNewServices.getDepositHistory(
              groupedByOperationType[
                transactionType === TYPE_TXN_HISTORY.CRYPTO ? OperationType.CRYPTO_DEPOSIT : OperationType.FIAT_DEPOSIT
              ]
            )
          : [],

        groupedByOperationType.EXCHANGE
          ? TransactionsNewServices.getExchangeHistory(groupedByOperationType.EXCHANGE)
          : [],

        groupedByOperationType.REWARD ? TransactionsNewServices.getRewardHistory(groupedByOperationType.REWARD) : [],
        groupedByOperationType[
          transactionType === TYPE_TXN_HISTORY.CRYPTO ? OperationType.CRYPTO_WITHDRAW : OperationType.FIAT_WITHDRAW
        ]
          ? TransactionsNewServices.getWithdrawHistory(
              groupedByOperationType[
                transactionType === TYPE_TXN_HISTORY.CRYPTO
                  ? OperationType.CRYPTO_WITHDRAW
                  : OperationType.FIAT_WITHDRAW
              ]
            )
          : [],

        groupedByOperationType[OperationType.STAKING_REWARD]
          ? TransactionsNewServices.stakingRewardHistory(groupedByOperationType[OperationType.STAKING_REWARD])
          : [],
      ])

      const filteredRewardHistory = rewardHistory.filter(item => item.rewardName === 'Referral Bonus')

      const allHistories = [
        ...launchpadClaimRefundHistory,
        ...launchpadClaimTokenHistory,
        ...launchpadStakeAllocationHistory,
        ...depositHistory,
        ...exchangeHistory,
        ...filteredRewardHistory,
        ...withdrawHistory,
        ...stakingRewardHistory,
      ] as CryptoAndFiatHistoryTypeNew[]

      const combinedTransactions = allHistories.map(historyItem => {
        const originalTxn = content.find(txn => txn.id === historyItem.id)
        const operationType = originalTxn?.operationType

        return {
          ...historyItem,
          operationTime: originalTxn?.operationTime,
          operationType: operationType,
          title: getTitle(historyItem.rewardName || operationType || ''),
          icon: getLocalIcon(historyItem.rewardName || operationType || ''),
        } as CryptoAndFiatHistoryTypeNew
      })

      setTxnCryptoAndFiat(prevTransactions => [...prevTransactions, ...combinedTransactions])
    }

    if ([TYPE_TXN_HISTORY.CASHBACK].includes(transactionType)) {
      const respons = await TransactionsNewServices.getCashbackHistory(groupedByOperationType[OperationType.CASHBACK])

      const combinedTransactions = respons.map(historyItem => {
        const originalTxn = content.find(txn => txn.id === historyItem.id)
        const operationType = originalTxn?.operationType

        return {
          ...historyItem,
          operationTime: originalTxn?.operationTime,
          operationType: operationType,
          title: TITLE_TXN_HISTORY_NEW.CASHBACK,
          icon: getLocalIcon('Cash Back'),
        } as CryptoAndFiatHistoryTypeNew
      })

      setTxnCryptoAndFiat(prevTransactions => [...prevTransactions, ...combinedTransactions])
    }

    if ([TYPE_TXN_HISTORY.STAKING].includes(transactionType)) {
      const histories = await fetchStakingTransactionHistory(groupedByOperationType)

      const allHistories = histories.flat()

      const combinedTransactions: StakingUniqueFieldsResponse[] = allHistories.map(historyItem => {
        const originalTxn = content.find(txn => txn.id === historyItem.id)
        const operationType = originalTxn?.operationType

        return {
          ...historyItem,
          operationTime: originalTxn?.operationTime || '',
          operationType: operationType,
          title: getTitle(operationType || ''),
          icon: getLocalIcon(operationType || ''),
        }
      })

      setTxnStaking(prevTransactions => [...prevTransactions, ...combinedTransactions])
    }

    if (transactionType === TYPE_TXN_HISTORY.BIZ) {
      const histories = await fetchBizTransactionHistory(groupedByOperationType)

      const allHistories = histories.flat() as UnifiedHistoryTypeForBiz[]

      const combinedTransactions = allHistories.map(historyItem => {
        const originalTxn = content.find(txn => txn.id === historyItem.id)
        const operationType = originalTxn?.operationType

        return {
          ...historyItem,
          operationTime: originalTxn?.operationTime,
          operationType: operationType,
          title: getTitle(operationType || ''),
          icon: getLocalIcon(operationType || ''),
        } as UnifiedHistoryTypeForBiz
      })

      setTxnBiz(prevTransactions => [...prevTransactions, ...combinedTransactions])
    }
  } catch (e) {
    setError(e)
  } finally {
    setLoading(false)
  }
}
