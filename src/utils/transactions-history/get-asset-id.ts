import { CryptoAndFiatHistoryTypeNew } from 'features/transactions-history/hooks/type'
import { OperationType } from 'wip/services/transactions-new'

export const getAssetId = (item: CryptoAndFiatHistoryTypeNew) => {
  switch (item.operationType) {
    case OperationType.LAUNCHPAD_STAKE_ALLOCATION:
      return item.buyingAssetId

    case OperationType.LAUNCHPAD_CLAIM_REFUND:
      return item.buyingAssetId

    case OperationType.LAUNCHPAD_CLAIM_TOKEN:
      return item.supplyAssetId

    case OperationType.EXCHANGE:
      return item.toAssetId

    default: {
      return item.assetId
    }
  }
}
