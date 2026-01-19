import moment from 'moment'

import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { getAmountSign } from 'utils/transactions-history/get-amount-sign'
import { getAmount } from 'utils/transactions-history/get-amout'
import { getAssetId } from 'utils/transactions-history/get-asset-id'
import { getStatus } from 'utils/transactions-history/get-status'
import { getStatusIndicatorColor } from 'utils/transactions-history/get-status-indicator-color'
import { trimAndFormatDecimal } from 'utils/transactions-history/trimAndFormatDecimal'

import { getTitle } from '../hooks/get-title'
import { getOperationTypeTextForDisplay } from './get-operation-type-text-for-display'

export const prepareTransactionData = (transaction: any) => {
  const date = transaction?.operationTime || ''
  const assetId = getAssetId(transaction)
  const operationType = transaction?.operationType || ''
  const amount = getAmount(transaction)
  const addCommasAmount = addCommasToDisplayValue((amount || '').toString(), 8)
  const status = transaction?.withdrawStatus || 'COMPLETED' // Если поля со статусам нету то по дефолту COMPLETED

  return {
    dateForDisplay: moment(date).format('YYYY-MM-DD'),
    assetId: assetId,
    // TODO: проверить старый getOperationTypeTextForDisplay и новый getTitle
    operationTypeForDisplay: getTitle(operationType), // getOperationTypeTextForDisplay(operationType),
    amountForDisplay: trimAndFormatDecimal(addCommasAmount, 2),
    statusText: getStatus(status),
    statusIndicatorColor1: getStatusIndicatorColor(status),
    statusIndicatorColor2: getStatusIndicatorColor(status, 'secondary'),
    amountSign: getAmountSign(transaction.title),
  }
}
