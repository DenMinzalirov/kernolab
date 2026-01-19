import { LocalTradeData } from './types'

export const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

export const formatPrice = (price: string) => {
  if (!price) return '-'
  try {
    const num = parseFloat(price)
    if (isNaN(num)) return '-'
    return num.toFixed(2)
  } catch {
    return '-'
  }
}

export const formatAmount = (amount: string) => {
  if (!amount) return '-'
  try {
    const num = parseFloat(amount)
    if (isNaN(num)) return '-'
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })
  } catch {
    return '-'
  }
}

export const formatPercent = (percent: string) => {
  if (!percent) return '-'
  try {
    const num = parseFloat(percent)
    if (isNaN(num)) return '-'
    return `${num.toFixed(2)}%`
  } catch {
    return '-'
  }
}

export const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'CREATED':
      return 'statusYellow'
    case 'EXECUTED':
      return 'statusGreen'
    case 'CANCELLED':
      return 'statusRed'
    case 'PENDING':
      return 'statusBlue'
    case 'FINALIZED':
      return 'statusPurple'
    default:
      return 'statusGrey'
  }
}

export const getSideText = (side: string) => {
  return side === 'BUY' ? 'Buy' : 'Sell'
}

export const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    CREATED: 'Created',
    EXECUTED: 'Executed',
    CANCELLED: 'Cancelled',
    PENDING: 'Pending',
    FINALIZED: 'Finalized',
    SUBMITTED: 'Submitted',
    FAILED: 'Failed',
  }
  return statusMap[status] || status
}

export const getCellValue = (trade: LocalTradeData, columnKey: keyof LocalTradeData) => {
  const value = trade[columnKey]

  switch (columnKey) {
    case 'createdAt':
    case 'updatedAt':
      return formatDate(value as string)
    case 'side':
      return getSideText(value as string)
    case 'status':
      return getStatusText(value as string)
    // case 'clientPrice':
    case 'executedPrice':
    case 'expectedExecutionPrice':
      // return formatPrice(value as string)
      return formatAmount(value as string)
    // case 'amount':
    //   return formatAmount(value as string) + ' ' + trade.currency + valueRight(trade)
    case 'slippagePercent':
      return formatPercent(value as string)
    default:
      return (value as string) || '-'
  }
}

/**
 * Очищает строку от лишних нулей с поддержкой целых чисел
 * @param value - строка с числом
 * @returns очищенная строка с числом или пустая строка
 */
export function cleanDecimalString(value: string | null | undefined): string {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return ''
  }

  const trimmedValue = value.trim()
  const numericValue = parseFloat(trimmedValue)

  if (isNaN(numericValue)) {
    return ''
  }

  // Если число целое, возвращаем без десятичной точки
  if (Number.isInteger(numericValue)) {
    return numericValue.toString()
  }

  // Для дробных чисел убираем лишние нули
  return numericValue.toString()
}

export const isInRange = (value?: string, min?: string, max?: string): boolean => {
  if (!value || !min || !max) return false

  const numValue = parseFloat(value)
  const numMin = parseFloat(min)
  const numMax = parseFloat(max)

  return !isNaN(numValue) && !isNaN(numMin) && !isNaN(numMax) && numValue >= numMin && numValue <= numMax
}

export const getDecimalLength = (value: string | undefined): number => {
  if (!value) return 5
  if (!value.includes('.')) return 0 // нет десятичной части
  return value.split('.')[1].length
}
