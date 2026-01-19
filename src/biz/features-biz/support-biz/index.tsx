import { helpSupportUrl } from 'config'

import styles from './styles.module.scss'

export function SupportBiz(): React.ReactNode {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrap} style={{ justifyContent: 'center' }}>
        <div className={styles.title}>Help</div>
        <iframe
          title='Support'
          sandbox='allow-scripts allow-popups allow-forms allow-same-origin'
          width='100%'
          height='100%'
          style={{ border: 0 }}
          src={helpSupportUrl()}
        >
          Your browser does not allow embedded content.
        </iframe>
      </div>
    </div>
  )
}
