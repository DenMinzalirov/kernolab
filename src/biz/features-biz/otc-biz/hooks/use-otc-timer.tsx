import { useEffect, useRef, useState } from 'react'

type StyleType = 'primary' | 'red'

type UseOtcTimerProps = {
  startTime: string
  endTime: string
  warningThreshold: number
  onExpire: () => Promise<void>
}

export const useOtcTimer = ({ startTime, endTime, warningThreshold, onExpire }: UseOtcTimerProps) => {
  const [remainingTime, setRemainingTime] = useState<string>('')
  const [currentType, setCurrentType] = useState<StyleType>('primary')
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const startTimestamp = new Date(startTime).getTime()
    const endTimestamp = new Date(endTime).getTime()
    const totalDuration = endTimestamp - startTimestamp

    const updateTimer = () => {
      const now = Date.now()
      const distance = endTimestamp - now

      if (distance < 0) {
        setIsExpired(true)
        setProgress(100)
        if (timerRef.current) clearInterval(timerRef.current)
        onExpire()
        return
      }

      const elapsed = now - startTimestamp
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(progressPercent)

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
  }, [startTime, endTime, warningThreshold, onExpire])

  return { remainingTime, currentType, isExpired, progress }
}
