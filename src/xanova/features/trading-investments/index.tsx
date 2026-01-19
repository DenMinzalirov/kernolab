import { useMemo, useState } from 'react'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'

import { $tradingInvestmentsForm } from 'model/xanova-forms'

import { LogoutIcon } from '../../main-xanova/nav-panel/nav-icons/logout-icon'
import { ProfileIcon } from '../../main-xanova/nav-panel/nav-icons/profile-icon'
import { RatingChart } from '../chart'
import { InstrumentsDonutChart } from '../chart/instruments-donut-chart'
import { InvestmentProfile } from './investment-profile'
import { RequestForm } from './request-form'
import styles from './styles.module.scss'

type PeriodType = 1 | 3 | 6
type TabType = 'stats' | 'profile'

export function TradingInvestments() {
  const tradingInvestmentsForm = useUnit($tradingInvestmentsForm)

  const [totalReturn, setTotalReturn] = useState<number | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(3)
  const [isSetupAccountOpen, setIsSetupAccountOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<TabType>('stats')

  // Проверка доступности таба "Your Investment Profile"
  const isProfileTabEnabled = tradingInvestmentsForm.status === 'LOADED' && !!tradingInvestmentsForm.data

  const handleChartDataChange = (data: { totalReturnPercent: number; firstValue: number; lastValue: number }) => {
    setTotalReturn(data.totalReturnPercent)
  }

  const startDate = useMemo(() => {
    return moment().subtract(selectedPeriod, 'months').format('MM/DD/YYYY')
  }, [selectedPeriod])

  const handleSetupAccount = () => {
    setIsSetupAccountOpen(true)
  }

  const handleCloseSetupAccount = () => {
    setIsSetupAccountOpen(false)
    setActiveTab('profile')
  }

  if (isSetupAccountOpen) {
    return <RequestForm onClose={handleCloseSetupAccount} />
  }

  const handleInvestmentPlatform = () => {
    window.open('https://my.dooprime.com/login', '_blank')
  }

  return (
    <div className={styles.container}>
      <div className={clsx(styles.contentGutter, styles.header)}>
        <h1 className={styles.title}>Trading / Investments</h1>
        <div className={styles.btnHeaderGroup}>
          <button type='button' className={'btn-with-icon-xanova grey-small'} onClick={handleInvestmentPlatform}>
            <LogoutIcon />
            <span className={styles.controlButtonLabel}>Investment Platform</span>
          </button>
          {/*{!isProfileTabEnabled && (*/}
          {/*  <button type='button' className={'btn-with-icon-xanova grey-small'} onClick={handleSetupAccount}>*/}
          {/*    <ProfileIcon />*/}
          {/*    <span className={styles.controlButtonLabel}>Setup Account</span>*/}
          {/*  </button>*/}
          {/*)}*/}
        </div>
      </div>

      {/*<div className={clsx(styles.contentGutter, styles.tabRow)}>*/}
      {/*  <div*/}
      {/*    className={activeTab === 'stats' ? styles.tabActive : styles.tabNotActive}*/}
      {/*    onClick={() => setActiveTab('stats')}*/}
      {/*  >*/}
      {/*    Xanova Copy Trading Stats*/}
      {/*  </div>*/}
      {/*  <div*/}
      {/*    className={*/}
      {/*      !isProfileTabEnabled ? styles.tabDisabled : activeTab === 'profile' ? styles.tabActive : styles.tabNotActive*/}
      {/*    }*/}
      {/*    onClick={() => {*/}
      {/*      if (isProfileTabEnabled) {*/}
      {/*        setActiveTab('profile')*/}
      {/*      }*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    Your Investment Profile*/}
      {/*  </div>*/}
      {/*</div>*/}

      {activeTab === 'stats' && (
        <section className={clsx(styles.contentGrid, styles.contentGutter)}>
          <div className={clsx(styles.gridBlock, styles.topLeftWidget)}>
            <div className={styles.cardTitle}>Total Return</div>
            <div className={styles.cardData}>
              {totalReturn !== null ? (
                <>
                  {totalReturn >= 0 ? '+' : ''}
                  {totalReturn.toFixed(1)}% <span className={styles.cardTitle}>(since onboarding)</span>
                </>
              ) : (
                <span className={styles.cardTitle}>loading...</span>
              )}
            </div>
          </div>
          <div className={clsx(styles.gridBlock, styles.topRightWidget)}>
            <div className={styles.cardTitle}>Total Horizon</div>
            <div className={styles.cardData}>3–5 years</div>
          </div>
          <div className={clsx(styles.gridBlock, styles.bottomLeftWidget)}>
            <div className={styles.cardTitle2}>Investment Allocation</div>
            <InstrumentsDonutChart id='c4ccf7eb-0a53-42eb-9bfb-dea71afde140' year={2025} month={11} />
          </div>
          <div className={clsx(styles.gridBlock, styles.bottomRightWidget)}>
            <div className={styles.chartHeader}>
              <div className={styles.cardTitle2}>Recent Performance</div>
              <div className={styles.periodButtons}>
                <button
                  type='button'
                  className={clsx(styles.periodButton, selectedPeriod === 1 && styles.active)}
                  onClick={() => setSelectedPeriod(1)}
                >
                  1M
                </button>
                <button
                  type='button'
                  className={clsx(styles.periodButton, selectedPeriod === 3 && styles.active)}
                  onClick={() => setSelectedPeriod(3)}
                >
                  3M
                </button>
                <button
                  type='button'
                  className={clsx(styles.periodButton, selectedPeriod === 6 && styles.active)}
                  onClick={() => setSelectedPeriod(6)}
                >
                  6M
                </button>
              </div>
            </div>
            <RatingChart
              id='c4ccf7eb-0a53-42eb-9bfb-dea71afde140'
              pammUser=''
              from={startDate}
              to={moment().format('MM/DD/YYYY')}
              onDataChange={handleChartDataChange}
            />
          </div>
        </section>
      )}

      {activeTab === 'profile' && <InvestmentProfile />}
    </div>
  )
}
