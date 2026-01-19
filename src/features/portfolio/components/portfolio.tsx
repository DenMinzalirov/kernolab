import { useEffect, useState } from 'react'
import Switch from 'react-switch'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { HeaderTitle, Modal } from 'components'
import { MenuWithActions } from 'components/menu-with-actions'
import { Star } from 'components/star-portfolio'
import { pages } from 'constant'
import { DepositAssetModal, TradeAssetModal, WithdrawAssetModal } from 'features/modals'
import { InfoCards } from 'features/portfolio/components/info-cards'
import { getBalanceString } from 'utils'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { getCssVar } from 'utils/get-css-var'
import { EVENT_NAMES, useAnalytics } from 'wip/services'
import { $assetsCefiExchangeRates } from 'model/cef-rates-exchange'
import { $assetsListData, CombinedObject } from 'model/cefi-combain-assets-data'
import { $currency, LowercaseCurrencyType } from 'model/currency'

import { $twoFaStatus } from '../../../model/two-fa'
import { TwoFaNeedModal } from '../../modals/two-factor-need-modal'
import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export function Portfolio() {
  const twoFa = useUnit($twoFaStatus)

  const [isHideZeroBalance, setIsHideZeroBalance] = useState(false)
  const assets = useUnit($assetsListData)
  const ratesCeFi = useUnit($assetsCefiExchangeRates)
  const currency = useUnit($currency)
  const currencyType: 'eur' | 'usd' = (currency?.type?.toLowerCase() as LowercaseCurrencyType) || 'eur'
  const navigate = useNavigate()
  const { myLogEvent } = useAnalytics()
  const { isMobilePairs } = useCurrentBreakpointPairs()

  useEffect(() => {
    myLogEvent(EVENT_NAMES.WEB_PORTFOLIO_OPENED)
  }, [])

  const navigateToDepositCrypto = (asset: CombinedObject) => {
    navigate(pages.DEPOSIT_ASSET.path, { state: { asset: asset } })
    // Modal.open(<DepositAssetModal asset={asset} />, { title: pages.PORTFOLIO.name })
  }
  const navigateToWithdrawCrypto = (asset: CombinedObject) => {
    if (!twoFa) {
      Modal.open(<TwoFaNeedModal />, { variant: 'center' })
    } else {
      navigate(pages.WITHDRAWAL_ASSETS.path, { state: { asset: asset } })
    }
  }
  const navigateToTradeCrypto = (asset: CombinedObject) => {
    // Modal.open(<TradeAssetModal asset={asset} />, {
    //   variant: 'right',
    //   title: pages.PORTFOLIO.name,
    // })
    navigate(pages.TRADE_ASSETS.path, { state: { asset } })
  }

  const assetsList = [
    ...assets.filter(asset => asset.assetId === 'PAIRS'),
    ...assets.filter(asset => asset.isFavourite && asset.assetId !== 'PAIRS').sort((a, b) => +b.usd.cash - +a.usd.cash),
    ...assets
      .filter(asset => !asset.isFavourite && asset.assetId !== 'PAIRS')
      .sort((a, b) => +b[currencyType].cash - +a[currencyType].cash),
  ]

  const greenColor = getCssVar('--P-System-Green')
  const whiteColor = getCssVar('--White')
  const deepSpace10Color = '#E8E8E8' //getCssVar('--Deep-Space-10')

  return (
    <div
      className='page-container-pairs'
      // className={styles.portfolioContainer}
    >
      <HeaderTitle headerTitle={'Portfolio'} />
      <InfoCards />
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <div className={styles.tableTitle}>Assets</div>

          <div className={styles.tableHideZeroWrap}>
            <div className={styles.tableHideZero}>Hide Zero Balances</div>
            {/* TODO refactor */}
            <Switch
              uncheckedIcon={false}
              checkedIcon={false}
              offColor={deepSpace10Color}
              onColor={greenColor}
              offHandleColor={whiteColor}
              onHandleColor={whiteColor}
              height={23}
              width={42}
              handleDiameter={19}
              checked={isHideZeroBalance}
              onChange={() => setIsHideZeroBalance(prev => !prev)}
            />
          </div>
        </div>
        <div className={styles.table}>
          <div className={clsx(styles.tableHeader, styles.hideMobile)}>
            <div className={clsx(styles.tableHeaderText, styles.cell1)}>Name</div>
            <div className={clsx(styles.tableHeaderText, styles.cell2)}>Price</div>
            <div className={clsx(styles.tableHeaderText, styles.cell3)}>Amount</div>
            <div className={clsx(styles.tableHeaderText, styles.cell4)}>Value</div>
            <div className={clsx(styles.tableHeaderText, styles.cell5)}>Actions</div>
          </div>

          <div className={styles.tableRowsWrap}>
            {assetsList
              .filter(asset => {
                if (isHideZeroBalance) {
                  return +asset.availableBalance > 0
                }
                return true
              })
              .map(asset => {
                /* TODO проверить какой обьект рейтов используется */
                const tradeEnabled = ratesCeFi.filter(assetItem => {
                  if (assetItem.toAssetId === asset.assetId) return true
                  if (assetItem.fromAssetId === asset.assetId) return true
                  return false
                })

                const depositEnabled = asset.networksInfo.length
                  ? asset.networksInfo.find(networkInfo => networkInfo.depositAvailable)
                  : null

                const withdrawalEnabled = asset.networksInfo.length
                  ? asset.networksInfo.find(networkInfo => networkInfo.withdrawalAvailable)
                  : null

                if (isHideZeroBalance && Number(asset?.availableBalance || 0) <= 0) {
                  return null
                }

                /* TODO подумать над универсальной иконкой  */
                const icon = asset?.icon || ''
                const assetName = asset?.assetName || '--'
                const assetId = asset?.assetId || '--'
                const price = (asset[currencyType]?.price || '0.00').toString()
                const priceForDiplay = addCommasToDisplayValue(price, 2)
                const assetChangePercentage =
                  +asset[currencyType]?.priceChangePercentage24h === 0 || asset[currencyType]?.priceChangePercentage24h
                    ? getBalanceString(+asset[currencyType].priceChangePercentage24h, 2)
                    : '--'
                const isAssetChangePositive = +assetChangePercentage >= 0
                const availableBalance = (+asset.availableBalance > 0.000001 ? +asset.availableBalance : 0).toString()
                const availableBalanceForDiplay = addCommasToDisplayValue(availableBalance, 8)

                const value = (
                  (+asset.availableBalance > 0.000001 ? +asset.availableBalance : 0) * asset[currencyType].price
                ).toString()
                const valueForDisplay = +value > 0.000001 ? addCommasToDisplayValue(value, 8) : 0

                return (
                  <div
                    onClick={() => navigate(`${pages.ASSET.path}/${asset.assetId}`)}
                    className={styles.tableRow}
                    key={assetId}
                  >
                    {/* Asset */}
                    <div className={styles.cell1}>
                      <img className={clsx('asset-icon', styles.assetIcon)} src={icon} alt='' />
                      <div className={styles.assetItem}>
                        <div className={styles.tableRowText}>{assetName}</div>
                        {isMobilePairs ? (
                          <div className={styles.tableRowSubTextMobileWrap}>
                            <div className={styles.tableRowSubText}>
                              {availableBalanceForDiplay} {assetId}
                            </div>
                            <span className={styles.dot} /> {currency.symbol}
                            <div className={styles.tableRowSubText}>{valueForDisplay}</div>
                          </div>
                        ) : (
                          <div className={styles.tableRowSubText}>{assetId}</div>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className={styles.cell2}>
                      <div
                        className={clsx(
                          styles.assetChangeRateWrap,
                          isAssetChangePositive ? styles.positiveStyle : styles.negativeStyle
                        )}
                      >
                        {isAssetChangePositive ? '+' : ''}
                        {assetChangePercentage || '--'}%
                      </div>
                      <div className={clsx(styles.tableRowText, styles.priceMobile)}>
                        {currency.symbol}
                        {priceForDiplay}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className={styles.cell3}>
                      <div className={styles.tableRowText}>{availableBalanceForDiplay || 0}</div>
                    </div>

                    {/* Value */}
                    <div className={clsx(styles.cell4, styles.tableRowText)}>
                      {currency.symbol}
                      {valueForDisplay}
                    </div>

                    {/* Action */}
                    <div className={styles.cell5}>
                      <div className={clsx(styles.actionButtons, styles.hideDesktopSAndDown)}>
                        <button
                          onClick={event => {
                            event.stopPropagation()
                            navigateToDepositCrypto(asset)
                          }}
                          className='btn-new transparent-border small'
                          disabled={!depositEnabled}
                        >
                          Deposit
                        </button>

                        <button
                          onClick={event => {
                            event.stopPropagation()
                            navigateToWithdrawCrypto(asset)
                          }}
                          className='btn-new transparent-border small'
                          disabled={!withdrawalEnabled}
                        >
                          Withdraw
                        </button>

                        <button
                          onClick={event => {
                            event.stopPropagation()
                            navigateToTradeCrypto(asset)
                          }}
                          className='btn-new transparent-border small'
                          disabled={!tradeEnabled?.length}
                        >
                          Trade
                        </button>
                        <Star asset={asset} />
                      </div>

                      {/* only desktop-s and down*/}
                      <div className={clsx(styles.menuDotsWrap)}>
                        <Star asset={asset} />

                        <MenuWithActions
                          actions={[
                            {
                              label: 'Deposit',
                              onClick: () => navigateToDepositCrypto(asset),
                              disabled: false,
                            },
                            {
                              label: 'Withdraw',
                              onClick: () => navigateToWithdrawCrypto(asset),
                              disabled: false,
                            },
                            {
                              label: 'Trade',
                              onClick: () => navigateToTradeCrypto(asset),
                              disabled: false,
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
