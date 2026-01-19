import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { pages } from 'constant'
import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { TriangleIcon } from 'icons'
import { $assetEurData, $assetUsdData } from 'model/cefi-combain-assets-data'
import { $currency } from 'model/currency'

import { TxnHistoryTableBiz } from '../txn-history-table-biz'
import styles from './styles.module.scss'
import { FiatWalletCards } from 'biz/dashboard-biz/fiat-wallet-cards'

const filtersFiatWalletsBiz = {
  date: [],
  asset: [],
  type: ['Send Fiat', 'Receive Fiat'],
  status: [],
}

export function FiatWalletsBiz() {
  const navigate = useNavigate()
  const assetEurData = useUnit($assetEurData)
  const assetUsdData = useUnit($assetUsdData)
  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'usd' | 'eur'

  const navigateToTransactionHistory = () => {
    navigate(pages.TRANSACTIONS_HISTORY.path, { state: { data: filtersFiatWalletsBiz } })
  }

  const totalFiatBalance = (assetEurData[currencyType]?.cash || 0) + (assetUsdData[currencyType]?.cash || 0)
  const totalFiatBalanceForDisplay = addCommasToDisplayValue(totalFiatBalance.toString(), 2)
  const priceChangePercentage24h = 0

  const fiatAssets = [assetEurData /* , assetUsdData */]

  return (
    <div className={styles.mainContainer}>
      <section className={styles.walletSection}>
        <div className={styles.sectionHeader}>
          <label className={styles.walletColumnLabel}>Fiat Wallets</label>
        </div>

        <div className={styles.fiatWalletCardWrap}>
          <div className={styles.totalBalanceCard}>
            <div
              className={clsx(styles.priceChangeBox, {
                [styles.bgRed]: +priceChangePercentage24h < 0,
                [styles.bgGreen]: +priceChangePercentage24h >= 0,
              })}
            >
              <div
                className={styles.priceChangeBoxIcon}
                style={{
                  transform: +priceChangePercentage24h < 0 ? 'rotate(-90deg)' : 'rotate(90deg)',
                  marginTop: +priceChangePercentage24h < 0 ? -2 : 0,
                }}
              >
                <TriangleIcon fill={+priceChangePercentage24h < 0 ? '#D52941' : '#137547'} />
              </div>
              {priceChangePercentage24h}% 24h
              {/* TODO add priceChangePercentage24h */}
            </div>

            <div className={styles.totalBalanceTitleWrap}>
              <div className={styles.totalBalanceTitle}>
                {currency.symbol} {totalFiatBalanceForDisplay}
              </div>
              <div className={styles.totalBalanceSubTitle}>Total Fiat Balance</div>
            </div>
          </div>

          <FiatWalletCards fiatAssets={fiatAssets} />
        </div>
      </section>

      <section className={styles.transactionHistory}>
        <div className={styles.sectionHeader}>
          <label className={styles.walletColumnLabel}>Recent Fiat Transactions</label>
          <button onClick={navigateToTransactionHistory} className={styles.viewAllButton}>
            view all
          </button>
        </div>

        <div className={styles.txnHistoryWrap}>
          <TxnHistoryTableBiz transactionType={TYPE_TXN_HISTORY.FIAT} />
        </div>
      </section>
    </div>
  )
}
