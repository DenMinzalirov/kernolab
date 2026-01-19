import { UnifiedHistoryTypeForBiz } from 'features/transactions-history/hooks/type'
import { OperationType } from 'wip/services/transactions-new'

export const getAssetIdBiz = (txn: UnifiedHistoryTypeForBiz) => {
  if ([OperationType.OTC_DEPOSIT, OperationType.OTC_REFUND].includes(txn?.operationType as OperationType)) {
    return txn?.assetFromId || ''
  }

  return txn?.assetId || txn?.toAssetId || txn?.assetToId || ''
}
