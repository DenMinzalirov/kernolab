import clsx from 'clsx'

import { Modal } from 'components'

import styles from './styles.module.scss'

export function LaunchpadShareModal() {
  const closeModal = () => Modal.close()

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className={styles.title}>Link copied!</div>
          <div className={styles.description}>Paste the link on any social media platform.</div>
        </div>

        <button className={clsx('btn-new primary')} onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  )
}
