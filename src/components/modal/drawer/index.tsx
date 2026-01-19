import { ReactNode, useEffect, useRef } from 'react'
import clsx from 'clsx'

import { ModalOptions } from 'components/modal/types'

import styles from './styles.module.scss'

interface Drawer {
  open: boolean
  onClose: () => void
  children: ReactNode
  anchor?: 'left' | 'top' | 'right' | 'bottom'
  className?: string
  options?: ModalOptions
}

export function Drawer({ anchor = 'bottom', children, onClose, options, open, className = '' }: Drawer) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === drawerRef.current) onClose()
    }

    document.addEventListener('keydown', handleEscapeKeyDown)
    document.addEventListener('mousedown', handleBackdropClick)

    return () => {
      document.removeEventListener('keydown', handleEscapeKeyDown)
      document.removeEventListener('mousedown', handleBackdropClick)
    }
  }, [onClose])

  const anchorClassName = 'anchor' + anchor.charAt(0).toUpperCase() + anchor.slice(1)
  if (!open) return null

  return (
    <div
      role='presentation'
      ref={drawerRef}
      title={options?.title}
      className={clsx(styles.root, open && styles.open, className)}
    >
      <div aria-hidden={open} className={styles.backdrop} onClick={onClose} />
      <div
        className={clsx(
          styles.paper,
          styles[anchorClassName],
          anchor === 'bottom' && options?.fullSize === 'content' && styles.bottomFullSizeOnlyContentArea,
          anchor === 'bottom' && options?.fullSize === 'all' && styles.bottomFullSize
        )}
      >
        {children}
      </div>
    </div>
  )
}
