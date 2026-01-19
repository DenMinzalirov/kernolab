import styles from './styles.module.scss'

//TODO old DELETE
function NoSuperchargeEvents() {
  return (
    <div className={styles.noSuperchargeContainer}>
      <div className={styles.noSuperchargeTitle}>No Supercharge Events Currently Available</div>
      <div className={styles.noSuperchargeDescription}>
        At the moment, there are no active staking opportunities available. Please check back soon for new events.
      </div>
    </div>
  )
}
