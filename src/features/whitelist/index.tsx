import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { HeaderTitle, Modal } from 'components'
import { CopyComponent } from 'components/copy-component'
import { MenuWithActions } from 'components/menu-with-actions'
import { MiniButton } from 'components/mini-button'
import { SearchBar } from 'components/search-bar'
import { pages } from 'constant'
import { getNetworkIcon } from 'utils/get-network-icon'
import { WhitelistAddressResponse } from 'wip/services/white-list'
import { Close20 } from 'icons/close20'
import { EditIconV2 } from 'icons/edit-icon-v2'
import { $whiteList, getWhiteListFx } from 'model/white-list'

import { NoWhitelistPlaceholder } from './no-whitelist-placeholder'
import styles from './styles.module.scss'
import { SwipeRow } from './swipe-row'
import { WhitelistDeleteAddress } from './whitelist-delete-address'
import { WhitelistDetailsForMobile } from './whitelist-details-for-mobile'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export type ModalCloseRef = {
  action: () => void
}

export function Whitelist() {
  const navigate = useNavigate()
  const whiteList = useUnit($whiteList)
  const modalCloseRef = useRef<ModalCloseRef | null>(null)
  const [filteredWhiteList, setFilteredWhiteList] = useState(whiteList)
  const { isMobilePairs } = useCurrentBreakpointPairs()
  const [isCopied, setIsCopied] = useState('')

  useEffect(() => {
    getWhiteListFx()
  }, [])

  useEffect(() => {
    setFilteredWhiteList(whiteList)
  }, [whiteList])

  const handleDelete = (id: string) => {
    Modal.open(<WhitelistDeleteAddress id={id} />, {
      variant: 'center',
    })
  }

  const handleCustomClose = () => {
    modalCloseRef?.current?.action()
  }

  const handleUpdate = (id: string) => {
    navigate(pages.WHITELIST_MANAGE.path, { state: { id } })
  }

  const handleAddNew = () => {
    navigate(pages.WHITELIST_MANAGE.path)
  }

  const handleSearch = (filterText: string) => {
    if (!filterText) setFilteredWhiteList(whiteList)
    const data = whiteList.filter(obj => {
      return Object.values(obj).some(val => val.toString().toLowerCase().includes(filterText.toLowerCase()))
    })
    setFilteredWhiteList(data)
  }

  const handleOnClickRowMobile = (data: WhitelistAddressResponse) => {
    Modal.open(
      <WhitelistDetailsForMobile
        data={data}
        action={() => {
          handleUpdate(data.id)
          Modal.close()
        }}
      />,
      {
        variant: 'center',
      }
    )
  }

  function formatAddress(address: string): string {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={'Whitelist'} showBackBtn />

      <div className={styles.mobileSearch}>
        <SearchBar
          onChange={function (text: string): void {
            handleSearch(text)
          }}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.tableTitleRow}>
          <div className={styles.tableTitle}>Whitelist</div>

          <div className={styles.tableActionsWrap}>
            {isMobilePairs ? null : (
              <SearchBar
                onChange={function (text: string): void {
                  handleSearch(text)
                }}
              />
            )}
            <MiniButton title={'Add New +'} action={handleAddNew} buttonActive={false} size='medium' />
          </div>
        </div>

        <div className={styles.table}>
          <div className={clsx(styles.tableHeader, styles.hideMobile)}>
            <div className={clsx(styles.tableHeaderText, styles.cell1)}>Network</div>
            <div className={clsx(styles.tableHeaderText, styles.cell2)}>Name</div>
            <div className={clsx(styles.tableHeaderText, styles.cell3)}>Address</div>
            <div className={clsx(styles.tableHeaderText, styles.cell4)}>Tag</div>
            <div className={clsx(styles.tableHeaderText, styles.cell5)}>Actions</div>
          </div>

          <div className={styles.tableRowsWrap}>
            {filteredWhiteList?.length ? (
              filteredWhiteList.map(item => {
                const networkIcon = getNetworkIcon(item.networkId)

                if (isMobilePairs) {
                  return (
                    <SwipeRow
                      key={item.id}
                      onDelete={() => handleDelete(item.id)}
                      onClick={() => {
                        handleOnClickRowMobile(item)
                      }}
                    >
                      <div style={{ display: 'flex' }}>
                        <div className={styles.cell1}>
                          <img className={clsx('asset-icon', styles.icon)} src={networkIcon} alt='' />
                          <div className={styles.itemCell1}>
                            <div className={styles.tableRowText}>{item.name}</div>
                            <div className={styles.tableRowSubText}>{item.networkId}</div>
                          </div>
                        </div>

                        <div className={styles.cell3}>
                          <div
                            className={styles.tableRowСopyAddress}
                            onClick={() => {
                              !isMobilePairs && navigator.clipboard.writeText(item.address)
                            }}
                          >
                            <div className={clsx(styles.tableRowText, styles.mobileTextEnd)}>
                              {formatAddress(item.address)}
                            </div>
                          </div>
                          <div className={clsx(styles.tableRowSubText, styles.tagMobile)}>{item.tag}</div>
                        </div>
                      </div>
                    </SwipeRow>
                  )
                }

                return (
                  /* TODO после тестирования убрать все что относиться к isMobilePairs */
                  <div className={styles.tableRow} key={item.id}>
                    {/* Network */}
                    <div className={styles.cell1}>
                      <img className={clsx('asset-icon', styles.icon)} src={networkIcon} alt='' />
                      <div className={styles.itemCell1}>
                        {isMobilePairs ? <div className={styles.tableRowText}>{item.name}</div> : null}
                        <div className={isMobilePairs ? styles.tableRowSubText : styles.tableRowText}>
                          {item.networkId}
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div className={styles.cell2}>
                      <div className={styles.tableRowText}>{item.name}</div>
                    </div>

                    {/* Address */}
                    <div className={styles.cell3}>
                      <div
                        className={styles.tableRowСopyAddress}
                        onClick={() => {
                          navigator.clipboard.writeText(item.address).then(() => {
                            setIsCopied(item.id)
                            setTimeout(() => {
                              setIsCopied('')
                            }, 2000)
                          })
                        }}
                      >
                        <div className={clsx(styles.tableRowText, styles.mobileTextEnd)}>
                          {isMobilePairs ? formatAddress(item.address) : item.address}
                        </div>
                        {isMobilePairs ? null : (
                          <div className={styles.copyAddressIcon}>
                            <CopyComponent isCopied={isCopied === item.id} />
                          </div>
                        )}
                      </div>
                      <div className={clsx(styles.tableRowSubText, styles.tagMobile)}>{item.tag}</div>
                    </div>

                    {/* Tag */}
                    <div className={clsx(styles.cell4, styles.tableRowText)}>{item.tag}</div>

                    {/* Action */}
                    <div className={styles.cell5}>
                      <div className={clsx(styles.actionButtons, styles.hideTableAndDown)}>
                        <button
                          onClick={() => handleUpdate(item.id)}
                          className='btn-new transparent-border small'
                          style={{ maxWidth: 150 }}
                          // disabled={!depositEnabled}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className='btn-new transparent-border small'
                          style={{ maxWidth: 150 }}
                          // disabled={!withdrawalEnabled}
                        >
                          Delete
                        </button>
                      </div>

                      {/* only Table and down*/}
                      <div className={clsx(styles.menuDotsWrap)}>
                        <MenuWithActions
                          actions={[
                            {
                              label: 'Edit',
                              onClick: () => handleUpdate(item.id),
                              disabled: false,
                              icon: <EditIconV2 />,
                            },
                            {
                              label: 'Delete',
                              labelColor: 'red',
                              onClick: () => handleDelete(item.id),
                              disabled: false,
                              icon: <Close20 fill='var(--P-System-Red)' />,
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <NoWhitelistPlaceholder />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
