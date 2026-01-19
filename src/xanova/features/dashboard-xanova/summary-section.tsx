import styles from './styles.module.scss'
import { ProgressTierBar } from 'xanova/components/progress-tier-bar'
import { SummaryMetricCards } from 'xanova/components/summary-metric-cards'

export function SummarySection() {
  return (
    <section className={styles.summarySection}>
      <div className={styles.progressOverviewBlock}>
        <ProgressTierBar />
      </div>

      <SummaryMetricCards classNameCardsWrap={styles.metricsCardsWrap} classNameCard={styles.metricCard} />
    </section>
  )
}
