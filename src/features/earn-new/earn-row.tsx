import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'

import { ProgressBar } from 'components'
import { pages } from 'constant'
import { convertTimestampToISO, getBalanceString } from 'utils'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { calculateStakeProgress } from 'utils/calculate-stake-progress'
import { handleError } from 'utils/error-handler'
import { StakingContract, StakingServices } from 'wip/services'
import { updateEarning } from 'wip/stores/init'
import { $assetsListData } from 'model/cefi-combain-assets-data'
import { $currency } from 'model/currency'

import Hint from './hint-new'
import styles from './styles.module.scss'
import { calculateTimeLeft, calculateTimeLeftNumber } from './timeLeftHelper'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export interface EarnRow {
  stake: StakingContract
}

export function EarnRowNew({ stake }: EarnRow) {
  const navigate = useNavigate()
  const currency = useUnit($currency)
  const assets = useUnit($assetsListData)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'
  const { isDesktopPairs, isDesktopSPairs, isTabletPairs, isMobilePairs } = useCurrentBreakpointPairs()

  const [isLoading, setIsLoading] = useState(false)

  const preparedExpectedCloseDate = convertTimestampToISO(stake.expectedCloseDate)
  const preparedOpenDate = convertTimestampToISO(stake.openDate)

  const asset = assets.find(assetItem => assetItem.assetId === stake.assetId)

  const { progress, daysLeft, stakeDays } = calculateStakeProgress(preparedOpenDate, preparedExpectedCloseDate)

  const handleClaim = async (stakeItem: StakingContract): Promise<void> => {
    let claimService = StakingServices.createSimpleClaim
    if (stakeItem.isRollingLeveled) claimService = StakingServices.createRollingClaim
    if (stakeItem.isRollingResponses) claimService = StakingServices.createRollingClaimOld
    setIsLoading(true)
    try {
      await claimService({ contractId: stakeItem.id.toString() })
      await updateEarning()
    } catch (error) {
      console.log('ERROR-handleClaim', error)
      handleError(error)
    }
    setIsLoading(false)
  }

  const [isOpenHint, setIsOpenHint] = useState(false)

  const handleOpenHint = (): void => {
    setIsOpenHint(true)
    // setTimeout(() => {
    //   setIsOpenHint(false)
    // }, 3000)
  }

  const timeLeftNumber = calculateTimeLeftNumber(stake.expectedCloseDate)

  return (
    <div
      onClick={() => (isMobilePairs ? navigate(pages.EARN_INFO.path, { state: { stake } }) : null)}
      className={styles.tableRow}
    >
      {/* Name or Name & Value(tablet) */}
      <div className={styles.cell1}>
        <img className={clsx('asset-icon', styles.assetIcon)} src={asset?.icon} alt='' />

        {!isMobilePairs ? (
          <div className={clsx(styles.cell1Content, styles.assetName)}>
            {asset?.assetName || ''}
            <span className={isTabletPairs ? styles.tableSubText : styles.assetId}>
              {isTabletPairs ? `${addCommasToDisplayValue((+stake.amount).toString(), 8)} ` : ''}
              {stake.assetId}
            </span>
          </div>
        ) : null}

        {isMobilePairs ? (
          <div className={clsx(styles.cell1Content, styles.assetName)}>
            {asset?.assetName || ''}
            <ProgressBar value={progress} />
          </div>
        ) : null}
      </div>

      {/* Locked  or Locked & Value*/}
      <div className={styles.cell2}>
        {addCommasToDisplayValue((+stake.amount).toString(), 8)} {stake.assetId}
        {isDesktopSPairs ? (
          <div className={styles.tableSubText}>
            {currency.symbol}
            {asset && getBalanceString(+stake.amount * asset[currencyType].price, 2)}
          </div>
        ) : null}
      </div>

      {/* Value or hide*/}
      <div className={styles.cell3}>
        <div className={styles.tableRowText}>
          {currency.symbol}
          {asset && getBalanceString(+stake.amount * asset[currencyType].price, 2)}
        </div>
      </div>

      {/* APY or APY & Paid Interest*/}
      <div className={clsx(styles.cell4, styles.tableRowText)}>
        {getBalanceString(+stake.stakingApyPercent, 2)}%
        {isDesktopSPairs ? (
          <div className={styles.tableSubText}>
            {currency.symbol}
            {getBalanceString(+stake.payedRewardAmount, 8)}
          </div>
        ) : null}
      </div>

      {/* Paid Interest or hide or Locked & Paid Interest*/}
      <div className={styles.cell5}>
        {!isMobilePairs ? `${currency.symbol} ${getBalanceString(+stake.payedRewardAmount, 8)}` : null}

        {isMobilePairs ? (
          <>
            {addCommasToDisplayValue((+stake.amount).toString(), 8)}
            <div className={styles.tableSubText}>Interest Paid {getBalanceString(+stake.payedRewardAmount, 8)}</div>
          </>
        ) : null}
      </div>

      {/* Total Duration or Total Duration & Days Left*/}
      <div className={styles.cell6}>
        {isDesktopPairs ? <div>{stakeDays}&nbsp;Days</div> : null}
        {isDesktopSPairs || isTabletPairs ? (
          <div>{timeLeftNumber ? `${timeLeftNumber}/${stakeDays}` : 'Completed'}</div>
        ) : null}
        <div className={styles.progressBarWrap}>
          <ProgressBar value={progress} />
        </div>
      </div>

      {/* cell 7  Days Left*/}
      <div className={styles.cell7}>{calculateTimeLeft(stake.expectedCloseDate)}</div>

      {/* cell 8 Actions */}
      <div className={styles.cell8}>
        <div
          onMouseEnter={() => {
            return daysLeft ? handleOpenHint() : null
          }}
          onMouseLeave={() => {
            return setIsOpenHint(false)
          }}
          className={clsx(
            styles.actionBtn,
            new Date(stake.expectedCloseDate) > new Date() ? styles.actionBtnDisabled : ''
          )}
          style={isOpenHint ? { opacity: 1 } : {}}
          onClick={new Date(stake.expectedCloseDate) > new Date() ? () => handleOpenHint() : () => handleClaim(stake)}
        >
          {isLoading ? <span className='spinner-border' /> : 'Unlock & Claim'}
          {isOpenHint ? <Hint /> : null}
        </div>
      </div>
    </div>
  )
}
