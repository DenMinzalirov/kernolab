import { ReactNode, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import { MenuDotsIcon } from 'icons/menu-dots-icon'
import { MenuDotsIconBig } from 'icons/menu-dots-icon-big'
import { isBiz } from 'config'

import stylesBiz from './styles.module.scss'
import stylesPairs from './styles-pairs.module.scss'

type MenuWithActionsProps = {
  actions: Array<{
    label: string
    disabled: boolean
    onClick: () => void
    icon?: ReactNode
    labelColor?: 'red'
  }>
  isDotBig?: boolean
}

export function MenuWithActions({ actions, isDotBig }: MenuWithActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const styles = isBiz ? stylesBiz : stylesPairs

  const toggleMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation()
    setIsOpen(prev => !prev)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <div className={clsx(styles.menuDotsButton)} onClick={event => toggleMenu(event)}>
        {isDotBig ? <MenuDotsIconBig /> : <MenuDotsIcon />}
      </div>

      {isOpen && (
        <div className={styles.popup}>
          {actions.map((action, index) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={clsx(
                styles.button,
                action.disabled && styles.disabled,
                action.labelColor && styles[action.labelColor]
              )}
              onClick={e => {
                e.stopPropagation()
                action.onClick()
                setIsOpen(false)
              }}
              disabled={action.disabled}
            >
              {action.icon ? <span className={styles.icon}>{action.icon}</span> : null}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
