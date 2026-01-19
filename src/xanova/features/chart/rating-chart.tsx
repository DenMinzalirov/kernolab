import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import Chart from 'chart.js/auto'

import { XANOVA_API_CHART_URL } from 'config'

interface GainDataPoint {
  Date: number
  DateTime: string
  TotalGain: number
  DailyGain: number
  Bullet: string | null
  Description: string
  Reset: boolean
  DrawdownViolation: boolean
  DlMinTotalGain: number
}

type Props = {
  id: string
  pammUser?: string
  from?: string // Дата начала в формате MM/DD/YYYY
  to?: string // Дата окончания в формате MM/DD/YYYY
  onDataChange?: (data: { totalReturnPercent: number; firstValue: number; lastValue: number }) => void
}

export function RatingChart({ id, pammUser = '', from, to, onDataChange }: Props) {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstanceRef = useRef<Chart | null>(null)
  const [chartData, setChartData] = useState<GainDataPoint[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChartData = async (): Promise<void> => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      // Формат даты: MM/DD/YYYY
      const fromDate = from || moment().subtract(1, 'year').format('MM/DD/YYYY')
      const toDate = to || moment().format('MM/DD/YYYY')

      // Ключ для localStorage на основе параметров запроса
      const cacheKey = `chart_gain_${id}_${pammUser}_${fromDate}_${toDate}`
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
          const data: GainDataPoint[] = JSON.parse(cachedData)
          setChartData(data)
          setLoading(false)
          return
        }
      }

      // Если кеша нет или он устарел - делаем запрос
      const url =
        `${XANOVA_API_CHART_URL}/en/chart/gain?id=${id}&pammUser=${pammUser}` +
        `&from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error loading data: ${response.statusText}`)
      }

      const data: GainDataPoint[] = await response.json()

      // Сохраняем данные и timestamp в localStorage
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(cacheTimestampKey, Date.now().toString())

      setChartData(data)
    } catch (e) {
      console.error('ERROR-fetchChartData', e)
      setError(e instanceof Error ? e.message : 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData()
  }, [id, pammUser, from, to])

  // Вызываем колбэк с данными о Total Return
  useEffect(() => {
    if (chartData && chartData.length > 0 && onDataChange) {
      const firstValue = chartData[0].TotalGain
      const lastValue = chartData[chartData.length - 1].TotalGain
      const totalReturnPercent = lastValue // просто берем последнее значение

      onDataChange({
        totalReturnPercent,
        firstValue,
        lastValue,
      })
    }
  }, [chartData, onDataChange])

  useEffect(() => {
    if (chartRef.current && chartData && chartData.length > 0) {
      const ctx = chartRef.current.getContext('2d')

      if (!ctx) return

      // Уничтожаем предыдущий график, если он существует
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }

      // Подготавливаем данные для графика
      const labels = chartData.map(item => moment(item.DateTime).format('DD MMM'))
      const totalGains = chartData.map(item => item.TotalGain)

      // Создаем градиент для подложки графика
      const chartHeight = chartRef.current.height
      const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight)
      // #DFDD75 с opacity 0.792157
      gradient.addColorStop(0, 'rgba(223, 221, 117, 0.79)')
      // #FDD75C с opacity 0 (прозрачный)
      gradient.addColorStop(1, 'rgba(253, 215, 92, 0)')

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: '',
              data: totalGains,
              borderColor: '#FDD75C',
              borderWidth: 2,
              backgroundColor: gradient, // Используем градиент
              fill: 'start',
              tension: 0.4,
              pointRadius: 1,
              pointHoverRadius: 5,
              pointBackgroundColor: '#FDD75C',
              pointBorderColor: '#FDD75C',
              pointBorderWidth: 2,
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
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#FDD75C',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                label: function (context) {
                  const value = context.parsed.y
                  return `Return: ${value !== null && value !== undefined ? value.toFixed(2) : 'N/A'}`
                },
              },
            },
          },
          scales: {
            y: {
              display: false,
              grid: {
                display: true,
                color: 'rgba(200, 200, 200, 0.1)',
              },
              ticks: {
                color: '#888',
                font: {
                  size: 11,
                },
                callback: function (value) {
                  return Number(value).toFixed(0)
                },
              },
            },
            x: {
              display: false,
              grid: {
                display: false,
              },
              ticks: {
                color: '#888',
                font: {
                  size: 11,
                },
                maxRotation: 45,
                minRotation: 0,
              },
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
          },
        },
      })
    }

    // Cleanup при размонтировании
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [chartData])

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

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Clear</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={chartRef} />
    </div>
  )
}
