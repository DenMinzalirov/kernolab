import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal, Spinner } from 'components'
import { pages } from 'constant'
import { handleError } from 'utils/error-handler'
import { WhitelistAddressResponse, WhitListServices } from 'wip/services/white-list'
import { setConfirmModalIsLoadingEv } from 'model/confirm-modal-is-loading'
import { $stepUpBlockExpiration } from 'model/step-up-block-expiration'
import { $twoFaStatus } from 'model/two-fa'
import { $whiteList, getWhiteListFx } from 'model/white-list'

import { ACCOUNT_PAGES } from '../account-settings'
import { CONFIRMATION_MODAL_OPTIONS, ConfirmationModalBiz } from '../modals-biz/confirmation-modal-biz'
import { SecurityTimerModalBiz } from '../modals-biz/security-timer-modal-biz'
import { WhitelistActionModalMobile } from '../modals-biz/whitelist-action-modal-mobile'
import styles from './styles.module.scss'
import { WhitelistTableBodyBiz } from './whitelist-table-body-biz'
import { WhitelistTableHeaderBiz } from './whitelist-table-header-biz'
import { WhitelistToolbarBiz } from './whitelist-toolbar-biz'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

export function WhitelistBiz() {
  const navigate = useNavigate()
  const twoFaStatus = useUnit($twoFaStatus)
  const securityTimerData = useUnit($stepUpBlockExpiration)

  const { isMobileBiz } = useCurrentBreakpoint()
  const [isLoading, setIsLoading] = useState(false)

  const whiteList = useUnit($whiteList)

  const [searchData, setSearchData] = useState<string>('')

  const filteredWhiteList = whiteList.filter(obj => {
    if (!searchData) return true
    return Object.values(obj).some(val => val.toString().toLowerCase().includes(searchData.toLowerCase()))
  })

  useEffect(() => {
    getWhiteListFx().then(() => null)
  }, [])

  const handleSearch = (filterText: string) => {
    setSearchData(filterText)
  }

  const handleDelete = async (id: string) => {
    if (!id) return
    setConfirmModalIsLoadingEv(true)
    try {
      await WhitListServices.deleteAddressWhitelist(id)
      await getWhiteListFx()
      Modal.open(
        <ConfirmationModalBiz options={CONFIRMATION_MODAL_OPTIONS.deleteWhitelistSuccess} action={Modal.close} />,
        { variant: 'center' }
      )
    } catch (error) {
      handleError(error)
    } finally {
      setConfirmModalIsLoadingEv(false)
    }
  }

  const handleOpenDeleteModal = (id: string) => {
    Modal.open(
      <ConfirmationModalBiz options={CONFIRMATION_MODAL_OPTIONS.deleteWhitelist} action={() => handleDelete(id)} />,
      { variant: 'center' }
    )
  }

  const handleOpenUpdateModal = (data: WhitelistAddressResponse) => {
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
      Modal.open(<SecurityTimerModalBiz />, { variant: 'center' })
      return
    }

    navigate(pages.MANAGE_WHITELIST.path, { state: { data } })
  }

  const handleTableRowClick = (data: WhitelistAddressResponse) => {
    if (isMobileBiz) {
      Modal.open(
        <WhitelistActionModalMobile
          data={data}
          handleDelete={handleOpenDeleteModal}
          handleUpdate={handleOpenUpdateModal}
        />,
        { variant: 'center' }
      )
    }
  }

  return (
    <div className={styles.mainContainer}>
      <WhitelistToolbarBiz handleSearch={handleSearch} />

      <div className={styles.table}>
        <WhitelistTableHeaderBiz />

        {!isLoading && filteredWhiteList.length ? (
          <WhitelistTableBodyBiz
            data={filteredWhiteList}
            handleDelete={handleOpenDeleteModal}
            handleUpdate={handleOpenUpdateModal}
            handleTableRowClick={handleTableRowClick}
          />
        ) : null}

        {isLoading ? (
          <div className={styles.loader}>
            <Spinner />
          </div>
        ) : null}

        {!whiteList.length ? (
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>You haven&apos;t added any whitelisted addresses yet.</p>
            <p className={clsx(styles.placeholderText, styles.hideMdAndDown)}>
              Start adding addresses to see them appear here.
            </p>
          </div>
        ) : null}

        {!filteredWhiteList.length && whiteList.length ? (
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>No results found.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
