import React, { ReactNode, useEffect, useRef, useState } from 'react'

import styles from './swipe-row.module.scss'

type Props = {
  children: ReactNode
  onDelete: () => void
  onClick?: () => void
  actionLabel?: string
}

export const SwipeRow = ({ children, onDelete, actionLabel = 'Delete', onClick }: Props) => {
  const [translateX, setTranslateX] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const startXRef = useRef<number | null>(null)
  const buttonWidth = 84
  const swipeRef = useRef<HTMLDivElement | null>(null)

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startXRef.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return

    const currentX = e.touches[0].clientX
    const diff = currentX - startXRef.current

    if (isOpen && diff > 0 && diff <= buttonWidth) {
      setTranslateX(-buttonWidth + diff)
    }

    if (!isOpen && diff < 0 && Math.abs(diff) <= buttonWidth) {
      setTranslateX(diff)
    }
  }

  const handleTouchEnd = () => {
    if (!isOpen) {
      if (Math.abs(translateX) > buttonWidth / 2) {
        setTranslateX(-buttonWidth)
        setIsOpen(true)
      } else {
        setTranslateX(0)
        setIsOpen(false)
      }
    } else {
      if (translateX > -buttonWidth / 2) {
        setTranslateX(0)
        setIsOpen(false)
      } else {
        setTranslateX(-buttonWidth)
        setIsOpen(true)
      }
    }

    startXRef.current = null
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (swipeRef.current && !swipeRef.current.contains(e.target as Node)) {
        setTranslateX(0)
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className={styles.wrapper} ref={swipeRef}>
      <div
        className={styles.container}
        onClick={onClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: startXRef.current === null ? 'transform 0.3s ease' : 'none',
        }}
      >
        <div className={styles.content}>{children}</div>
      </div>

      <button className={styles.button} onClick={onDelete}>
        {actionLabel}
      </button>
    </div>
  )
}
