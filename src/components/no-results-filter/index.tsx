import styles from './styles.module.scss'

export const NoResultsFilter = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Ooops.. No results found</div>
      <div className={styles.subTitle}>
        We&apos;re sorry, but we couldn&apos;t find
        <br />
        any matches for your search.
      </div>
    </div>
  )
}
