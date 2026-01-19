import React, { useEffect, useRef, useState } from 'react'
import Chart from 'chart.js/auto'

import { XANOVA_API_CHART_URL } from 'config'

interface CurrencyData {
  CurrencyPair: string
  Value: number
}

type Props = {
  id: string
  year?: number
  month?: number
}

export function InstrumentsDonutChart({
  id,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}: Props) {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstanceRef = useRef<Chart | null>(null)
  const [currencyData, setCurrencyData] = useState<CurrencyData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Color palette for the chart (matching the design)
  const colors = [
    '#FDD75C', // Bright Yellow - Equities
    '#E2B525', // Dark Gold - Bonds
    '#997500', // Dark Brown - Crypto
    '#2C2C2C', // Dark Gray/Black - Other
    '#DFDD75', // Light yellow (fallback)
    '#FFB84D', // Orange (fallback)
    '#A7C957', // Green (fallback)
    '#6A994E', // Dark green (fallback)
    '#BC4749', // Red (fallback)
    '#3D5A80', // Blue (fallback)
  ]

  const fetchCurrencyData = async (): Promise<void> => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      // Ключ для localStorage на основе параметров запроса
      const cacheKey = `chart_currency_${id}_${year}_${month}`
      const cacheTimestampKey = `${cacheKey}_timestamp`

      // Проверяем кеш
      const cachedData = localStorage.getItem(cacheKey)
      const cachedTimestamp = localStorage.getItem(cacheTimestampKey)

      if (cachedData && cachedTimestamp) {
        const now = Date.now()
        const cacheAge = now - parseInt(cachedTimestamp, 10)
        const twoHoursInMs = 2 * 60 * 60 * 1000 // 2 часа в миллисекундах

        // Если данные не старше 2 часов - используем кеш
        if (cacheAge < twoHoursInMs) {
          const data: CurrencyData[] = JSON.parse(cachedData)
          setCurrencyData(data)
          setLoading(false)
          return
        }
      }

      // Если кеша нет или он устарел - делаем запрос
      const url = `${XANOVA_API_CHART_URL}/en/chart/currency?id=${id}&year=${year}&month=${month}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Data loading error: ${response.statusText}`)
      }

      const data: CurrencyData[] = await response.json()

      // Сохраняем данные и timestamp в localStorage
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(cacheTimestampKey, Date.now().toString())

      setCurrencyData(data)
    } catch (e) {
      console.error('ERROR-fetchCurrencyData', e)
      setError(e instanceof Error ? e.message : 'Data loading error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrencyData()
  }, [id, year, month])

  useEffect(() => {
    if (chartRef.current && currencyData && currencyData.length > 0) {
      const ctx = chartRef.current.getContext('2d')

      if (!ctx) return

      // Destroy previous chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }

      // Prepare data for the chart
      const labels = currencyData.map(item => item.CurrencyPair)
      const dataValues = currencyData.map(item => item.Value)
      const backgroundColors = currencyData.map((_, index) => colors[index % colors.length])

      chartInstanceRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [
            {
              data: dataValues,
              backgroundColor: backgroundColors,
              borderColor: '#ffffff',
              borderWidth: 1,
              hoverOffset: 4,
              hoverBorderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'left',
              align: 'end',
              labels: {
                color: '#2C2C2C',
                font: {
                  size: 12,
                  family: 'Inter, sans-serif',
                },
                padding: 8,
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 4,
                boxHeight: 4,
                generateLabels: function (chart) {
                  const data = chart.data
                  if (data.labels && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      return {
                        text: `${label}`,
                        fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                        hidden: false,
                        index: i,
                        pointStyle: 'circle',
                      }
                    })
                  }
                  return []
                },
              },
            },
            tooltip: {
              enabled: true,
              backgroundColor: '#FFFFFF',
              titleColor: '#2C2C2C',
              bodyColor: '#2C2C2C',
              borderColor: '#E8E8E8',
              borderWidth: 1,
              padding: 16,
              displayColors: true,
              boxWidth: 8,
              boxHeight: 8,
              cornerRadius: 8,
              bodySpacing: 6,
              callbacks: {
                title: function (tooltipItems) {
                  return tooltipItems[0].label
                },
                label: function (context) {
                  const value = context.parsed
                  const total = dataValues.reduce((sum, val) => sum + val, 0)
                  const percentage = total > 0 ? (value / total) * 100 : 0

                  return [`${percentage.toFixed(1)}%`]
                },
              },
            },
          },
          cutout: '65%', // Center hole size (doughnut)
        },
        plugins: [
          {
            id: 'centerText',
            // beforeDraw: function (chart) {
            //   const { ctx: context, chartArea } = chart
            //   if (!chartArea) return

            //   const centerX = (chartArea.left + chartArea.right) / 2
            //   const centerY = (chartArea.top + chartArea.bottom) / 2

            //   context.save()
            //   context.textAlign = 'center'
            //   context.textBaseline = 'middle'

            //   // "Total Balance" text
            //   context.font = '14px Inter, sans-serif'
            //   context.fillStyle = '#666'
            //   context.fillText('Total Balance', centerX, centerY - 15)

            //   // Amount text
            //   context.font = 'bold 24px Inter, sans-serif'
            //   context.fillStyle = '#2C2C2C'
            //   context.fillText('$12,500', centerX, centerY + 10)

            //   context.restore()
            // },
          },
        ],
      })
    }

    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [currencyData])

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    )
  }

  if (!currencyData || currencyData.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data to display</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={chartRef} />
    </div>
  )
}
