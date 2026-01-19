import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { CountdownTimer } from 'components/countdown-timer'
import { pages } from 'constant'
import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { calculateTimeRemaining } from 'utils/calculate-time-remaining'
import { $assetEurData, $assetsListData, $assetUsdData } from 'model/cefi-combain-assets-data'
import { $stepUpBlockExpiration } from 'model/step-up-block-expiration'

import { theme, themeValue } from '../../config'
import { useHeightControl } from '../../hooks/use-height-control'
import { CryptoWalletRow } from './crypto-wallet-row'
import { FiatWalletCards } from './fiat-wallet-cards'
import { getPriorityAssets } from './helpers/get-priority-assets'
import { MarketsDashboard } from './markets-dashboard'
import styles from './styles.module.scss'
import { SecurityTimerModalBiz } from 'biz/features-biz/modals-biz/security-timer-modal-biz'
import { TxnHistoryTableBiz } from 'biz/features-biz/txn-history-table-biz'
import { BREAKPOINT, useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

export function DashboardBiz() {
  const navigate = useNavigate()

  const isZekretTheme = theme === themeValue.zekret

  const securityTimerData = useUnit($stepUpBlockExpiration)
  const timeRemaining = calculateTimeRemaining(securityTimerData?.expiresAt || '')
  const { currentBreakpointBiz } = useCurrentBreakpoint()

  const assets = useUnit($assetsListData)
  const assetEurData = useUnit($assetEurData)
  // const assetUsdData = useUnit($assetUsdData)

  const topThreeAsset = useMemo(() => getPriorityAssets(assets), [assets])

  const navigateToCryptoWallets = () => {
    // if (isZekretTheme) return
    navigate(pages.CRYPTO_WALLETS.path)
  }
  const navigateToFiatWallets = () => {
    if (isZekretTheme) return
    navigate(pages.FIAT_WALLETS.path)
  }
  const navigateToTransactionHistory = () => {
    if (isZekretTheme) return
    navigate(pages.TRANSACTIONS_HISTORY.path)
  }

  const handleTimerClick = () => {
    Modal.open(<SecurityTimerModalBiz />, { variant: 'center' })
  }

  const fiatAssets = [assetEurData /* , assetUsdData */]

  return (
    <div className={styles.dashboard}>
      <div className={styles.walletsColumn}>
        {/*only lg and down*/}
        {securityTimerData?.expiresAt ? (
          <div className={styles.timerWrapLg} onClick={handleTimerClick}>
            <CountdownTimer initialTime={timeRemaining} colorScheme='Warning' />
          </div>
        ) : null}

        <section className={styles.walletSection}>
          <div className={styles.sectionHeader}>
            <label className={styles.walletColumnLabel}>Crypto Wallets</label>
            <button onClick={navigateToCryptoWallets} className={styles.viewAllButton}>
              view all
            </button>
          </div>
          <div className={styles.walletRowWrap}>
            {topThreeAsset.map(asset => {
              return <CryptoWalletRow asset={asset} key={asset.assetId} />
            })}
          </div>
        </section>

        <section className={styles.walletSection}>
          <div className={styles.sectionHeader}>
            <label className={styles.walletColumnLabel}>Fiat Wallets</label>

            <button
              onClick={navigateToFiatWallets}
              className={clsx(styles.viewAllButton, { [styles.hide]: fiatAssets.length <= 1 })}
            >
              view all
            </button>
          </div>

          <FiatWalletCards fiatAssets={fiatAssets} />
        </section>

        <section className={styles.transactionHistory}>
          <div className={styles.sectionHeader}>
            <label className={styles.walletColumnLabel}>Transaction History</label>
            <button onClick={navigateToTransactionHistory} className={styles.viewAllButton}>
              view all
            </button>
          </div>
          <TxnHistoryTableBiz isPreview={true} transactionType={TYPE_TXN_HISTORY.BIZ} />
        </section>
      </div>

      <div
        className={clsx(styles.marketsColumn, {
          [styles.marketsColumnFixHeightXXl]: currentBreakpointBiz === BREAKPOINT.xxl,
        })}
      >
        <section className={styles.marketSection}>
          <MarketsDashboard />
        </section>
      </div>
    </div>
  )
}
