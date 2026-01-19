import clsx from 'clsx'

import styles from './styles.module.scss'

export const WhitelistTableHeaderBiz = () => {
  return (
    <div className={styles.tableHeader}>
      <div className={clsx(styles.tableHeaderText, styles.cell1)}>Network</div>
      <div className={clsx(styles.tableHeaderText, styles.cell2)}>Label</div>
      <div className={clsx(styles.tableHeaderText, styles.cell3)}>Address</div>
      <div className={clsx(styles.tableHeaderText, styles.cell4)}>Tag</div>
      <div className={clsx(styles.tableHeaderText, styles.cell5)}>Action</div>
    </div>
  )
}
