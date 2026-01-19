import { useEffect, useState } from 'react'

import styles from './styles.module.scss'

type TimerColorScheme = 'Primary' | 'Warning'

interface CountdownTimerProps {
  initialTime: number // начальное время в секундах
  colorScheme: TimerColorScheme
  onComplete?: () => void
  showTitle?: boolean
}

export const CountdownTimerXanova = ({
  initialTime,
  colorScheme,
  onComplete,
  showTitle = true,
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    if (Number.isNaN(initialTime)) return

    setTimeLeft(initialTime)

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [initialTime])

  useEffect(() => {
    if (timeLeft === 0 && onComplete) {
      onComplete()
    }
  }, [timeLeft, onComplete])

  const formatTime = (seconds: number) => {
    if (Number.isNaN(timeLeft)) return 'error'

    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0')
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${hrs}:${mins}:${secs}`
  }

  return (
    <div className={`${styles.container} ${colorScheme === 'Warning' ? styles.warning : styles.primary}`}>
      <div className={styles.content}>
        {showTitle ? <div className={styles.text}>Security Timer</div> : null}
        <div className={`${styles.timer} ${colorScheme === 'Warning' ? styles.warning : styles.primary}`}>
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  )
}
