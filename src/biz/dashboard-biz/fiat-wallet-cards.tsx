import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { pages } from 'constant'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { CombinedObject } from 'model/cefi-combain-assets-data'
import { CurrencyType, defaultCurrency } from 'model/currency'

import { theme, themeValue } from '../../config'
import styles from './styles.module.scss'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

type Props = {
  fiatAssets?: CombinedObject[]
}

export const FiatWalletCards = ({ fiatAssets }: Props) => {
  const navigate = useNavigate()
  const { isMobileBiz } = useCurrentBreakpoint()

  const isZekretTheme = theme === themeValue.zekret

  const navigateToReceiveFiat = () => {
    navigate(pages.RECEIVE_FIAT.path)
  }
  const navigateToSendFiat = () => {
    navigate(pages.SEND_FIAT.path)
  }

  if (!fiatAssets?.length) return null

  return (
    <div className={styles.fiatWalletCardWrap}>
      {fiatAssets.map(fiatAsset => {
        const icon = fiatAsset?.icon || ''
        const assetId = fiatAsset?.assetId || ''
        const symbolAsset = defaultCurrency[assetId as CurrencyType]?.symbol || ''
        const amount = (fiatAsset?.availableBalance ?? '').toString()
        const amountAddCommas = addCommasToDisplayValue(amount, 2)
        //TODO refactor addCommasToDisplayValue if 0 return 0.00
        const amountForDisplay = amountAddCommas === '0' ? '0.00' : amountAddCommas

        return fiatAssets?.length === 1 && !isMobileBiz ? (
          <div className={styles.cardContainer} key={assetId}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDetails}>
                <img className={clsx('asset-icon', styles.cardIcon)} src={icon} alt='' />
                <div className={styles.cardInfo}>
                  <div className={styles.cardAmount}>
                    {symbolAsset} {amountForDisplay}
                  </div>
                  <div className={styles.cardAssetId}>{assetId}</div>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button disabled={isZekretTheme} onClick={navigateToReceiveFiat} className='btn-biz blue'>
                  Receive
                </button>
                <button disabled={isZekretTheme} onClick={navigateToSendFiat} className='btn-biz grey'>
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.fiatWalletCard} key={assetId}>
            <div className={styles.fiatWalletCardRow}>
              <img className={clsx('asset-icon', styles.walletAssetIcon)} src={icon} alt='' />
              <div className={styles.walletAssetWrapText}>
                <div className={styles.walletText}>
                  {symbolAsset} {amountForDisplay}
                </div>
                <div className={styles.walletSubText}>{assetId}</div>
              </div>
            </div>

            <div className={styles.fiatWalletCardButtons}>
              <button disabled={isZekretTheme} onClick={navigateToReceiveFiat} className='btn-biz blue'>
                Receive
              </button>
              <button disabled={isZekretTheme} onClick={navigateToSendFiat} className='btn-biz grey'>
                Send
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
