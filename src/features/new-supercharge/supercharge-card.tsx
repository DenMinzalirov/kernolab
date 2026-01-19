import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'

import { ProgressBar } from 'components'
import { getBalanceString } from 'utils'
import { calculateStakeProgress } from 'utils/calculate-stake-progress'
import { StakingCampaignResponse } from 'wip/services'
import { $assetsListData } from 'model/cefi-combain-assets-data'
import { $tierLevel } from 'model/cefi-stacking'

import styles from './styles.module.scss'

type Props = {
  plan: StakingCampaignResponse
  setCampaignPlanForStake: Dispatch<SetStateAction<StakingCampaignResponse | null>>
  setIsSupercharge?: Dispatch<SetStateAction<boolean>>
}

export function SuperchargeCard({ plan, setCampaignPlanForStake, setIsSupercharge }: Props) {
  const userLevel = useUnit($tierLevel)
  const assets = useUnit($assetsListData)

  const asset = assets.find(assetItem => assetItem.assetId === plan.assetId)

  const currentDate = new Date().toISOString()
  const currentDateObj = new Date(currentDate)
  const targetDate =
    currentDateObj < new Date(plan.startDate) ? new Date(plan.startDate) : new Date(plan.endDepositDate)

  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date()
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    return timeLeft
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const setPlane = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (userLevel < plan.requiredUserLevel) {
      setIsSupercharge && setIsSupercharge(false)
      return
    }

    setCampaignPlanForStake(plan)
  }

  const btnName = () => {
    if (userLevel < plan.requiredUserLevel) {
      return `Upgrade to Tier ${plan.requiredUserLevel}`
    }

    if (currentDateObj > new Date(plan.endDepositDate)) {
      return 'Deposit is disabled'
    }
    return 'Stake Now'
  }

  const isDisabledBtn = () => {
    if (userLevel < plan.requiredUserLevel) {
      return false
    }
    if (currentDateObj > new Date(plan.endDepositDate)) return true
    return currentDateObj < new Date(plan.startDate)
  }

  const lockupPeriod = moment(plan.lockupDate).format('DD MMMM YYYY')
  const { progress } = calculateStakeProgress(plan.startDate, plan.endDepositDate)

  return (
    <>
      <div className={styles.superchargeCard}>
        <div className={styles.superchargeCardContent}>
          <div className={styles.superchargeCardHeader}>
            <img className={clsx('asset-icon', styles.superchargeCardHeaderIcon)} src={asset?.icon || ''} alt='Icon' />
            <div className={styles.superchargeCardHeaderTitleWrap}>
              <div className={styles.superchargeCardHeaderTitle}>Prize Pool:</div>
              <div className={styles.superchargeCardHeaderSubTitle}>
                {getBalanceString(+plan.prizePoolAmount, 2)} {plan.prizePoolAssetId}
              </div>
            </div>
          </div>

          <div className={styles.superchargeCardHeaderLine} />
          <div className={styles.superchargeCardBodyWrap}>
            <div className={styles.superchargeCardBody}>
              <div className={styles.superchargeCardBodyRow}>
                <div className={styles.superchargeCardBodyRowTitle}>Accepted assets</div>
                <div className={styles.superchargeCardBodyRowSubTitle}>{plan.assetId}</div>
              </div>
              <div className={styles.superchargeCardBodyRow}>
                <div className={styles.superchargeCardBodyRowTitle}>Lockup period</div>
                <div className={styles.superchargeCardBodyRowSubTitle}>Until {lockupPeriod}</div>
              </div>
              <div className={styles.superchargeCardBodyRow}>
                <div className={styles.superchargeCardBodyRowTitle}>Total currently locked</div>
                <div className={styles.superchargeCardBodyRowSubTitle}>
                  {getBalanceString(+plan.currentStakingAmount, 8)} {plan.assetId}
                </div>
              </div>
              <div className={styles.superchargeCardBodyRow}>
                <div className={styles.superchargeCardBodyRowTitle}>Min amount to stake</div>
                <div className={styles.superchargeCardBodyRowSubTitle}>
                  {getBalanceString(+plan.minimalStakingAmount, 8)} {plan.assetId}
                </div>
              </div>
            </div>
            <div className={styles.superchargeCardBody}>
              <div className={styles.superchargeCardProgressWrap}>
                <div className={styles.superchargeCardBodyRowTitle}>Left to deposit</div>
                <div className={styles.superchargeCardProgressTitle}>
                  {timeLeft.days} days {timeLeft.hours} hours {timeLeft.minutes} min
                </div>
                <ProgressBar value={progress} isBig />
              </div>
            </div>
          </div>
        </div>

        <button className='btn-new primary' onClick={setPlane} disabled={isDisabledBtn()} type='button'>
          {btnName()}
        </button>
      </div>
    </>
  )
}
