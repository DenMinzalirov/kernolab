import React, { useEffect, useRef, useState } from 'react'
import { useUnit } from 'effector-react'
import moment from 'moment'
import Chart from 'chart.js/auto'

import { themeGlobalColor } from '../../../config'
import { CombinedObject } from '../../../model/cefi-combain-assets-data'
import { $currency, LowercaseCurrencyType } from '../../../model/currency'
import { getBizChartUpdate, setBizChartUpdate } from '../../../utils/local-storage'
import { CoingeckoService } from '../../../wip/services'

type Props = {
  asset?: CombinedObject
}

export function PriceChartBiz({ asset }: Props) {
  const chartRef = useRef<any>(null)
  const chartInstanceRef = useRef<Chart | null>(null)
  const currency = useUnit($currency)
  const currencyType: 'eur' | 'usd' = (currency?.type?.toLowerCase() as LowercaseCurrencyType) || 'eur'

  const unixTimestampNow = moment().unix()
  const unixTimestampWeak = moment().subtract(7, 'day').unix()

  const [dataPrice, setDataPrice] = useState<null | number[][]>(null)

  const getAssetRatesData = async (): Promise<void> => {
    if (!asset) return

    const now = Date.now()
    const cashDataPrice = getBizChartUpdate()
    const lastUpdate = cashDataPrice ? +cashDataPrice.updateTime : 0

    if (lastUpdate && now - lastUpdate < 2 * 60 * 1000) {
      !dataPrice && setDataPrice(cashDataPrice?.pricesChart || null)
      return
    }

    try {
      const pricesChart =
        asset?.coinGeckoId &&
        (await CoingeckoService.rangeData({
          assetName: asset.coinGeckoId,
          currency: currencyType,
          from: unixTimestampWeak,
          to: unixTimestampNow,
        }))

      setBizChartUpdate({
        updateTime: now.toString(),
        pricesChart: pricesChart.prices,
        assetId: asset?.assetId,
      })

      setDataPrice(pricesChart.prices)
    } catch (e) {
      console.log('ERROR-rangeData', e)

      setDataPrice(cashDataPrice?.pricesChart || null)
    }
  }

  useEffect(() => {
    if (asset) {
      getAssetRatesData().then(() => null)
    }
  }, [asset?.assetId])

  const aggregateDataByDay = (data: number[][] | null) => {
    if (!data) return null
    const dayMap: Record<string, { sum: number; count: number }> = {}

    data.forEach(([timestamp, value]) => {
      const day = moment.unix(timestamp / 1000).format('YYYY-MM-DD')
      if (!dayMap[day]) {
        dayMap[day] = { sum: 0, count: 0 }
      }
      dayMap[day].sum += value
      dayMap[day].count += 1
    })

    return Object.entries(dayMap).map(([day, { sum, count }]) => {
      return { day, average: sum / count }
    })
  }

  const formattedData = aggregateDataByDay(dataPrice)

  useEffect(() => {
    const lightGrey = getComputedStyle(document.documentElement).getPropertyValue('--Light-Grey').trim()

    if (chartRef.current && asset && dataPrice && formattedData) {
      const ctx = chartRef.current.getContext('2d')

      // Уничтожаем предыдущий график, если он существует
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }

      let formatDate = 'ddd'
      const startDate = moment.unix(dataPrice[0][0] / 1000)
      const endDate = moment.unix(dataPrice[dataPrice.length - 1][0] / 1000)
      const duration = moment.duration(endDate.diff(startDate))
      const days = duration.asDays()

      if (days <= 1) formatDate = 'HH:mm:ss'

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          // labels: data.map((item: any[]) => moment.unix(item[0] / 1000).format(formatDate)),
          labels: formattedData.map(({ day }) => moment(day).format(formatDate)),
          datasets: [
            {
              label: `${currency.symbol} price`,
              // data: data.map((item: any[]) => item[1]),
              data: formattedData.map(({ average }) => average),
              borderColor: themeGlobalColor(),
              borderWidth: 1,
              parsing: {
                yAxisKey: 'price',
              },
              backgroundColor: lightGrey,
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
              display: false,
              grid: {
                display: false,
              },
            },
            x: {
              display: true,
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
  }, [dataPrice, currency.symbol, asset])

  if (!asset || !dataPrice) return null

  return <canvas width='300' ref={chartRef} />
}
