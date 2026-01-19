import React, { Dispatch, SetStateAction } from 'react'

import { BackButtonBiz } from '../../../components/back-button-biz'
import { helpUrl } from '../../../features/delete-account'
import { ACCOUNT_PAGES } from './index'
import styles from './styles.module.scss'

type Props = {
  setPage: Dispatch<SetStateAction<string>>
}

export function DeleteAccountBiz({ setPage }: Props) {
  const handleBack = () => {
    setPage(ACCOUNT_PAGES.ACCOUNT_DETAILS)
  }

  return (
    <div style={{ padding: 0 }} className={styles.deletAccountWrap}>
      <BackButtonBiz backFn={handleBack} padding={30} />
      <div className={styles.changeTitleWrap} style={{ marginBottom: 10 }}>
        <div className={styles.changeTitle}>Delete account</div>
      </div>

      <iframe
        title='Support'
        sandbox='allow-scripts allow-popups allow-forms allow-same-origin'
        width='100%'
        height='100%'
        style={{ border: 0 }}
        src={helpUrl()}
      >
        Your browser does not allow embedded content.
      </iframe>
    </div>
  )
}
