import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { pages } from 'constant'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { $assetEurData, $assetsListData, $assetUsdData } from 'model/cefi-combain-assets-data'

import styles from './styles.module.scss'

export function MyBalancesBiz() {
  const navigate = useNavigate()

  const assets = useUnit($assetsListData)
  const assetEurData = useUnit($assetEurData)
  // const assetUsdData = useUnit($assetUsdData)

  const topEightAsset = [...assets, assetEurData].sort((a, b) => b.availableBalance - a.availableBalance).slice(0, 8)

  const navigateToCryptoWallets = () => {
    navigate(pages.CRYPTO_WALLETS.path)
  }
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.title}>My Balances</label>
        <button onClick={navigateToCryptoWallets} className={styles.viewAllButton}>
          view all
        </button>
      </div>

      <div className={styles.itemsWrap}>
        {topEightAsset.map((item, index) => {
          const amount = (+item?.availableBalance || 0).toString()
          const amountForDisplay = addCommasToDisplayValue(amount, 8)

          return (
            // eslint-disable-next-line react/no-array-index-key
            <div className={styles.item} key={index}>
              <img className={clsx(styles.itemIcon, 'asset-icon')} src={item.icon || ''} alt='icon' />
              <div className={styles.itemTextWrap}>
                <div className={styles.itemText}>{amountForDisplay}</div>
                <div className={styles.itemSubText}>{item.assetId}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
