import { useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { TriangleIcon, UpDownIcon } from 'icons'

import { SearchBar } from '../../components/search-bar'
import upDown from '../../icons/up-down.svg'
import { $assetsListData } from '../../model/cefi-combain-assets-data'
import { $currency } from '../../model/currency'
import { addCommasToDisplayValue } from '../../utils/add-commas-to-display-value'
import styles from './styles.module.scss'

export function MarketsDashboard() {
  const assets = useUnit($assetsListData)
  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'usd' | 'eur'

  const [marketAssets, setMarketAssets] = useState(assets)
  const [sort, setSort] = useState<null | string>(null)

  const searchHandler = (data: string) => {
    const filteredAssets = assets.filter(assetItem => assetItem.assetId.toLowerCase().includes(data?.toLowerCase()))
    setMarketAssets(filteredAssets)
  }

  const handlePriceChangeSort = () => {
    setSort(sort === 'DESC' ? 'ASCE' : 'DESC')
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <label className={styles.walletColumnLabel}>Markets</label>
        <div className={styles.searchBarWrap}>
          <SearchBar onChange={searchHandler} />
        </div>
      </div>
      <div className={styles.marketsWrap}>
        <div className={styles.headersMarketWrap}>
          <div className={clsx(styles.headerText, styles.cell1)}>Asset</div>
          <div className={clsx(styles.headerText, styles.cell2)}>Price</div>
          <div
            onClick={handlePriceChangeSort}
            className={clsx(styles.headerText, styles.cell3)}
            style={{ cursor: 'pointer' }}
          >
            Last 24h
            <UpDownIcon fill={'var(--Dark-Grey)'} />
          </div>
        </div>
        <div className={styles.tableMarketWrap}>
          {marketAssets
            .sort((a, b) => {
              if (!sort) return 0
              if (sort === 'ASCE') {
                return +a.usd.priceChangePercentage24h - +b.usd.priceChangePercentage24h
              }
              return +b.usd.priceChangePercentage24h - +a.usd.priceChangePercentage24h
            })
            .map(asset => {
              const priceChangePercentage24h = asset[currencyType].priceChangePercentage24h
              return (
                <div key={asset.assetId} className={styles.rowMarketWrap}>
                  <div className={clsx(styles.cell1)}>
                    <img className={clsx('asset-icon', styles.marketsIcon)} src={asset?.icon} alt='' />
                    <div>{asset.assetId}</div>
                  </div>
                  <div className={clsx(styles.cell2)}>
                    {currency.symbol}
                    {/*{asset[currencyType].price}*/}
                    {addCommasToDisplayValue((asset[currencyType].price || '0.00').toString())}
                  </div>
                  <div
                    className={clsx(styles.cell3)}
                    style={{ color: +priceChangePercentage24h < 0 ? '#D52941' : '#137547' }}
                  >
                    {priceChangePercentage24h}%
                    <div
                      style={{
                        height: 10,
                        width: 10,
                        transform: +priceChangePercentage24h < 0 ? 'rotate(-90deg)' : 'rotate(90deg)',
                        // backgroundColor: 'red',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <TriangleIcon fill={+priceChangePercentage24h < 0 ? '#D52941' : '#137547'} />
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </>
  )
}
