import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { ProgressBar } from 'components'
import { getBalanceString } from 'utils'

import { $assetsListData } from '../../../model/cefi-combain-assets-data'
import { $currency } from '../../../model/currency'
import styles from './styles.module.scss'

export interface IndividualEarnModal {
  stake: any
  daysLeftPercent: any
  stakeDays: any
  daysLeft: any
  isLoading: any
  handleClaim: any
}
export function IndividualEarnModal({
  stake,
  daysLeftPercent,
  stakeDays,
  daysLeft,
  isLoading,
  handleClaim,
}: IndividualEarnModal) {
  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'
  const assets = useUnit($assetsListData)
  const navigate = useNavigate()
  const asset = assets.find(assetItem => assetItem.assetId === stake?.assetId)

  if (!stake || !asset) return null

  return (
    <div className={styles.individualTokenWrap}>
      <div className={styles.mobBackTitle}>
        <div className={styles.mobTitle}>
          <img style={{ width: 48, height: 48, borderRadius: 5, marginBottom: 16 }} src={asset.icon} alt='' />
          <div>{asset.assetName}</div>
          <div className={styles.symbolAsset}>{asset.symbol}</div>
        </div>
      </div>

      <div style={{ margin: '0 24px' }}>
        <div className={styles.blockWrap}>
          <div className={styles.blockTitle}>{asset.assetName} earned</div>

          <div className={styles.blockAmount}>
            {getBalanceString(+stake.expectedRewardAmount, 8)}
            <span style={{ marginLeft: 5 }} className={styles.blockTitle}>
              = {currency.symbol}
              {asset && getBalanceString(+stake.expectedRewardAmount * asset[currencyType].price, 2)}
            </span>
          </div>
        </div>
        <div className={styles.blockWrap} style={{ backgroundColor: '#9C88FD' }}>
          <div className={styles.blockTitle} style={{ color: '#FFFFFF', opacity: 0.8 }}>
            {asset.assetName} locked
          </div>

          <div className={styles.blockAmount}>
            {getBalanceString(+stake.amount, 8)}
            <span style={{ marginLeft: 5, color: '#FFFFFF', opacity: 0.8 }} className={styles.blockTitle}>
              = {currency.symbol}
              {asset && getBalanceString(+stake.amount * asset[currencyType].price, 2)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', marginTop: 18, justifyContent: 'space-between' }}>
          <div className={styles.blockWrap} style={{ backgroundColor: '#F7F6FD', flexGrow: 1, flexBasis: 0 }}>
            <div className={styles.blockTitle} style={{ color: '#445374', opacity: 0.5 }}>
              APY
            </div>
            <div className={styles.blockAmount} style={{ color: 'black' }}>
              {getBalanceString(+stake.stakingApyPercent, 2)}%
            </div>
          </div>
          <div style={{ width: 12 }} />
          <div className={styles.blockWrap} style={{ backgroundColor: '#F7F6FD', flexGrow: 1, flexBasis: 0 }}>
            <div className={styles.blockTitle} style={{ color: '#445374', opacity: 0.5 }}>
              Duration
            </div>
            <div className={styles.blockAmount} style={{ color: 'black' }}>
              {stakeDays || '--'} Days
            </div>
          </div>
        </div>

        <div className={styles.blockWrap} style={{ backgroundColor: '#F7F6FD', minHeight: 95 }}>
          <div className={styles.blockTitle} style={{ color: '#445374', opacity: 0.5 }}>
            Days left
          </div>
          <div className={styles.blockAmount} style={{ color: 'black' }}>
            {daysLeft || '--'} Days
          </div>
          <div style={{ margin: '0 -5px', paddingBottom: 12 }}>
            <ProgressBar value={daysLeftPercent || 0} isModal />
          </div>
        </div>

        <div
          className={styles.actionBtn}
          style={daysLeft ? { backgroundColor: '#F7F5FC', cursor: 'default', color: '#EFE3F7' } : {}}
          onClick={async () => {
            try {
              if (!daysLeft && handleClaim) {
                await handleClaim(stake)
                navigate(-1)
              }
            } catch (e) {
              console.log('ERROR-handleClaim-Mobile', e)
            }
          }}
        >
          {isLoading ? <span className='spinner-border' /> : 'Unlock & Claim'}
        </div>
        <div style={{ height: 20 }} />
      </div>
    </div>
  )
}
