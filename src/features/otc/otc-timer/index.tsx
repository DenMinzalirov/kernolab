import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'

const TimeIcon = () => {
  return (
    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g clipPath='url(#clip0_275_21038)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M6.99967 1.75065C4.10018 1.75065 1.74968 4.10116 1.74968 7.00065C1.74968 9.90015 4.10018 12.2507 6.99967 12.2507C9.89917 12.2507 12.2497 9.90015 12.2497 7.00065C12.2497 4.10116 9.89917 1.75065 6.99967 1.75065ZM0.583008 7.00065C0.583008 3.45682 3.45585 0.583984 6.99967 0.583984C10.5435 0.583984 13.4163 3.45682 13.4163 7.00065C13.4163 10.5445 10.5435 13.4173 6.99967 13.4173C3.45585 13.4173 0.583008 10.5445 0.583008 7.00065Z'
          fill='#445374'
        />
        <path
          d='M7.58366 7L10.5003 8.45833C9.93081 9.25565 9.90317 9.41101 9.33366 10.2083L6.41699 7.58333V2.625H7.00033L7.58366 7Z'
          fill='#445374'
        />
      </g>
      <defs>
        <clipPath id='clip0_275_21038'>
          <rect width='14' height='14' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

type StyleMapType = {
  [key: string]: {
    timerBg: string
    timerColor: string
  }
}

const styleMap: StyleMapType = {
  primary: {
    timerBg: styles.primaryBg,
    timerColor: styles.primary,
  },
  red: {
    timerBg: styles.redBg,
    timerColor: styles.red,
  },
}

type Props = {
  time: string // Формат time = "2024-10-12T10:48:22.442Z"
  title: string
  warningThreshold: number // Время в секундах, при достижении которого таймер становится красным
  onExpire: () => Promise<void> // Действие, которое будет вызвано при истечении времени
}

export const OtcTimer = ({ time, title, warningThreshold, onExpire }: Props) => {
  const [remainingTime, setRemainingTime] = useState<string>('')
  const [currentType, setCurrentType] = useState<keyof typeof styleMap>('primary')
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const targetDate = new Date(time).getTime()

    const updateTimer = () => {
      const now = Date.now()
      const distance = targetDate - now

      if (distance < 0) {
        setIsExpired(true)
        if (timerRef.current) clearInterval(timerRef.current)
        onExpire()
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setRemainingTime(`${days} ${hours} ${minutes} ${seconds}`)

      if (distance <= warningThreshold * 1000) {
        setCurrentType('red')
      } else {
        setCurrentType('primary')
      }
    }

    timerRef.current = setInterval(updateTimer, 1000)

    updateTimer()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [time, warningThreshold, onExpire])

  const { timerBg, timerColor } = styleMap[currentType]

  if (isExpired) {
    return <div></div>
  }

  const days = Math.floor(Number(remainingTime.split(' ')[0]))
  const hours = Math.floor(Number(remainingTime.split(' ')[1]))
  const minutes = Math.floor(Number(remainingTime.split(' ')[2]))
  const seconds = Math.floor(Number(remainingTime.split(' ')[3]))

  return (
    <div className={styles.container}>
      <div className={styles.titleWrap}>
        <TimeIcon />
        <div className={styles.title}>{title}</div>
      </div>
      <div className={clsx(styles.timerBlock, timerBg, timerColor)}>
        {hours > 0 && (
          <>
            <div className={styles.timerUnit}>{days}d</div>
            <div className={styles.timerUnit}>{hours}h</div>
            <div className={styles.timerUnit}>{String(minutes).padStart(2, '0')}m</div>
          </>
        )}
        {hours === 0 && (
          <>
            <div className={styles.timerUnit}>{String(minutes).padStart(2, '0')}m</div>
            <div className={styles.timerUnit}>{String(seconds).padStart(2, '0')}s</div>
          </>
        )}
      </div>
    </div>
  )
}
