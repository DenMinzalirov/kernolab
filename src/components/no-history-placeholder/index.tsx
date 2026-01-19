import styles from './styles.module.scss'

export const NoHistoryPlaceholder = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Your Transactions History will appear here</div>
      <div className={styles.subTitle}>
        Once you start using the app, all recent transaction will be displayed here for your convenience.
      </div>
      <div className={styles.height48} />
    </div>
  )
}
