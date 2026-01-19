import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { SearchBar } from 'components/search-bar'
import { pages } from 'constant'
import { $stepUpBlockExpiration } from 'model/step-up-block-expiration'
import { $twoFaStatus } from 'model/two-fa'

import { ACCOUNT_PAGES } from '../account-settings'
import { CONFIRMATION_MODAL_OPTIONS, ConfirmationModalBiz } from '../modals-biz/confirmation-modal-biz'
import { SecurityTimerModalBiz } from '../modals-biz/security-timer-modal-biz'
import styles from './styles.module.scss'

type Props = {
  handleSearch: (arg: string) => void
}

export const WhitelistToolbarBiz = ({ handleSearch }: Props) => {
  const navigate = useNavigate()
  const twoFaStatus = useUnit($twoFaStatus)
  const securityTimerData = useUnit($stepUpBlockExpiration)

  const handleAddNew = () => {
    if (!twoFaStatus) {
      Modal.open(
        <ConfirmationModalBiz
          options={CONFIRMATION_MODAL_OPTIONS.enable2FAPrompt}
          action={() => {
            navigate(pages.ACCOUNT_SETTINGS.path, { state: { currentPage: ACCOUNT_PAGES.SECURITY } })
            Modal.close()
          }}
        />,
        { variant: 'center' }
      )

      return
    }

    if (securityTimerData?.expiresAt) {
      return Modal.open(<SecurityTimerModalBiz />, { variant: 'center' })
    }

    navigate(pages.MANAGE_WHITELIST.path)
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerTitleAndSearchWrap}>
          <label className={styles.headerTitle}>Whitelist</label>
          <div className={clsx(styles.searchBarWrap, styles.hideMdAndDown)}>
            <SearchBar onChange={handleSearch} />
          </div>
        </div>

        <button onClick={handleAddNew} className='btn-with-icon-biz light-blue'>
          Add New +
        </button>
      </div>

      <div className={clsx(styles.searchBarWrapMd)}>
        <SearchBar onChange={handleSearch} />
      </div>
    </>
  )
}
