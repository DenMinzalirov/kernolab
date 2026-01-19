import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { HELP_LINKS } from '../../../config'
import { pages } from '../../../constant'
import CopiedSVG from '../../../icons/copied.svg'
import { OTCClient } from '../../../wip/services/fideumOTC-services/OTC-trade'
import { ClientDetailsModal } from '../../modals-fideumOTC'
import { $clientsOTC, $paginationInfoClients, clientsPageChangedEv } from '../../model/clients-fideumOTC'
import { $filters, filtersChangedEv } from '../../model/filters-fideumOTC'
import { Pagination } from '../trades-fideumOTC/Pagination'
import styles from './styles.module.scss'
import { ColumnConfig } from './types'
import { getCellValue, getStatusBadgeStyle } from './utils'

export function ClientsFideumOTC() {
  const data = useUnit($clientsOTC)
  const globalFilters = useUnit($filters)
  const paginationInfo = useUnit($paginationInfoClients)

  const navigate = useNavigate()

  const safeData = Array.isArray(data) ? data : []

  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCopied, setStateCopied] = useState(false)

  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    { key: 'createdAt', label: 'Registration Date', width: 1.2, visible: true },
    { key: 'fullName', label: 'Full Name', width: 1.5, visible: true },
    { key: 'email', label: 'Email', width: 1.8, visible: true },
    { key: 'applicantId', label: 'Applicant ID', width: 1.2, visible: true },
    { key: 'status', label: 'Status', width: 1, visible: true },
    { key: 'clientUuid', label: 'Client ID', width: 1.2, visible: true },
    // { key: 'updatedAt', label: 'Last Updated', width: 1.2, visible: true },
    { key: 'clientTrades', label: 'Client Trades', width: 1, visible: true },
  ])

  const visibleColumns = columnConfig.filter(col => col.visible)

  const handleRowClick = (client: any) => {
    setSelectedClient(client)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClient(null)
  }

  const handlePageChange = (page: number) => {
    clientsPageChangedEv(page)
  }

  const handleApplicantClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, client: any) => {
    e.stopPropagation()

    window.open(`https://cockpit.sumsub.com/checkus/applicant/${client.applicantId}`)
  }

  const cellRenderers = {
    status: (client: any, column: any) => (
      <div className={clsx(styles.statusBadgeWrap)}>
        <div className={clsx(styles.statusBadge, styles[getStatusBadgeStyle(client.status)])}>
          {getCellValue(client, column.key)}
        </div>
      </div>
    ),
    applicantId: (client: any, column: any) => (
      <div onClick={e => handleApplicantClick(e, client)} className={clsx(styles.statusBadgeWrap)}>
        <div className={clsx(styles.statusBadge, styles[getStatusBadgeStyle(client.status)])}>sumsub</div>
      </div>
    ),
    clientTrades: (client: any, column: any) => (
      <button
        className={clsx(styles.statusBadgeWrap)}
        onClick={e => {
          e.stopPropagation()

          filtersChangedEv({ ...globalFilters, clientUuid: client.clientUuid, page: 0 })
          navigate(pages.Base.path)
        }}
      >
        View Trades
      </button>
    ),
  }

  return (
    <>
      <div style={{ width: 120, alignSelf: 'end', marginBottom: 10, marginRight: 10 }}>
        <button
          onClick={() => {
            // https://in.sumsub.com/websdk/p/uni_4bLDmDeae6Ymyd2f - DEV
            // https://in.sumsub.com/websdk/p/sbx_uni_H7CSO3AXAzD6Gp5G - PROD
            navigator.clipboard.writeText('https://in.sumsub.com/websdk/p/uni_4bLDmDeae6Ymyd2f').then(() => {
              setStateCopied(true)
              setTimeout(() => {
                setStateCopied(false)
              }, 800)
            })
          }}
          className={'btn-biz blue'}
        >
          Invite link{' '}
          {isCopied ? (
            <img
              src={CopiedSVG}
              alt='copied'
              style={{ width: 15, marginLeft: 10 }}
              // className={clsx(styles.iconСopiedWrap, !isCopied ? styles.hidden : styles.visible)}
            />
          ) : (
            ''
          )}
        </button>
      </div>
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          {visibleColumns.map((column, index) => (
            <div
              key={column.key}
              className={clsx(styles.headerText, styles[`cell${index + 1}`])}
              style={{ flex: column.width }}
            >
              {column.label}
            </div>
          ))}
        </div>

        {!loading && !safeData.length && (
          <div className={styles.placeholder}>
            <p className={styles.placeholderText}>No clients available</p>
          </div>
        )}

        {!loading && !!safeData.length && (
          <div className={styles.tableRowsWrap}>
            {safeData.map(client => {
              if (!client || typeof client !== 'object') return null

              const clientKey = client.clientUuid || `client-${Math.random()}`

              return (
                <div key={clientKey} className={styles.tableRow} onClick={() => handleRowClick(client)}>
                  {visibleColumns.map((column, index) => {
                    const columnKey = column.key as keyof OTCClient
                    return (
                      <div
                        key={column.key}
                        className={clsx(
                          column.key === 'createdAt' || column.key === 'updatedAt' ? styles.dateText : styles.text,
                          styles[`cell${index + 1}`]
                        )}
                        style={{ flex: column.width }}
                      >
                        {cellRenderers[column.key as keyof typeof cellRenderers]
                          ? cellRenderers[column.key as keyof typeof cellRenderers](client, column)
                          : getCellValue(client, columnKey)}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {loading && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
          </div>
        )}

        {/* Client Details Modal */}
        <ClientDetailsModal isOpen={isModalOpen} onClose={handleCloseModal} clientData={selectedClient} />
      </div>

      {/* Пагинация */}
      <Pagination
        currentPage={paginationInfo.currentPage}
        totalPages={paginationInfo.totalPages}
        onPageChange={handlePageChange}
      />
    </>
  )
}
