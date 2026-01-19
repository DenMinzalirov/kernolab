import styles from './styles.module.scss'

type Props = {
  description: string
}

export function NothingLaunchpad({ description }: Props) {
  return (
    <div className={styles.nothingLaunchpadContainer}>
      <div className={styles.nothingLaunchpadTitle}>Oops! Nothing yet.</div>
      <div className={styles.nothingLaunchpadSubTitle} style={{ marginTop: 4 }}>
        {description}
      </div>
    </div>
  )
}
