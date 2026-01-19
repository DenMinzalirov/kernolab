import clsx from 'clsx'

import { TimeIconBiz } from 'icons/time-icon-biz'

import { useOtcTimer } from '../../hooks/use-otc-timer'
import styles from './styles.module.scss'

type Props = {
  startTime: string
  endTime: string
  title: string
  warningThreshold: number
  onExpire: () => Promise<void>
}

export const OtcTimerBiz = ({ title, warningThreshold, onExpire, startTime, endTime }: Props) => {
  const { remainingTime, currentType, isExpired, progress } = useOtcTimer({
    warningThreshold,
    onExpire,
    startTime,
    endTime,
  })

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
        <TimeIconBiz fill={currentType === 'red' ? 'red' : ''} />
        <div className={clsx(styles.title, styles[currentType])}>{title}</div>
      </div>

      <div className={clsx(styles.timerBlock, styles[currentType])}>
        {hours > 0 && (
          <>
            <div className={clsx(styles.timerUnit, styles[currentType])}>{days}d</div>
            <div className={clsx(styles.timerUnit, styles[currentType])}>{hours}h</div>
            <div className={clsx(styles.timerUnit, styles[currentType])}>{String(minutes).padStart(2, '0')}m</div>
          </>
        )}
        {hours === 0 && (
          <>
            <div className={clsx(styles.timerUnit, styles[currentType])}>{String(minutes).padStart(2, '0')}m</div>
            <div className={clsx(styles.timerUnit, styles[currentType])}>{String(seconds).padStart(2, '0')}s</div>
          </>
        )}
      </div>

      {/* only lg and md */}
      <div className={styles.progressBarWrap}>
        <div className={styles.timerBlockForLgAndDown}>
          {hours > 0 && (
            <>
              <div className={clsx(styles.timerUnitForLgAndDown, styles[currentType])}>{days}d</div>
              <div className={clsx(styles.timerUnitForLgAndDown, styles[currentType])}>{hours}h</div>
              <div className={clsx(styles.timerUnitForLgAndDown, styles[currentType])}>
                {String(minutes).padStart(2, '0')}m
              </div>
            </>
          )}
          {hours === 0 && (
            <>
              <div className={clsx(styles.timerUnitForLgAndDown, styles[currentType])}>
                {String(minutes).padStart(2, '0')}m
              </div>
              <div className={clsx(styles.timerUnitForLgAndDown, styles[currentType])}>
                {String(seconds).padStart(2, '0')}s
              </div>
            </>
          )}
        </div>
        <div></div>
        <div className={styles.progressBar}>
          <div className={clsx(styles.progress, styles[currentType])} style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  )
}
