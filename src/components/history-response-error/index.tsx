import styles from './styles.module.scss'

export const HistoryResponseError = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Ooops.. Something went wrong</div>
      <div className={styles.subTitle}>
        {`We're sorry, but there was an error processing your request. Please try again later.`}
      </div>
    </div>
  )
}
