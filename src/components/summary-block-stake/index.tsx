import { useUnit } from 'effector-react'

import { getBalanceString } from 'utils'

import { $currency } from '../../model/currency'
import styles from './styles.module.scss'

export interface SummaryBlockStake {
  amount: any
  assetRate: number
  fromAssetId: string
  targetPlan: any
  currentStakingApyPercent: any
  maxOtherApiPercent: any
  isCurrency?: boolean
}

// TODO delete assetRate all where we can use asset[currencyType].price
export function SummaryBlockStake({
  amount,
  assetRate,
  fromAssetId,
  targetPlan,
  currentStakingApyPercent,
  maxOtherApiPercent,
  isCurrency,
}: SummaryBlockStake) {
  const currency = useUnit($currency)

  const currencyCheckAmount = () => {
    const amountItem = isCurrency ? amount : getBalanceString(+amount * (assetRate || 0), 2)
    if (+amountItem === 0) {
      return '< '
    } else return ''
  }

  return (
    <>
      <div className={styles.summaryBlockTitle}>Amount</div>
      <div className={styles.cryptoAmount}>
        {fromAssetId} {isCurrency ? getBalanceString(+amount / (assetRate || 0), 8) : amount}
      </div>
      <div className={styles.currencyAmount}>
        {currencyCheckAmount()} {currency.symbol}
        {isCurrency ? amount : getBalanceString(+amount * (assetRate || 0), 2)}
      </div>
      <div className={styles.conversion}>
        Conversion Rate: 1 {fromAssetId} = {currency.symbol} {assetRate || 0}
      </div>
      <div className={styles.divider} />
      <div className={styles.summaryBlockTitle}>Duration</div>
      <div className={styles.daysLeft}>{targetPlan?.stakingPeriod || '184'} Days</div>
      <div className={styles.divider} />
      <div className={styles.summaryBlockTitle}>Tier</div>
      <div className={styles.cryptoAmount}>
        <div>
          {Number(targetPlan?.stakingApyPercent || currentStakingApyPercent)}% APY {fromAssetId}
        </div>
        {/*TODO: fo pairs stake ?*/}
        {['FI', 'PAIRS'].includes(fromAssetId) && (
          <>
            <div className={styles.dot2} />
            <div>{Number(maxOtherApiPercent)}% APY Other</div>
          </>
        )}
      </div>
    </>
  )
}
