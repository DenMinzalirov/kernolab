import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'

import { HeaderTitle, ProgressBar } from 'components'
import { pages } from 'constant'
import { calculateTimeLeft } from 'features/earn-new/timeLeftHelper'
import { convertTimestampToISO, getBalanceString } from 'utils'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { calculateStakeProgress } from 'utils/calculate-stake-progress'
import { handleError } from 'utils/error-handler'
import { StakingCampaignContractResponse, StakingContract, StakingServices } from 'wip/services'
import { updateEarning } from 'wip/stores/init'
import { $assetsListData } from 'model/cefi-combain-assets-data'
import { $currency } from 'model/currency'

import styles from './styles.module.scss'

// Earn and Supercharge
export function EarnInfo() {
  const navigate = useNavigate()
  const location = useLocation()
  const stake: StakingContract | undefined = location?.state?.stake
  const supercharge: StakingCampaignContractResponse | undefined = location?.state?.supercharge
  const currency = useUnit($currency)
  const assets = useUnit($assetsListData)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'

  const [isLoading, setIsLoading] = useState(false)

  if (!stake && !supercharge) {
    return <Navigate to={pages.EARN.path} replace />
  }

  const preparedExpectedCloseDate = convertTimestampToISO(stake?.expectedCloseDate || supercharge?.closeDate || '')
  const preparedOpenDate = convertTimestampToISO(stake?.openDate || supercharge?.openDate || '')

  const asset = assets.find(assetItem => assetItem.assetId === stake?.assetId)
  const assetForSupercharge = assets.find(assetItem => assetItem.assetId === supercharge?.assetId)

  const { progress, stakeDays } = calculateStakeProgress(preparedOpenDate, preparedExpectedCloseDate)

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

  const handleSuperchargeClaim = async (stakeItem: StakingCampaignContractResponse): Promise<void> => {
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

  const estimatedReward = () => {
    const value = supercharge?.estimatedRewardAmount
    if (value && !+value) {
      return '>0.00001'
    }
    return addCommasToDisplayValue(value, 5)
  }

  const handleAdd = () => {
    if (stake) {
      navigate(pages.NEW_EARNING.path, { state: { stake } })
    }
    if (supercharge) {
      navigate(pages.NEW_SUPERCHARGE.path, { state: { stakeItem: supercharge } })
    }
  }

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={'Earnings'} showBackBtn />

      {stake ? (
        <div className={styles.contentWrap}>
          <div className={styles.header}>
            <img className={clsx('asset-icon', styles.headerIcon)} src={asset?.icon} alt='' />
            <div className={styles.headerTitleWrap}>
              <div className={styles.headerTitle}>{asset?.assetName || ''}</div>
              <div className={styles.headerSubTitle}>{stake?.assetId}</div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.card}>
              <div className={styles.cardSubTitle}>{asset?.assetName || ''} Earned</div>
              <div className={styles.cardTitleWrap}>
                <div className={styles.cardTitle}>{getBalanceString(+stake.payedRewardAmount, 8)}</div>
                {/* <div className={styles.cardSubTitle}>= $5,600.59</div> */}
              </div>
            </div>
            <div className={styles.cardWithButtonWrap}>
              <div className={styles.cardWithButtonBody}>
                <div className={styles.cardSubTitle}>{asset?.assetName || ''} locked</div>
                <div className={styles.cardTitleWrap}>
                  <div className={styles.cardTitle}>{addCommasToDisplayValue((+stake.amount).toString(), 8)}</div>
                  <div className={styles.cardSubTitle}>
                    = {currency.symbol}
                    {asset && getBalanceString(+stake.amount * asset[currencyType].price, 2)}
                  </div>
                </div>
              </div>
              {/* TODO disabled add Earn not available */}
              {/* <button onClick={handleAdd} className={clsx(styles.circleButton, styles.circleButtonDisabled)} disabled /> */}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.cardsWrap}>
              <div className={styles.card}>
                <div className={styles.cardSubTitle}>APY</div>
                <div className={styles.cardTitleWrap}>
                  <div className={styles.cardTitle}>{getBalanceString(+stake.stakingApyPercent, 2)}%</div>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardSubTitle}>Duration:</div>
                <div className={styles.cardTitleWrap}>
                  <div className={styles.cardTitle}>{stakeDays}&nbsp;Days</div>
                </div>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardSubTitle}>Days left</div>
              <div className={styles.cardTitleWrap}>
                <div className={styles.cardTitle}>{calculateTimeLeft(stake.expectedCloseDate)}</div>
              </div>

              <div className={styles.progressWrap}>
                <ProgressBar value={progress} isBig />
              </div>
            </div>
          </div>

          <div className={styles.flexGrow1} />
          <button
            onClick={() => handleClaim(stake)}
            className='btn-new primary height-62'
            disabled={new Date(stake.expectedCloseDate) > new Date()}
          >
            {isLoading ? <span className='spinner-border' /> : 'Collect'}
          </button>
        </div>
      ) : null}

      {supercharge ? (
        <div className={styles.contentWrap}>
          <div className={styles.header}>
            <img className={clsx('asset-icon', styles.headerIcon)} src={assetForSupercharge?.icon} alt='' />
            <div className={styles.headerTitleWrap}>
              <div className={styles.headerTitle}>{assetForSupercharge?.assetName || ''}</div>
              <div className={styles.headerSubTitle}>{stake?.assetId}</div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.cardWithButtonWrap}>
              <div className={styles.cardWithButtonBody}>
                <div className={styles.cardSubTitle}>Locked:</div>
                <div className={styles.cardTitleWrap}>
                  <div className={styles.cardTitle}>
                    {addCommasToDisplayValue((+supercharge.userStakingAmount).toString(), 8)} {supercharge.assetId}
                  </div>
                </div>
              </div>
              <button onClick={handleAdd} className={clsx(styles.circleButton)} />
            </div>

            <div className={styles.card}>
              <div className={styles.cardSubTitle}>Estimated Reward</div>
              <div className={styles.cardTitleWrap}>
                <div className={styles.cardTitle}>{estimatedReward()}</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.card}>
              <div className={styles.cardSubTitle}>Locked Until:</div>
              <div className={styles.cardTitleWrap}>
                <div className={styles.cardTitle}>{moment(supercharge.closeDate).format('DD MMMM YYYY')}</div>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardSubTitle}>Days left:</div>
              <div className={styles.cardTitleWrap}>
                <div className={styles.cardTitle}>{calculateTimeLeft(supercharge.closeDate)}</div>
              </div>

              <div className={styles.progressWrap}>
                <ProgressBar value={progress} isBig />
              </div>
            </div>
          </div>

          <div className={styles.flexGrow1} />
          <button
            onClick={() => handleSuperchargeClaim(supercharge)}
            className='btn-new primary height-62'
            disabled={new Date(supercharge.closeDate) > new Date()}
          >
            {isLoading ? <span className='spinner-border' /> : 'Collect'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
