import React, { useEffect, useState } from 'react'

import { isBiz, theme, themeValue } from 'config'

import stylesFideum from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'

type TimerColorScheme = 'Primary' | 'Warning'

interface CountdownTimerProps {
  initialTime: number // начальное время в секундах
  colorScheme: TimerColorScheme
  onComplete?: () => void
  showTitle?: boolean
}

export const CountdownTimer = ({ initialTime, colorScheme, onComplete, showTitle = true }: CountdownTimerProps) => {
  const styles = isBiz ? stylesBiz : stylesFideum

  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    if (Number.isNaN(timeLeft)) return

    const timer = setInterval(() => {
      setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setTimeLeft(initialTime)
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
