import React from 'react'

import { HELP_LINKS } from '../../config'
import styles from './styles.module.scss'

export function FAQ() {
  return (
    <div className={styles.settingsItem}>
      <div className={styles.settingsItemContent}>
        <div className={styles.twoFaTitleWrap}>
          <div className={styles.settingsItemTitle}>FAQ</div>
        </div>

        <div className={styles.settingsItemDescription}>
          Are you looking for specific answers or guidance? Checkout our FAQ section for detailed information.
        </div>

        <div
          onClick={() => {
            window.open(HELP_LINKS.FAQ)
          }}
          className={'btn-new primary big'}
        >
          Visit FAQ
        </div>
      </div>
    </div>
  )
}
