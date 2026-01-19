import { useMemo, useState } from 'react'
import Switch from 'react-switch'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { MenuWithActions } from 'components/menu-with-actions'
import { SearchBar } from 'components/search-bar'
import { Star } from 'components/star-portfolio'
import { pages } from 'constant'
import { calculateCefiPortfolioValueChange, getBalanceString, roundingBalance } from 'utils'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { TriangleIcon } from 'icons'
import { ArrowBottomLeft } from 'icons/arrow-bottom-left'
import { ArrowsDoubleOpposite } from 'icons/arrows-double-opposite'
import { $assetsListData, CombinedObject } from 'model/cefi-combain-assets-data'
import { $currency } from 'model/currency'

import { theme, themeValue } from '../../../config'
import { AssetDetailsMobileModalBiz } from '../modals-biz/asset-details-mobile-modal-biz'
import { PriceChartBiz } from './price-chart-biz'
import styles from './styles.module.scss'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

export function CryptoWalletsBiz() {
  const navigate = useNavigate()

  const { isMobileBiz } = useCurrentBreakpoint()

  const assets = useUnit($assetsListData) //TODO разобраться почему 5 раз ререндарится
  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'usd' | 'eur'
  const [isHideZeroBalance, setIsHideZeroBalance] = useState(false)

  const [searchValue, setSearchValue] = useState('')

  const searchHandler = (data: string) => {
    setSearchValue(data)
  }

  const navigateToReceiveCrypto = (asset: CombinedObject) => {
    navigate(pages.RECEIVE_CRYPTO.path, { state: { asset: asset } })
  }
  const navigateToSendCrypto = (asset: CombinedObject) => {
    navigate(pages.SEND_CRYPTO.path, { state: { asset: asset } })
  }

  const navigateToTradeCrypto = (cryptoAsset: CombinedObject) => {
    navigate(pages.TRADE_CRYPTO.path, { state: { asset: cryptoAsset } })
    Modal.close()
  }

  const handleTableRowClick = (asset: CombinedObject) => {
    if (isMobileBiz) Modal.open(<AssetDetailsMobileModalBiz asset={asset} />, { variant: 'center' })
  }

  const amountFix = (asset: CombinedObject) => {
    const amount = roundingBalance(asset[currencyType]?.price.toString(), 5) || '0'
    if (asset[currencyType]?.price === 0) return '0'

    return +amount > 0 ? amount : amount + '...'
  }

  const totalCurrencyAmount = assets.reduce((acc, asset) => {
    return acc + asset[currencyType].cash
  }, 0)

  const assetsWithChange = assets?.filter(item => item[currencyType].cash !== 0)
  const avgAssetChange = calculateCefiPortfolioValueChange(assetsWithChange)
  const totalBalanceForDisplay = addCommasToDisplayValue(totalCurrencyAmount.toString(), 2)

  const assetsData = [
    ...assets.filter(asset => asset.isFavourite).sort((a, b) => +b.usd.cash - +a.usd.cash),
    ...assets.filter(asset => !asset.isFavourite).sort((a, b) => +b[currencyType].cash - +a[currencyType].cash),
  ].filter(assetItem => {
    if (!searchValue) return true
    const search = searchValue.toLowerCase()
    return assetItem.assetId.toLowerCase().includes(search) || assetItem.assetName.toLowerCase().includes(search)
  })

  const assetsChart = assets.reduce<CombinedObject[]>((topTwo, currentItem) => {
    const currentValue = +currentItem.eur.priceChangePercentage24h

    if (topTwo.length < 2) {
      return [...topTwo, currentItem].sort((a, b) => +b.eur.priceChangePercentage24h - +a.eur.priceChangePercentage24h)
    }

    if (currentValue > +topTwo[1].eur.priceChangePercentage24h) {
      topTwo[1] = currentItem
      return topTwo.sort((a, b) => +b.eur.priceChangePercentage24h - +a.eur.priceChangePercentage24h)
    }

    return topTwo
  }, [])

  const reservedAsset = assets.find(asset => asset.assetId === 'USDT')

  const assetPriseFirst = assetsChart[0] || reservedAsset
  const assetPriseSecond = assetsChart[1] || reservedAsset

  const assetPriseFirstMemo = useMemo(() => {
    return assetPriseFirst
  }, [assetPriseFirst?.assetId])

  const assetPriseSecondMemo = useMemo(() => {
    return assetPriseSecond
  }, [assetPriseSecond?.assetId])

  return (
    <div className={styles.mainContainer}>
      <section className={styles.headerSection}>
        <div className={styles.totalBalance}>
          <div className={styles.headerTitleWrap}>
            <label className={styles.headerTitle}>Portfolio Summary</label>
          </div>

          <div className={styles.totalBalanceCard}>
            <div
              className={clsx(styles.priceChangeBox, {
                [styles.bgRed]: avgAssetChange < 0,
                [styles.bgGreen]: avgAssetChange >= 0,
              })}
            >
              <div
                className={styles.priceChangeBoxIcon}
                style={{
                  transform: avgAssetChange < 0 ? 'rotate(-90deg)' : 'rotate(90deg)',
                  marginTop: avgAssetChange < 0 ? -2 : 0,
                }}
              >
                <TriangleIcon fill={avgAssetChange < 0 ? '#D52941' : '#137547'} />
              </div>
              {addCommasToDisplayValue((avgAssetChange || 0).toString(), 2)}%
            </div>

            <div className={styles.totalBalanceTitleWrap}>
              <div className={styles.totalBalanceTitle}>
                {currency.symbol} {totalBalanceForDisplay}
              </div>
              <div className={styles.totalBalanceSubTitle}>Total Balance</div>
            </div>
          </div>
        </div>

        <div className={styles.chartsWrap}>
          <div className={styles.headerTitleWrap}>
            <label className={styles.headerTitle}>Top Week Movers</label>
          </div>

          <div className={styles.chartCardsWrap}>
            <div className={styles.chartCard}>
              <div className={styles.chartAssetRow}>
                <img className={clsx('asset-icon', styles.chartAssetIcon)} src={assetPriseFirstMemo?.icon} alt='' />
                <div className={styles.chartAssetWrapText}>
                  <div className={styles.chartAssetText}>
                    {currency.symbol}
                    {addCommasToDisplayValue((assetPriseFirstMemo?.[currencyType].price || 0).toString(), 6)}
                  </div>
                  <div className={styles.chartAssetSubText}>{assetPriseFirstMemo?.assetId}</div>
                </div>
              </div>
              <div className={styles.chartWrap}>
                <PriceChartBiz asset={assetPriseFirstMemo} />
              </div>
            </div>

            <div className={clsx(styles.chartCard, styles.hideXlAndDown)}>
              <div className={styles.chartAssetRow}>
                <img className={clsx('asset-icon', styles.chartAssetIcon)} src={assetPriseSecondMemo?.icon} alt='' />
                <div className={styles.chartAssetWrapText}>
                  <div className={styles.chartAssetText}>
                    {currency.symbol}
                    {addCommasToDisplayValue((assetPriseSecondMemo?.[currencyType].price || 0).toString(), 6)}
                  </div>
                  <div className={styles.chartAssetSubText}>{assetPriseSecondMemo?.assetId}</div>
                </div>
              </div>
              <div className={styles.chartWrap}>
                <PriceChartBiz asset={assetPriseSecondMemo} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionTable}>
        <div className={styles.sectionTableHeader}>
          <div className={styles.headerTitleAndSearchWrap}>
            <label className={styles.headerTitle}>Crypto Wallets</label>
            <div className={clsx(styles.searchBarWrap, styles.hideMdAndDown)}>
              <SearchBar onChange={searchHandler} />
            </div>
          </div>

          <div className={styles.tableHideZeroWrap}>
            <div className={styles.tableHideZero}>Hide Zero Balances</div>
            <Switch
              //TODO add global colors for offColor onColor offHandleColor onHandleColor

              uncheckedIcon={false}
              checkedIcon={false}
              offColor='#EAEAEA'
              onColor={'#564DB5'}
              offHandleColor='#FFFFFF'
              onHandleColor='#FFFFFF'
              height={23}
              width={42}
              handleDiameter={19}
              checked={isHideZeroBalance}
              onChange={() => setIsHideZeroBalance(prev => !prev)}
            />
          </div>
        </div>

        <div className={clsx(styles.searchBarWrap, styles.showMdAndDown)}>
          <SearchBar onChange={searchHandler} />
        </div>

        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={clsx(styles.tableHeaderText, styles.cell1)}>Asset</div>
            <div className={clsx(styles.tableHeaderText, styles.cell2)}>Price</div>
            <div className={clsx(styles.tableHeaderText, styles.cell3)}>
              <div className={clsx(styles.tableHeaderText, styles.hideXlAndDown)}>Amount</div>
              <div className={clsx(styles.tableHeaderText, styles.showXlAndDown)}>Amount & Value</div>
            </div>
            <div className={clsx(styles.tableHeaderText, styles.cell4)}>Value</div>
            <div className={clsx(styles.tableHeaderText, styles.cell5)}>Action</div>
          </div>

          <div className={styles.tableRowsWrap}>
            {assetsData.map(asset => {
              const receiveEnabled = asset.networksInfo.length
                ? asset.networksInfo.find(networkInfo => networkInfo.depositAvailable)
                : null

              const sendEnabled = asset.networksInfo.length
                ? asset.networksInfo.find(networkInfo => networkInfo.withdrawalAvailable)
                : null

              // TODO ZEEK off zero balance
              if (asset.assetId === 'ZEEK' && Number(asset?.availableBalance || 0) <= 0) {
                return null
              }

              if (isHideZeroBalance && Number(asset?.availableBalance || 0) <= 0) {
                return null
              }

              const icon = asset?.icon || ''
              const assetName = asset?.assetName || '--'
              const assetId = asset?.assetId || '--'
              const price = amountFix(asset)
              const priceForDiplay = addCommasToDisplayValue(price)
              const assetChangePercentage =
                +asset[currencyType]?.priceChangePercentage24h === 0 || asset[currencyType]?.priceChangePercentage24h
                  ? getBalanceString(+asset[currencyType].priceChangePercentage24h, 2)
                  : '--'
              const isAssetChangePositive = +assetChangePercentage >= 0
              //TODO without converting zeros
              const availableBalance = (+asset.availableBalance > 0.000001 ? +asset.availableBalance : 0).toString()
              const availableBalanceForDiplay = addCommasToDisplayValue(availableBalance, 8)

              //TODO from converting zeros
              // eslint-disable-next-line max-len
              // const availableBalanceAddCommas = addCommasToDisplayValue((asset?.availableBalance || '').toString(), 8)
              // const availableBalanceForDiplay = NumberWithZeroCount({ numberString: availableBalanceAddCommas })

              const value = (
                (+asset.availableBalance > 0.000001 ? +asset.availableBalance : 0) * asset[currencyType].price
              ).toString()
              const valueForDisplay = addCommasToDisplayValue(value, 8)

              return (
                <div onClick={() => handleTableRowClick(asset)} className={styles.tableRow} key={assetId}>
                  {/* Asset */}
                  <div className={styles.cell1}>
                    <img className={clsx('asset-icon', styles.assetIcon)} src={icon} alt='' />
                    <div className={styles.assetItem}>
                      <div className={styles.tableRowText}>{assetName}</div>
                      <div className={styles.tableRowSubText}>{assetId}</div>
                    </div>
                  </div>
                  {/* Price */}
                  <div className={clsx(styles.cell2, styles.tableRowText)}>
                    <div
                      className={clsx(
                        styles.priceChangeItem,
                        isAssetChangePositive ? styles.colorGreen : styles.colorRed
                      )}
                    >
                      <div
                        className={clsx(
                          styles.priceChangeBoxIcon,
                          isAssetChangePositive ? styles.priceIsPosIcon : styles.priceIsNegIcon
                        )}
                      >
                        <TriangleIcon fill={isAssetChangePositive ? '#137547' : '#D52941'} />
                      </div>
                      {assetChangePercentage}%
                    </div>

                    {currency.symbol}
                    {priceForDiplay}
                  </div>
                  {/* Amount or Amount & Value (xl and down) */}
                  <div className={styles.cell3}>
                    <div className={styles.tableRowText}>{availableBalanceForDiplay || 0}</div>
                    <div className={clsx(styles.tableRowSubText, styles.showXlAndDown)}>
                      {currency.symbol}
                      {valueForDisplay}
                    </div>
                  </div>
                  {/* Value */}
                  <div className={clsx(styles.cell4, styles.tableRowText)}>
                    {currency.symbol}
                    {valueForDisplay}
                  </div>
                  {/* Action */}
                  <div className={styles.cell5}>
                    <div className={clsx(styles.actionButtons, styles.hideXlAndDown)}>
                      <button
                        onClick={() => navigateToReceiveCrypto(asset)}
                        className='btn-biz blue'
                        disabled={!receiveEnabled || themeValue.zekret === theme}
                      >
                        Receive
                      </button>

                      <button
                        onClick={() => navigateToSendCrypto(asset)}
                        className='btn-biz grey'
                        disabled={!sendEnabled || themeValue.zekret === theme}
                      >
                        Send
                      </button>

                      <button
                        onClick={() => navigateToTradeCrypto(asset)}
                        className='btn-biz grey'
                        disabled={themeValue.zekret === theme}
                      >
                        Trade
                      </button>
                      <Star asset={asset} />
                    </div>

                    {/* only xl lg */}
                    <div className={clsx(styles.menuDotsWrap)}>
                      <Star asset={asset} />

                      <MenuWithActions
                        actions={[
                          {
                            label: 'Receive',
                            icon: <ArrowBottomLeft />,
                            onClick: () => navigateToReceiveCrypto(asset),
                            disabled: !receiveEnabled || themeValue.zekret === theme,
                          },
                          {
                            label: 'Send',
                            icon: (
                              <div style={{ transform: 'rotate(+90deg)' }}>
                                <ArrowBottomLeft />
                              </div>
                            ),
                            onClick: () => navigateToSendCrypto(asset),
                            disabled: !sendEnabled || themeValue.zekret === theme,
                          },
                          {
                            label: 'Trade',
                            icon: <ArrowsDoubleOpposite />,
                            onClick: () => navigateToTradeCrypto(asset),
                            disabled: themeValue.zekret === theme,
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
      </section>
    </div>
  )
}
