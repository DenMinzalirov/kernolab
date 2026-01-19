import { OTCClient } from '../../../wip/services/fideumOTC-services/OTC-trade'
import { ClientData, OTCClientStatus } from './types'

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

export const getStatusBadgeStyle = (status: OTCClientStatus) => {
  switch (status) {
    case OTCClientStatus.CONFIRMED:
      return 'statusGreen'
    case OTCClientStatus.REJECTED:
      return 'statusRed'
    case OTCClientStatus.PENDING:
      return 'statusYellow'
    default:
      return 'statusGrey'
  }
}

export const getSideText = (side: string) => {
  return side === 'BUY' ? 'Buy' : 'Sell'
}

export const getStatusText = (status: OTCClientStatus) => {
  const statusMap: Record<OTCClientStatus, string> = {
    [OTCClientStatus.PENDING]: 'Pending',
    [OTCClientStatus.CONFIRMED]: 'Confirmed',
    [OTCClientStatus.REJECTED]: 'Rejected',
  }
  return statusMap[status] || status
}

/**
 * Преобразует дату в формате YYYY-MM-DD в ISO date-time строку для сортировки на сервере
 * @param dateString - дата в формате "2025-09-01"
 * @param timeType - тип времени: 'start' для начала дня (00:00:00) или 'end' для конца дня (23:59:59)
 * @returns строка в формате ISO date-time
 */
export const convertDateToDateTime = (dateString: string, timeType: 'start' | 'end' = 'start'): string => {
  if (!dateString) return ''

  try {
    const [year, month, day] = dateString.split('-')
    if (!year || !month || !day) return ''

    const time = timeType === 'start' ? '00:00:00' : '23:59:59'
    const isoString = `${year}-${month}-${day}T${time}.000Z`

    // Проверяем валидность даты
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''

    return isoString
  } catch {
    return ''
  }
}

export const getCellValue = (client: OTCClient, columnKey: keyof OTCClient) => {
  const value = client[columnKey]

  switch (columnKey) {
    case 'createdAt':
    case 'updatedAt':
      return formatDate(value as string)
    case 'status':
      return getStatusText(value as OTCClientStatus)
    case 'email':
      return (value as string) || '-'
    case 'fullName':
      return (value as string) || '-'
    case 'applicantId':
      return (value as string) || '-'
    case 'clientUuid':
      return (value as string)?.substring(0, 8) + '...' || '-'
    default:
      return (value as string) || '-'
  }
}
