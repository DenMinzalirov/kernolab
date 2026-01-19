import { useEffect } from 'react'
import clsx from 'clsx'

import { CheckedIcon } from 'icons'
import { CopyBizIcon } from 'icons/copy-biz'

import styles from './styles.module.scss'
import { useClipboard } from 'hooks/use-clipboard'

type CopyIconButtonProps = {
  value: string
  className?: string
  iconFill?: string
  copiedIconFill?: string
  disabled?: boolean
  ariaLabel?: string
  resetDelay?: number
  onCopySuccess?: () => void
}

export function CopyIconButton({
  value,
  className,
  iconFill = 'var(--Xanova-Black)',
  copiedIconFill = 'var(--Xanova-Black)',
  disabled = false,
  ariaLabel = 'Copy to clipboard',
  resetDelay = 1500,
  onCopySuccess,
}: CopyIconButtonProps) {
  const { isCopied, copy, reset } = useClipboard(resetDelay)

  useEffect(() => {
    reset()
  }, [value, reset])

  const handleCopy = () => {
    if (disabled || !value) {
      return
    }

    void copy(value).then(success => {
      if (success && onCopySuccess) {
        onCopySuccess()
      }
    })
  }

  return (
    <button
      type='button'
      className={clsx(styles.copyButton, className)}
      onClick={handleCopy}
      disabled={disabled || !value}
      aria-label={ariaLabel}
    >
      {isCopied ? <CheckedIcon fill={copiedIconFill} /> : <CopyBizIcon fill={iconFill} />}
    </button>
  )
}
