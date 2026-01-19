import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from '../../../components'
import { $tierLevel } from '../../../model/cefi-stacking'
import { getBalanceString } from '../../../utils'
import { StakingCampaignResponse } from '../../../wip/services'
import styles from './styles.module.scss'
import superchargeADA from './supercharge-assets/superchargeADA.png'
import superchargeAVAX from './supercharge-assets/superchargeAVAX.png'
import superchargeBBANK from './supercharge-assets/superchargeBBANK.png'
import superchargeBNB from './supercharge-assets/superchargeBNB.png'
import superchargeBTC from './supercharge-assets/superchargeBTC.png'
import superchargeDOGE from './supercharge-assets/superchargeDOGE.png'
import superchargeDOT from './supercharge-assets/superchargeDOT.png'
import superchargeETH from './supercharge-assets/superchargeETH.png'
import superchargeFI from './supercharge-assets/superchargeFI.png'
import superchargeLTC from './supercharge-assets/superchargeLTC.png'
import superchargeMATIC from './supercharge-assets/superchargeMATIC.png'
import superchargeNEAR from './supercharge-assets/superchargeNEAR.png'
import superchargePEPE from './supercharge-assets/superchargePEPE.png'
import superchargeSHIB from './supercharge-assets/superchargeSHIB.png'
import superchargeSOL from './supercharge-assets/superchargeSOL.png'
import superchargeTON from './supercharge-assets/superchargeTON.png'
import superchargeTRX from './supercharge-assets/superchargeTRX.png'
import superchargeUNI from './supercharge-assets/superchargeUNI.png'
import superchargeUSDC from './supercharge-assets/superchargeUSDC.png'
import superchargeUSDT from './supercharge-assets/superchargeUSDT.png'
import superchargeXLM from './supercharge-assets/superchargeXLM.png'
import superchargeXRP from './supercharge-assets/superchargeXRP.png'
import superchargeXTZ from './supercharge-assets/superchargeXTZ.png'

const assetsSuperchargePrizeImages: Record<string, string> = {
  FI: superchargeFI,
  BNB: superchargeBNB,
  ETH: superchargeETH,
  ADA: superchargeADA,
  AVAX: superchargeAVAX,
  BBANK: superchargeBBANK,
  BTC: superchargeBTC,
  DOGE: superchargeDOGE,
  DOT: superchargeDOT,
  LTC: superchargeLTC,
  MATIC: superchargeMATIC,
  NEAR: superchargeNEAR,
  PEPE: superchargePEPE,
  SHIB: superchargeSHIB,
  SOL: superchargeSOL,
  TON: superchargeTON,
  TRX: superchargeTRX,
  UNI: superchargeUNI,
  USDC: superchargeUSDC,
  USDT: superchargeUSDT,
  XLM: superchargeXLM,
  XRP: superchargeXRP,
  XTZ: superchargeXTZ,
}

type Props = {
  plan: StakingCampaignResponse
  setCampaignPlanForStake: Dispatch<SetStateAction<StakingCampaignResponse | null>>
  setIsSupercharge: Dispatch<SetStateAction<boolean>>
}

//TODO old DELETE
export function SuperchargeItem({ plan, setCampaignPlanForStake, setIsSupercharge }: Props) {
  const userLevel = useUnit($tierLevel)
  const planImage = assetsSuperchargePrizeImages[plan.assetId] || superchargeFI

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
    if (userLevel < plan.requiredUserLevel) {
      setIsSupercharge(false)
      Modal.close()
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
    return 'Lock Now'
  }

  const isDisabledBtn = () => {
    if (userLevel < plan.requiredUserLevel) {
      return false
    }
    if (currentDateObj > new Date(plan.endDepositDate)) return true
    return currentDateObj < new Date(plan.startDate)
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        marginBottom: 30,
        borderRadius: 10,
        flexDirection: 'row',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      <div className={styles.timerWrap} style={{ backgroundImage: `url(${planImage})` }}>
        <div style={{ margin: '17px 14px', padding: '0 17px' }}>
          <div className={styles.counterTitle}>
            {currentDateObj < new Date(plan.startDate) ? 'Left until event start' : 'Time left to deposit'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div className={styles.counterItem}>{timeLeft.days}</div>
              <div className={styles.counterDateText}>days</div>
            </div>

            <div className={styles.dotCounter}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div className={styles.counterItem}>{timeLeft.hours}</div>
              <div className={styles.counterDateText}>hours</div>
            </div>
            <div className={styles.dotCounter}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div className={styles.counterItem}>{timeLeft.minutes}</div>
              <div className={styles.counterDateText}>min</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', padding: '14px 20px', flexDirection: 'column', flexGrow: 1 }}>
        <div className={styles.infoTitle}>Prize Pool:</div>
        <div className={styles.infoAssetAmount}>
          {getBalanceString(+plan.prizePoolAmount, 2)} {plan.prizePoolAssetId}
        </div>
        <div className={styles.infoSuperchargeWrap}>
          <div className={styles.infoSuperchargeCol1}>Accepted assets</div>
          <div className={styles.infoSuperchargeCol2}>{plan.assetId}</div>
        </div>
        <div className={styles.infoSuperchargeWrap}>
          <div className={styles.infoSuperchargeCol1}>Lockup period</div>
          <div className={styles.infoSuperchargeCol2}>{new Date(plan.lockupDate).toLocaleString()}</div>
        </div>
        <div className={styles.infoSuperchargeWrap}>
          <div className={styles.infoSuperchargeCol1}>Total currently locked</div>
          <div className={styles.infoSuperchargeCol2}>
            {getBalanceString(+plan.currentStakingAmount, 8)} {plan.assetId}
          </div>
        </div>
        <div className={styles.infoSuperchargeWrap}>
          <div className={styles.infoSuperchargeCol1}>Min amount to stake</div>
          <div className={styles.infoSuperchargeCol2}>
            {getBalanceString(+plan.minimalStakingAmount, 8)} {plan.assetId}
          </div>
        </div>
        <div style={{ flexGrow: 1 }} />
        <button
          disabled={isDisabledBtn()}
          style={{ opacity: isDisabledBtn() ? 0.5 : 1 }}
          onClick={setPlane}
          className={clsx('btn-new primary big')}
        >
          {btnName()}
        </button>
      </div>
    </div>
  )
}
