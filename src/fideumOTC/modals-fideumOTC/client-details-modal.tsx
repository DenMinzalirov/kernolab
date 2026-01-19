import React from 'react'
import clsx from 'clsx'

import { OTCClient } from '../../wip/services/fideumOTC-services/OTC-trade'
import styles from './styles.module.scss'
import { TradeComment } from './trade-comment'
import { Modal } from 'rsuite'

interface ClientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  clientData: OTCClient | null
}

export function ClientDetailsModal({ isOpen, onClose, clientData }: ClientDetailsModalProps) {
  if (!clientData) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'statusGreen'
      case 'PENDING':
        return 'statusYellow'
      case 'REJECTED':
        return 'statusRed'
      default:
        return 'statusGrey'
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} size='md' className={styles.clientDetailsModal}>
      <Modal.Header>
        <Modal.Title className={styles.modalTitle}>Client Details</Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        <div className={styles.clientDetailsContainer}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Full Name:</span>
                <span className={styles.detailValue}>{clientData.fullName || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email:</span>
                <span className={styles.detailValue}>{clientData.email || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Client ID:</span>
                <span className={styles.detailValue}>{clientData.clientUuid || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Applicant ID:</span>
                <span className={styles.detailValue}>{clientData.applicantId || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <div className={styles.statusContainer}>
                  <div className={clsx(styles.statusBadge, styles[getStatusBadgeStyle(clientData.status)])}>
                    {clientData.status || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Timestamps</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Registration Date:</span>
                <span className={styles.detailValue}>
                  {clientData.createdAt ? formatDate(clientData.createdAt) : 'N/A'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Last Updated:</span>
                <span className={styles.detailValue}>
                  {clientData.updatedAt ? formatDate(clientData.updatedAt) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <TradeComment client={clientData.clientUuid} />
      </Modal.Body>

      {/*<Modal.Footer className={styles.modalFooter}>*/}
      {/*  <button type='button' onClick={onClose} className={styles.closeButton}>*/}
      {/*    Close*/}
      {/*  </button>*/}
      {/*</Modal.Footer>*/}
    </Modal>
  )
}
