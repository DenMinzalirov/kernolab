import { Dispatch, SetStateAction, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'

import { ProgressBar } from 'components'
import { pages } from 'constant'
import { convertTimestampToISO } from 'utils'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { calculateStakeProgress } from 'utils/calculate-stake-progress'
import { handleError } from 'utils/error-handler'
import { StakingCampaignContractResponse, StakingServices } from 'wip/services'
import { updateEarning } from 'wip/stores/init'
import { $assetsListData } from 'model/cefi-combain-assets-data'
import { $stakingPlans } from 'model/cefi-stacking'

import Hint from './hint-new'
import styles from './styles.module.scss'
import { calculateTimeLeft, calculateTimeLeftNumber } from './timeLeftHelper'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export interface EarnSuperchargeRow {
  stake: StakingCampaignContractResponse
}

export function EarnSuperchargeRow({ stake }: EarnSuperchargeRow) {
  const navigate = useNavigate()
  const assets = useUnit($assetsListData)
  const asset = assets.find(assetItem => assetItem.assetId === stake.assetId)
  const stakingPlans = useUnit($stakingPlans)
  const campaignPlans = stakingPlans?.campaignPlans || []
  const currentCampaignPlan = campaignPlans.find(campaignPlan => campaignPlan.id === stake.campaignId)
  const [isLoading, setIsLoading] = useState(false)
  const { isMobilePairs, isTabletPairs, isDesktopSPairs, isDesktopPairs } = useCurrentBreakpointPairs()

  const preparedExpectedCloseDate = convertTimestampToISO(stake.closeDate)
  const preparedOpenDate = convertTimestampToISO(stake.openDate)

  const minutesDiffToday = moment(preparedExpectedCloseDate).diff(moment(), 'minutes')
  const currentDate = new Date().toISOString()
  const currentDateObj = new Date(currentDate)
  const closeDateFormat = moment(stake.closeDate).format('DD MMMM YYYY')

  const handleClaim = async (stakeItem: StakingCampaignContractResponse): Promise<void> => {
    setIsLoading(true)
    try {
      await StakingServices.campaignClaim(stakeItem.id)
      await updateEarning()
    } catch (error) {
      console.log('ERROR-handleClaim', error)
      handleError(error)
    }
    setIsLoading(false)
  }

  const handleAddSupercharge = async (stakeItem: StakingCampaignContractResponse): Promise<void> => {
    setIsLoading(true)
    try {
      navigate(pages.NEW_SUPERCHARGE.path, { state: { stakeItem } })
    } catch (error) {
      console.log('ERROR-handleAddSupercharge', error)
    }
    setIsLoading(false)
  }

  const [isOpenHint, setIsOpenHint] = useState(false)

  const handleOpenHint = (): void => {
    setIsOpenHint(true)
    setTimeout(() => {
      setIsOpenHint(false)
    }, 3000)
  }

  const estimatedReward = () => {
    const value = stake.estimatedRewardAmount
    if (!+value) {
      return '>0.00001'
    }
    return addCommasToDisplayValue(value, 5)
  }

  const { progress, stakeDays } = calculateStakeProgress(stake.openDate, stake.closeDate)
  const timeLeftNumber = calculateTimeLeftNumber(stake.closeDate)
  const daysLeftFormat = timeLeftNumber ? calculateTimeLeft(stake.closeDate) : 'Complete'

  return (
    <div
      onClick={() => (isMobilePairs ? navigate(pages.EARN_INFO.path, { state: { supercharge: stake } }) : null)}
      className={styles.tableRowSupercharge}
    >
      {/* Name */}
      <div className={styles.cellS1}>
        <img className={clsx('asset-icon', styles.assetIcon)} src={asset?.icon} alt='' />
        {!isMobilePairs ? (
          <div className={clsx(styles.cell1Content, styles.assetName)}>
            {asset?.assetName || ''}
            <span className={isTabletPairs ? styles.tableSubText : styles.assetId}>{stake.assetId}</span>
          </div>
        ) : null}

        {isMobilePairs ? (
          <div className={clsx(styles.cell1Content, styles.assetName)}>
            {asset?.assetName || ''}
            <ProgressBar value={progress} />
          </div>
        ) : null}
      </div>

      {/* Locked */}
      <div className={styles.cellS2}>
        {addCommasToDisplayValue((+stake.userStakingAmount).toString(), 8)} {isMobilePairs ? '' : stake.assetId}
        {isTabletPairs ? (
          <div className={styles.tableSubText}>
            {estimatedReward()} {stake.payedAssetId}
          </div>
        ) : null}
        {isMobilePairs ? <div className={styles.tableSubText}>Currently Locked</div> : ''}
      </div>

      {/* Estimated Reward */}
      <div className={styles.cellS3}>
        <div className={styles.tableRowText}>
          {estimatedReward()} {stake.payedAssetId}
        </div>
      </div>

      {/* Locked until: */}
      <div className={clsx(styles.cellS4, styles.tableRowText)}>{closeDateFormat}</div>

      {/* Days Left: */}
      <div className={styles.cellS5}>
        {isDesktopPairs ? daysLeftFormat : null}
        {isDesktopSPairs || isTabletPairs ? (
          <div>
            {timeLeftNumber ? (
              <div>
                {stakeDays} <span className={styles.tableSubText}>({timeLeftNumber} left)</span>
              </div>
            ) : (
              'Completed'
            )}
          </div>
        ) : null}
        <div className={styles.progressBarWrap}>
          <ProgressBar value={progress} />
        </div>
      </div>

      {/* Actions */}
      <div className={styles.cellS6}>
        {currentDateObj < new Date(currentCampaignPlan?.endDepositDate || stake.closeDate) ? (
          <div className={clsx(styles.actionBtn)} onClick={() => handleAddSupercharge(stake)}>
            {isLoading ? <span className='spinner-border' /> : 'Add more'}
          </div>
        ) : (
          <div
            onMouseEnter={() => {
              return minutesDiffToday >= 0 ? handleOpenHint() : null
            }}
            onMouseLeave={() => {
              return minutesDiffToday >= 0 ? setIsOpenHint(false) : null
            }}
            className={clsx(styles.actionBtn, minutesDiffToday >= 0 ? styles.actionBtnDisabled : '')}
            style={isOpenHint ? { opacity: 1 } : {}}
            onClick={minutesDiffToday >= 0 ? () => handleOpenHint() : () => handleClaim(stake)}
          >
            {isLoading ? <span className='spinner-border' /> : 'Unlock & Claim'}
            {isOpenHint ? <Hint /> : null}
          </div>
        )}
      </div>
    </div>
  )
}
