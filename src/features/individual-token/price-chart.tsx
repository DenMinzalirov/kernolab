import React, { useEffect, useRef, useState } from 'react'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'
import Chart from 'chart.js/auto'

import { getCssVar } from 'utils/get-css-var'

import { Spinner } from '../../components'
import { CombinedObject } from '../../model/cefi-combain-assets-data'
import { $currency, LowercaseCurrencyType } from '../../model/currency'
import { getBalanceString } from '../../utils'
import { CashChart, getCashChartUpdate, setCashChartUpdate } from '../../utils/local-storage'
import { CoingeckoService } from '../../wip/services'
import styles from './styles.module.scss'

const unixTimestampNow = moment().unix()
const unixTimestampDay = moment().subtract(1, 'day').unix()
const unixTimestampWeak = moment().subtract(7, 'day').unix()
const unixTimestampMonth = moment().subtract(1, 'month').unix()
const unixTimestampYear = moment().subtract(1, 'year').unix()

const CACHE_TTL = 10 * 60 * 1000

type Props = {
  asset: CombinedObject
}

function PriceChartComponent({ asset }: Props) {
  const chartRef = useRef<any>(null)
  const chartInstanceRef = useRef<Chart | null>(null)
  const currency = useUnit($currency)
  const currencyType: 'eur' | 'usd' = (currency?.type?.toLowerCase() as LowercaseCurrencyType) || 'eur'

  const [isLoading, setIsLoading] = useState(false)
  const [dataPrice, setDataPrice] = useState<null | number[][]>(null)
  const [timeLine, setTimeline] = useState(unixTimestampDay)

  const timLineString = () => {
    if (timeLine === unixTimestampYear) return '1Y'
    if (timeLine === unixTimestampMonth) return '1M'
    if (timeLine === unixTimestampWeak) return '1W'
    return '1D'
  }

  const createCacheKey = (assetName: string, from: string) => {
    return `${assetName}_${from}`
  }

  const cleanupCache = () => {
    const cache = getCashChartUpdate()
    if (!cache) return
    const now = Date.now()
    const updatedCache: Record<string, CashChart> = {}

    for (const key in cache) {
      if (now - cache[key].timestamp < CACHE_TTL) {
        updatedCache[key] = cache[key] // Оставляем только актуальные данные
      }
    }

    setCashChartUpdate(updatedCache)
  }

  const getAssetRatesData = async (): Promise<void> => {
    if (!asset) return

    cleanupCache()

    const cashDataPrice = getCashChartUpdate()
    const cacheKey = createCacheKey(asset.coinGeckoId, timLineString())

    if (cashDataPrice && cashDataPrice[cacheKey] && Date.now() - cashDataPrice[cacheKey].timestamp < CACHE_TTL) {
      setDataPrice(cashDataPrice[cacheKey].data)
      return
    }

    try {
      setIsLoading(true)
      const pricesChart =
        asset?.coinGeckoId &&
        (await CoingeckoService.rangeData({
          assetName: asset.coinGeckoId,
          currency: currencyType,
          from: timeLine,
          to: unixTimestampNow,
        }))

      cashDataPrice[cacheKey] = {
        timestamp: Date.now(),
        data: pricesChart.prices,
      }

      setCashChartUpdate(cashDataPrice)
      setDataPrice(pricesChart.prices)
    } catch (e) {
      console.log('ERROR-rangeData', e)

      setDataPrice([
        [0, 0],
        [0, 0],
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (asset) {
      getAssetRatesData().then(() => null)
    }
  }, [asset?.assetId, timeLine])

  const isMobile = window.matchMedia('(max-width: 767px)').matches
  const whiteColor = getCssVar('--White')
  const greenColor = getCssVar('--P-System-Green')

  useEffect(() => {
    if (chartRef.current && asset && dataPrice) {
      const ctx = chartRef.current.getContext('2d')

      // Уничтожаем предыдущий график, если он существует
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }

      let formatDate = 'YYYY-MM-DD'
      const startDate = moment.unix(dataPrice[0][0] / 1000)
      const endDate = moment.unix(dataPrice[dataPrice.length - 1][0] / 1000)
      const duration = moment.duration(endDate.diff(startDate))
      const days = duration.asDays()

      if (days <= 1) formatDate = 'HH:mm:ss'

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dataPrice.map((item: any[]) => moment.unix(item[0] / 1000).format(formatDate)),
          datasets: [
            {
              label: `${currency.symbol} price`,
              data: dataPrice.map((item: any[]) => item[1]),
              borderColor: greenColor,
              borderWidth: 3,
              parsing: {
                yAxisKey: 'price',
              },
              backgroundColor: whiteColor,
              fill: 'start',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              display: !isMobile,
              grid: {
                display: false,
              },
            },
            x: {
              display: false,
              grid: {
                display: false,
              },
            },
          },
          elements: {
            point: {
              radius: 1,
            },
          },
        },
      })
    }
  }, [dataPrice, currency.symbol, isMobile])

  return (
    <div className={styles.chartBlockWrap}>
      <div className={styles.assetInfoWrap}>
        <div className={styles.graphIcon}>
          <img className={styles.assetImg} src={asset.icon} alt='' />
          <div className={styles.assetNameWrap}>
            <div className={styles.assetName}>{asset.assetName}</div>
            <div className={styles.assetId}>{asset.assetId}</div>
          </div>
        </div>

        <div className={styles.assetChangeWrap}>
          <div className={styles.assetName}>
            {currency.symbol}
            {getBalanceString(+asset[currencyType].price, 6)}
          </div>
          <div
            className={clsx(
              styles.assetChange,
              +asset[currencyType].priceChangePercentage24h < 0 ? styles.redColor : styles.greenColor
            )}
          >
            {+asset[currencyType].priceChangePercentage24h < 0 ? '' : '+'}
            {+asset[currencyType].priceChangePercentage24h === 0 || asset[currencyType].priceChangePercentage24h
              ? getBalanceString(+asset[currencyType].priceChangePercentage24h, 2)
              : '--'}
            %
          </div>
        </div>
      </div>

      <div className={styles.priceChartWrap}>
        {dataPrice?.length && !isLoading ? <canvas width='90' ref={chartRef} /> : <Spinner />}
      </div>

      <div className={styles.timeLine}>
        <div
          onClick={() => {
            if (!isLoading) setTimeline(unixTimestampDay)
          }}
          className={clsx(styles.timeLineItem, timeLine === unixTimestampDay ? styles.timeLineItemActive : '')}
        >
          1D
        </div>
        <div
          onClick={() => {
            if (!isLoading) setTimeline(unixTimestampWeak)
          }}
          className={clsx(styles.timeLineItem, timeLine === unixTimestampWeak ? styles.timeLineItemActive : '')}
        >
          1W
        </div>
        <div
          onClick={() => {
            if (!isLoading) setTimeline(unixTimestampMonth)
          }}
          className={clsx(styles.timeLineItem, timeLine === unixTimestampMonth ? styles.timeLineItemActive : '')}
        >
          1M
        </div>
        <div
          onClick={() => {
            if (!isLoading) setTimeline(unixTimestampYear)
          }}
          className={clsx(styles.timeLineItem, timeLine === unixTimestampYear ? styles.timeLineItemActive : '')}
        >
          1Y
        </div>
      </div>

      <div className={styles.graphText}>
        The graph and the price shown are indicative only. The execution price may vary at the moment of the
        transaction.
      </div>
    </div>
  )
}

export const PriceChart = React.memo(PriceChartComponent)
