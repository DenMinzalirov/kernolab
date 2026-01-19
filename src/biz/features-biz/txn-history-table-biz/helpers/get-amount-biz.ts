import { UnifiedHistoryTypeForBiz } from 'features/transactions-history/hooks/type'
import { OperationType } from 'wip/services/transactions-new'

export const getAmountBiz = (txn: UnifiedHistoryTypeForBiz) => {
  if ([OperationType.OTC_DEPOSIT, OperationType.OTC_REFUND].includes(txn?.operationType as OperationType)) {
    return txn?.fromAmount || ''
  }

  return txn?.amount || txn.toAmount || ''
}
