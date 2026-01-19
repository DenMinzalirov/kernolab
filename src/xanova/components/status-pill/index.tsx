import clsx from 'clsx'

import { toTitleCase } from 'utils/to-title-case'

import styles from './styles.module.scss'

const STATUS_CLASS_MAP: Record<string, string> = {
  submitted: styles.submitted,
  pending: styles.pending,
  rejected: styles.rejected,
  inactive: styles.inactive,
  completed: styles.completed,
  active: styles.payedOut,
  cancelled: styles.cancelled,
  canceled: styles.cancelled,
  refused: styles.cancelled,
  'payed out': styles.payedOut,
  'paid out': styles.payedOut,
}

type StatusPillProps = {
  status?: string | null
  label?: string
  className?: string
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const normalized = toTitleCase(status?.trim() ?? '')
  const statusKey = normalized.toLowerCase()
  const statusClass = STATUS_CLASS_MAP[statusKey] ?? styles.default

  const displayLabel = label ?? (normalized || '—')

  return <span className={clsx(styles.pill, statusClass, className)}>{displayLabel}</span>
}
