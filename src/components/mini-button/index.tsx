import clsx from 'clsx'

import { isBiz } from 'config'

import styles from './styles.module.scss'

type Props = {
  title: string
  action: () => void
  buttonActive: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large' // font size 10px, 12px, 14px
}

export const MiniButton = ({ title, action, buttonActive, disabled = false, size = 'large' }: Props) => {
  return (
    <>
      {isBiz ? (
        <button
          className={clsx(
            buttonActive ? 'btn-with-icon-biz blue' : 'btn-with-icon-biz light-blue',
            disabled ? 'disabled' : ''
          )}
          onClick={disabled ? () => {} : action}
          disabled={disabled}
        >
          {title}
        </button>
      ) : (
        <div
          className={clsx(
            disabled ? styles.filterButtonDisabled : styles.filterButton,
            buttonActive ? styles.filterButtonActive : ''
          )}
          onClick={disabled ? () => {} : action}
        >
          <div
            className={clsx(
              styles.filterButtonTitle,
              buttonActive ? styles.filterButtonTitleActive : '',
              size === 'small' && styles.filterButtonTitleSmall,
              size === 'medium' && styles.filterButtonTitleMedium,
              size === 'large' && styles.filterButtonTitleLarge
            )}
          >
            {title}
          </div>
        </div>
      )}
    </>
  )
}
