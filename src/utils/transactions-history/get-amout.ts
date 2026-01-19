import { CryptoAndFiatHistoryTypeNew } from 'features/transactions-history/hooks/type'
import { OperationType } from 'wip/services/transactions-new'

export const getAmount = (item: CryptoAndFiatHistoryTypeNew) => {
  switch (item.operationType) {
    case OperationType.LAUNCHPAD_STAKE_ALLOCATION:
      return item.buyingAmount

    case OperationType.LAUNCHPAD_CLAIM_REFUND:
      return item.totalBuyingAmount

    case OperationType.LAUNCHPAD_CLAIM_TOKEN:
      return item.totalPurchasedAmount

    case OperationType.EXCHANGE:
      return item.toAmount

    default: {
      return item.amount
    }
  }
}
