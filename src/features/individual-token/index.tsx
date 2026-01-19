import { useNavigate, useParams } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { HeaderTitle, Modal } from 'components'
import { MODAL_TYPES, pages } from 'constant'
import { DepositAssetModal, TradeAssetModal, WithdrawAssetModal } from 'features/modals'
import { TxnHistoryCrypto } from 'features/transactions-history/txn-history-crypto'
import { getBalanceString, getToken } from 'utils'
import { isBiz } from 'config'

import { useCurrentBreakpointPairs } from '../../hooks/use-current-breakpoint-pairs'
import { useHeightControl } from '../../hooks/use-height-control'
import { $assetsCefiExchangeRates } from '../../model/cef-rates-exchange'
import { $assetsListData } from '../../model/cefi-combain-assets-data'
import { $currency, LowercaseCurrencyType } from '../../model/currency'
import { $twoFaStatus } from '../../model/two-fa'
import { TwoFaNeedModal } from '../modals/two-factor-need-modal'
import { PriceChart } from './price-chart'
import styles from './styles.module.scss'

export function IndividualToken() {
  const navigate = useNavigate()
  const twoFa = useUnit($twoFaStatus)

  const { assetId } = useParams()
  const assets = useUnit($assetsListData)
  const ratesCeFi = useUnit($assetsCefiExchangeRates)
  const token = getToken()
  const currency = useUnit($currency)
  const currencyType: 'eur' | 'usd' = (currency?.type?.toLowerCase() as LowercaseCurrencyType) || 'eur'

  const { isTabletPairs, isMobilePairs } = useCurrentBreakpointPairs()

  const asset = assets.find(assetItem => assetItem.assetId === assetId)
  console.log('asset1', asset)
  const depositEnabled = asset?.networksInfo.length
    ? asset.networksInfo.find(networkInfo => networkInfo.depositAvailable)
    : null

  const withdrawalEnabled = asset?.networksInfo.length
    ? asset.networksInfo.find(networkInfo => networkInfo.withdrawalAvailable)
    : null

  const { firstBlockRef, height: heightControl } = useHeightControl<HTMLDivElement>()

  if (!assetId || !asset) return null

  const goToModal = (type: string): void => {
    if (type === MODAL_TYPES.DEPOSIT_ASSET) {
      navigate(pages.DEPOSIT_ASSET.path, { state: { asset: asset } })
      // Modal.open(<DepositAssetModal asset={asset} />, { title: pages.PORTFOLIO.name, isFullScreen: true })
    }
    if (type === MODAL_TYPES.WITHDRAW_ASSET) {
      if (!twoFa) {
        Modal.open(<TwoFaNeedModal />, { variant: 'center' })
      } else {
        navigate(pages.WITHDRAWAL_ASSETS.path, { state: { asset: asset } })
      }
    }
    if (type === MODAL_TYPES.TRADE_ASSET) {
      // Modal.open(<TradeAssetModal asset={asset} />, { title: pages.PORTFOLIO.name, isFullScreen: true })
      navigate(pages.TRADE_ASSETS.path, { state: { asset } })
    }
  }

  const isHideBlock = isBiz

  const tradeEnabled = ratesCeFi.filter(assetItem => {
    if (assetItem.toAssetId === asset.assetId) return true
    if (assetItem.fromAssetId === asset.assetId) return true
    return false
  })

  return (
    <div
      // className={styles.container}
      className='page-container-pairs'
    >
      {/*<div className={styles.headerWrap}>*/}
      <HeaderTitle headerTitle={assetId} showBackBtn />
      {/*</div>*/}
      <div className={styles.contentWrap}>
        <div className={styles.contentLeft} ref={firstBlockRef}>
          <PriceChart asset={asset} />
        </div>

        <div
          className={styles.contentRight}
          // style={{ maxHeight: heightControl || '100%' }}
        >
          <div className={styles.balanceInfoBlockWrap}>
            <div className={styles.balanceInfoBlock}>
              <div className={styles.totalBalanceTitle}>Total Balance</div>
              <div className={styles.totalBalanceAmount}>
                {currency.symbol}
                {asset[currencyType]?.price
                  ? getBalanceString(+asset[currencyType].price * +asset.availableBalance, 2)
                  : '0'}
              </div>
              <div className={styles.totalBalanceSubTitle}>
                {getBalanceString(+asset.availableBalance, 8)} {asset.assetId}
              </div>

              <div className={styles.divider} />

              <div className={styles.buttonGroup}>
                <div className={styles.primaryActionsGroup}>
                  <button
                    onClick={() => {
                      if (!depositEnabled || !token) return
                      goToModal(MODAL_TYPES.DEPOSIT_ASSET)
                      // const navigateToReceiveCrypto = () => {
                      //   navigate(pages.RECEIVE_CRYPTO.path, { state: { asset: asset } })
                      // }

                      // navigate(pages.DEPOSIT_ASSET.path, { state: { asset: asset } })
                      // navigate(pages.DEPOSIT_ASSET.path)
                    }}
                    className='btn-new primary big'
                    disabled={!depositEnabled || !token}
                  >
                    Deposit
                  </button>

                  <button
                    onClick={() => {
                      if (!tradeEnabled?.length || !token) return
                      goToModal(MODAL_TYPES.TRADE_ASSET)
                    }}
                    className='btn-new primary big'
                    disabled={!tradeEnabled?.length || !token}
                  >
                    Trade
                  </button>

                  {isHideBlock ? null : (
                    <button
                      onClick={() => {
                        if (!token) return
                        navigate(pages.EARN.path)
                      }}
                      className='btn-new primary big'
                      disabled={!withdrawalEnabled || !token}
                    >
                      Earn
                    </button>
                  )}
                </div>

                <button
                  disabled={!withdrawalEnabled || !token}
                  onClick={() => {
                    if (!withdrawalEnabled || !token) return
                    goToModal(MODAL_TYPES.WITHDRAW_ASSET)
                  }}
                  className='btn-new grey big'
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          <div className={styles.txnHistorySection}>{<TxnHistoryCrypto filterAssetId={assetId} isPreview />}</div>
        </div>
      </div>
    </div>
  )
}
