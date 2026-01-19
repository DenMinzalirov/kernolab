import clsx from 'clsx'

import styles from './styles.module.scss'

type Props = {
  badgeType: 'error' | 'warning' | 'success'
  statusText: string
}

const styleMap = {
  error: {
    bg: styles.errorBg10,
    textColor: styles.error,
    dotBg: styles.dotErrorBg,
  },
  warning: {
    bg: styles.warningBg10,
    textColor: styles.warning,
    dotBg: styles.dotWarningBg,
  },
  success: {
    bg: styles.successBg10,
    textColor: styles.success,
    dotBg: styles.dotSuccessBg,
  },
}

export const OtcStatusBadge = ({ badgeType, statusText }: Props) => {
  const { bg, textColor, dotBg } = styleMap[badgeType]

  return (
    <div className={clsx(styles.container, bg)}>
      <div className={clsx(styles.dot, dotBg)}></div>
      <div className={clsx(styles.text, textColor)}>{statusText}</div>
    </div>
  )
}
