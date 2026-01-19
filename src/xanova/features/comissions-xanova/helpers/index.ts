import { toTitleCase } from 'utils/to-title-case'
import { TransportCommission } from 'wip/services'

const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export const formatDate = (value?: string) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return DATE_FORMATTER.format(parsed)
}

export const formatCommissionStatus = (value?: string) => {
  if (!value) return '—'
  return toTitleCase(value)
}

export const formatAmount = (value?: string) => {
  if (!value) return '—'

  const numeric = Number(value)
  if (Number.isNaN(numeric)) {
    return value
  }

  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
export const formatCommissionType = (value?: TransportCommission['commissionType']) => {
  if (!value) return '—'
  return toTitleCase(value)
}
