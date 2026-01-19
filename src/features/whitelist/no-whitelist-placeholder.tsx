import styles from './styles.module.scss'

export const NoWhitelistPlaceholder = () => {
  return (
    <div className={styles.noWhitlistContainer}>
      <div className={styles.noWhitlistTitle}>Your Whitelist Adresses will appear here</div>
      <div className={styles.noWhitlistSubTitle}>
        Once you start adding addresses, your whitelist will be displayed here for easy management and quick access.
      </div>
      <div className={styles.height48} />
    </div>
  )
}
