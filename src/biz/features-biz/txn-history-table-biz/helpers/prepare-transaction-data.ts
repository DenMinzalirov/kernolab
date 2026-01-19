import moment from 'moment'

import { UnifiedHistoryTypeForBiz } from 'features/transactions-history/hooks/type'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { trimAndFormatDecimal } from 'utils/transactions-history/trimAndFormatDecimal'

import { getAmountBiz } from './get-amount-biz'
import { getAssetIdBiz } from './get-asset-id-biz'
import { getOperationTypeTextForDisplay } from './get-operation-type-text-for-display'
import { getStatusBadgeStyle } from './get-status-badge-style'
import { getStatusTextForDisplay } from './get-status-text-for-display'

export const prepareTransactionData = (transaction: UnifiedHistoryTypeForBiz) => {
  const date = transaction?.operationTime || ''
  const assetId = getAssetIdBiz(transaction)
  const operationType = transaction?.operationType || ''
  const amount = getAmountBiz(transaction)
  const addCommasAmount = addCommasToDisplayValue((+amount).toString(), 8)
  const status = transaction?.withdrawStatus || 'COMPLETED' // Если поля со статусам нету то по дефолту COMPLETED
  const statusColorTextForMd = status === 'COMPLETED' ? 'green' : 'darkGrey'

  return {
    dateForDisplay: moment(date).format('DD/MM/YY'),
    assetId: assetId,
    operationTypeForDisplay: getOperationTypeTextForDisplay(operationType),
    amountForDisplay: trimAndFormatDecimal(addCommasAmount, 2),
    statusBadgeStyle: getStatusBadgeStyle(status),
    statusText: getStatusTextForDisplay(status),
    statusColorTextForMd: statusColorTextForMd,
  }
}
