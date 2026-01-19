import { useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { RequestError, Success, SummaryBlockStake } from 'components'
import { EVENT_NAMES, StakingServices, useAnalytics } from 'wip/services'
import { Currencies } from 'wip/stores'
import { updateEarning } from 'wip/stores/init'
import { $allStakingContracts, $stakingPlans } from 'model/cefi-stacking'
import dangerOrange from 'assets/icons/danger-orange.svg'

import { $assetsRates } from '../../../model/cef-rates-coingecko'
import { $currency } from '../../../model/currency'
import styles from './styles.module.scss'

export interface LockBbankModal {
  amount: any
  currentStakingApyPercent: any
  maxOtherApiPercent: any
  assetIdRollingLeveledPlans: any
}

//TODO Deprecate?
export function LockBbankModal({
  amount,
  currentStakingApyPercent,
  maxOtherApiPercent,
  assetIdRollingLeveledPlans,
}: LockBbankModal) {
  const ratesRaw = useUnit($assetsRates)
  const currency = useUnit($currency)
  const stakingPlans = useUnit($stakingPlans)
  const stackingList = useUnit($allStakingContracts)
  const { myLogEvent } = useAnalytics()

  const [requestError, setRequestError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccessful, setIsSuccessful] = useState(false)
  const currencySymbol = currency.symbol === Currencies.USD ? 'USD' : 'EUR'

  const assetRate = ratesRaw?.find(
    assetRateRaw =>
      assetRateRaw?.fromAssetId === assetIdRollingLeveledPlans && assetRateRaw.toAssetId === currencySymbol
  )

  const bbankStakeAmount = stackingList
    .filter(stake => stake.assetId === assetIdRollingLeveledPlans)
    .reduce((acc, stake) => {
      return acc + +stake.amount
    }, 0)

  const rollingLeveledPlans = stakingPlans.rollingLeveledPlans
    .slice()
    .sort((a, b) => +b.minimalTargetPlanAmount - +a.minimalTargetPlanAmount)
  const targetPlan = rollingLeveledPlans.find(plan => bbankStakeAmount + +(amount ?? 0) >= +plan.minimalPlanAmount)
  const oldPlan = stackingList.find(stack => stack.isRollingLeveled)
  const oldPlanData = rollingLeveledPlans.find(plan => plan.id === oldPlan?.planId)

  const planIdForRequest =
    oldPlanData && targetPlan && +oldPlanData.minimalTargetPlanAmount >= +targetPlan.minimalTargetPlanAmount
      ? oldPlanData
      : targetPlan

  const handleBBankStack = async (): Promise<void> => {
    setIsLoading(true)
    try {
      if (planIdForRequest?.id) {
        await StakingServices.rollingCreate({ amount: +(amount ?? 0), planId: planIdForRequest.id })
        await updateEarning()
        myLogEvent(EVENT_NAMES.WEB_EARN_BBANK, { amount })
        setIsSuccessful(true)
      } else {
        throw new Error('Not plan')
      }
    } catch (error: any) {
      console.log('ERROR-handleBankStack', error)
      setRequestError(error.code || error.message)
    }
    setIsLoading(false)
  }

  if (isSuccessful) {
    return <Success text='Earning Successfully Setup' />
  }

  return (
    <>
      <div className={styles.title}>Lock {assetIdRollingLeveledPlans}</div>
      <div className={styles.content}>
        {/* <SummaryBlockStake
          amount={amount}
          assetRate={assetRate}
          targetPlan={planIdForRequest}
          currentStakingApyPercent={currentStakingApyPercent}
          maxOtherApiPercent={maxOtherApiPercent}
        /> */}
        <div className={styles.attentionText}>
          <img style={{ height: 24, marginRight: 24 }} alt='' src={dangerOrange} />
          <div>
            Locking additional {assetIdRollingLeveledPlans} tokens will accumulate in one group and reset the duration.
            Updated Tier Level will be assigned automatically.
          </div>
        </div>
        <button onClick={handleBBankStack} className={clsx('btn', 'btn-primary', styles.btnMobile)}>
          {isLoading ? <span className='spinner-border' /> : 'Confirm'}
        </button>

        {requestError ? <RequestError requestError={requestError} /> : null}
      </div>
    </>
  )
}
