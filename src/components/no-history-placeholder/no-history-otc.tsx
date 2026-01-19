import styles from './styles.module.scss'

export const NoHistoryOtc = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Your OTC Transaction History will be displayed here</div>
      <div className={styles.subTitle}>
        Once you begin using the service, all recent OTC transactions will be conveniently shown for your reference.
      </div>
      <div className={styles.height48} />
    </div>
  )
}
