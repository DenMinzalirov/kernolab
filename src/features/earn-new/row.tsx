import { useState } from 'react'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'

import { Modal, ProgressBar } from 'components'
import { pages } from 'constant'
import { IndividualEarnModal } from 'features/modals'
import { convertTimestampToISO, getBalanceString } from 'utils'
import { handleError } from 'utils/error-handler'
import { StakingContract, StakingServices } from 'wip/services'
import { updateEarning } from 'wip/stores/init'

import { $assetsListData } from '../../model/cefi-combain-assets-data'
import { $currency } from '../../model/currency'
import { addCommasToDisplayValue } from '../../utils/add-commas-to-display-value'
import Hint from './hint-new'
import styles from './styles.module.scss'
import { calculateTimeLeft } from './timeLeftHelper'

export interface EarnRow {
  stake: StakingContract
}

//TODO old DELETE

function EarnRow({ stake }: EarnRow) {
  // const { assets, currency, setSnackComponent } = stores
  const currency = useUnit($currency)
  const assets = useUnit($assetsListData)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'

  const [isLoading, setIsLoading] = useState(false)

  const preparedExpectedCloseDate = convertTimestampToISO(stake.expectedCloseDate)
  const preparedOpenDate = convertTimestampToISO(stake.openDate)

  const asset = assets.find(assetItem => assetItem.assetId === stake.assetId)
  const stakeDays = moment(preparedExpectedCloseDate).diff(preparedOpenDate, 'days')
  const daysDiffToday = moment(preparedExpectedCloseDate).diff(moment(), 'days')
  const daysLeft = daysDiffToday >= 0 ? daysDiffToday : 0
  const daysLeftPercent = daysDiffToday >= 0 ? (daysDiffToday / stakeDays) * 100 : 0

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
    setTimeout(() => {
      setIsOpenHint(false)
    }, 3000)
  }

  const goToEarnPage = () => {
    Modal.open(
      <IndividualEarnModal
        stake={stake}
        daysLeftPercent={daysLeftPercent}
        stakeDays={stakeDays}
        daysLeft={daysLeft}
        isLoading={isLoading}
        handleClaim={handleClaim}
      />,
      { title: pages.EARN.name, isFullScreen: true }
    )
  }

  return (
    <>
      {/*<div onClick={goToEarnPage} className={styles.rowMobile}>*/}
      {/*  <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>*/}
      {/*    <img style={{ width: 48, height: 48, borderRadius: 5, marginRight: 11 }} src={asset?.icon} alt='' />*/}
      {/*    <div*/}
      {/*      style={{*/}
      {/*        height: '100%',*/}
      {/*        display: 'flex',*/}
      {/*        flexDirection: 'column',*/}
      {/*        justifyContent: 'space-around',*/}
      {/*        flexGrow: 1,*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      <div className={styles.assetName}>{stake.assetId}</div>*/}
      {/*      <ProgressBar value={daysLeftPercent} />*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div*/}
      {/*    style={{*/}
      {/*      display: 'flex',*/}
      {/*      flexDirection: 'column',*/}
      {/*      justifyContent: 'space-around',*/}
      {/*      alignItems: 'end',*/}
      {/*      marginLeft: 10,*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <div>{getBalanceString(+stake.amount, 8)}</div>*/}
      {/*    <div style={{ fontSize: 11, color: '#858EAA', fontWeight: 400 }}>*/}
      {/*      Interest Paid {getBalanceString(+stake.payedRewardAmount, 2)}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      <div className={clsx(styles.row)}>
        <div className={clsx(styles.cell, styles.cell3)}>
          <img style={{ width: 46, height: 46, borderRadius: 5 }} src={asset?.icon} alt='' />

          <div className={styles.assetName}>
            {asset?.assetName || ''}&nbsp;<span className={styles.assetId}>{stake.assetId}</span>
          </div>
          {/*<div className={clsx(styles.assetName, styles.assetId)}>{stake.assetId}</div>*/}
        </div>
        <div style={{ flexGrow: 1 }} />
        <div className={clsx(styles.cell, styles.cell2)}>
          {/*{getBalanceString(+stake.amount, 8)} */}
          {addCommasToDisplayValue((+stake.amount).toString(), 8)} {stake.assetId}
        </div>
        <div style={{ flexGrow: 1 }} />
        <div className={clsx(styles.cell, styles.cell4)}>
          {currency.symbol}
          {asset && getBalanceString(+stake.amount * asset[currencyType].price, 2)}
        </div>
        <div style={{ flexGrow: 1 }} />
        <div className={clsx(styles.cell, styles.cell5)}>{getBalanceString(+stake.stakingApyPercent, 2)}%</div>
        <div style={{ flexGrow: 1 }} />
        <div className={clsx(styles.cell, styles.cell4)}>{getBalanceString(+stake.payedRewardAmount, 8)}</div>
        <div style={{ flexGrow: 1 }} />
        <div className={clsx(styles.cell, styles.cell1)} style={{ display: 'flex', alignItems: 'center' }}>
          <div>{stakeDays}&nbsp;Days</div>
          <ProgressBar value={daysLeftPercent} />
        </div>
        <div style={{ flexGrow: 1 }} />
        <div className={clsx(styles.cell, styles.cell4)}>{calculateTimeLeft(stake.expectedCloseDate)}</div>
        <div style={{ flexGrow: 1 }} />
        <div className={clsx(styles.cell, styles.cell2)}>
          <div
            onMouseEnter={() => {
              return daysLeft ? handleOpenHint() : null
            }}
            onMouseLeave={() => {
              return daysLeft ? setIsOpenHint(false) : null
            }}
            className={styles.actionBtn}
            style={
              new Date(stake.expectedCloseDate) > new Date() ? { backgroundColor: '#ECECED', cursor: 'default' } : {}
            }
            onClick={new Date(stake.expectedCloseDate) > new Date() ? () => handleOpenHint() : () => handleClaim(stake)}
          >
            {isLoading ? <span className='spinner-border' /> : 'Unlock & Claim'}
            {isOpenHint ? <Hint /> : null}
          </div>
        </div>
      </div>
    </>
  )
}
