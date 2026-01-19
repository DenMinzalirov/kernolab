import moment from 'moment'
import clsx from 'clsx'

import { OTCResponse, OTCStatus } from 'wip/services/otc'
import { ArrowIconSmall } from 'assets/icons/arrow-icon-small'

import { useOtcTradeRow } from '../../hooks/use-otc-trade-row'
import { OtcTimerBiz } from '../otc-timer-biz'
import styles from './styles.module.scss'

type TradeRowProps = {
  data: OTCResponse
}

export const OtcTradeRowBiz = ({ data }: TradeRowProps) => {
  const {
    isOpen,
    toggleDetails,
    handleModalConfirm,
    handleModalCancel,
    onExpireAction,
    showButtons,
    badgeType,
    badgeText,
    offerButtons,
    timerWarningThreshold,
    amountForDisplay,
    rateOfferForDisplay,
    offerAmountForDisplay,
    feeForDisplay,
    createdAt,
    otcStatus,
    currentOffer,
    fromAssetId,
    toAssetId,
  } = useOtcTradeRow(data)

  return (
    <div className={styles.container}>
      <div className={clsx(styles.row)}>
        <div className='otcCell1'>
          <span className={clsx(styles.rowText, styles.wordBreak, styles.showInlineLgAndDown)}>{amountForDisplay}</span>
          <span className={clsx(styles.rowText)}> {fromAssetId}</span>
          <span className={clsx(styles.rowText, styles.showInlineMdAndDown)}> to {toAssetId}</span>
          <div className={clsx(styles.rowSubText, styles.showLgAndDown)}>{moment(createdAt).format('DD/MM/YY')}</div>
        </div>

        <div className={clsx('otcCell2', styles.rowText, styles.hideMdAndDown)}>{toAssetId}</div>

        <div className={clsx('otcCell3', styles.rowText, styles.hideLgAndDown)}>
          <span className={styles.wordBreak}>{amountForDisplay}</span> <span>{fromAssetId}</span>
        </div>

        <div className={clsx('otcCell4', styles.rowSubText, styles.hideLgAndDown)}>
          {moment(createdAt).format('DD/MM/YY')}
        </div>

        <div className='otcCell5'>
          <div className={styles.statusWrap}>
            <div className={clsx(styles.statusBadge, styles[badgeType])}>
              <div className={clsx(styles.statusBadgeText, styles[badgeType])}>{badgeText}</div>
            </div>

            <div className={styles.arrow} onClick={toggleDetails}>
              <ArrowIconSmall className={isOpen ? styles.rotate0 : styles.rotate180} />
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <>
          <hr className={styles.divider} />
          <div className={styles.detailsContainer}>
            <div className={styles.detailsWrap}>
              <div className={styles.rowTitle}>OTC Offer</div>

              <div className={styles.details}>
                <div className={styles.rowSubTextWrap}>
                  <p className={styles.rowSubText}>Offer Amount:</p>{' '}
                  <span className={clsx(styles.offerSubText)}>
                    {offerAmountForDisplay ? offerAmountForDisplay : '-'}
                  </span>
                </div>
                <div className={styles.rowSubTextWrap}>
                  <p className={styles.rowSubText}> Price Per Coin:</p>{' '}
                  <span className={clsx(styles.offerSubText)}>{rateOfferForDisplay ? rateOfferForDisplay : '-'}</span>
                </div>
                <div className={styles.rowSubTextWrap}>
                  <p className={styles.rowSubText}>Fees: </p>{' '}
                  <span className={clsx(styles.offerSubText)}>{feeForDisplay ? feeForDisplay : '-'}</span>
                </div>
              </div>
            </div>

            {showButtons && otcStatus !== OTCStatus.AWAITING_OFFER ? (
              <div className={styles.btnAndTimerWrap}>
                <div className={styles.buttons}>
                  <button onClick={handleModalConfirm} className='btn-biz blue md'>
                    {offerButtons ? 'Accept Offer' : 'Deposit'}
                  </button>
                  <button onClick={handleModalCancel} className='btn-biz grey md'>
                    {offerButtons ? 'Reject Offer' : ' Cancel Trade'}
                  </button>
                </div>

                <hr className={clsx(styles.divider, styles.showLgAndDown)} />

                {otcStatus === OTCStatus.OFFER_RECEIVED ? (
                  <OtcTimerBiz
                    startTime={currentOffer?.generatedAt || ''}
                    endTime={currentOffer?.validUntil || ''}
                    title={'Until Offer Expires'}
                    warningThreshold={timerWarningThreshold}
                    onExpire={onExpireAction}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
