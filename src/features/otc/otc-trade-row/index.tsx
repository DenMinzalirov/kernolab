import { useEffect, useState } from 'react'
import moment from 'moment'
import clsx from 'clsx'

import { Modal } from 'components'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { handleError } from 'utils/error-handler'
import { NumberWithZeroCount } from 'utils/number-with-zero-count'
import { OTCResponse, OtcService, OTCStatus } from 'wip/services/otc'
import { getOtcFx, setOtcIsLoadingEv } from 'model/otc'
import { ArrowIconSmall } from 'assets/icons/arrow-icon-small'

import { OTC_CONFIRMATION_MODAL_OPTIONS, OtcConfirmationModal } from '../../modals/otc-confirmation-modal'
import { OtcDepositFundsModal } from '../../modals/otc-deposit-funds-modal'
import { checkStatusAndRepeatRequest } from '../helpers/check-status-and-repeat-request'
import { OtcStatusBadge } from '../otc-status-badge'
import { OtcTimer } from '../otc-timer'
import styles from './styles.module.scss'

const ExchangeIcon = () => {
  return (
    <div>
      <svg width='42' height='42' viewBox='0 0 42 42' fill='none'>
        <circle cx='21' cy='21' r='21' transform='rotate(-180 21 21)' fill='var(--mainBlue)' fillOpacity='0.1' />
        <path
          d='M8.29289 20.2929C7.90237 20.6834 7.90237 21.3166 8.29289 21.7071L14.6569 28.0711C15.0474 28.4616 15.6805 28.4616 16.0711 28.0711C16.4616 27.6805 16.4616 27.0474 16.0711 26.6569L10.4142 21L16.0711 15.3431C16.4616 14.9526 16.4616 14.3195 16.0711 13.9289C15.6805 13.5384 15.0474 13.5384 14.6569 13.9289L8.29289 20.2929ZM34.7071 21.7071C35.0976 21.3166 35.0976 20.6834 34.7071 20.2929L28.3431 13.9289C27.9526 13.5384 27.3195 13.5384 26.9289 13.9289C26.5384 14.3195 26.5384 14.9526 26.9289 15.3431L32.5858 21L26.9289 26.6569C26.5384 27.0474 26.5384 27.6805 26.9289 28.0711C27.3195 28.4616 27.9526 28.4616 28.3431 28.0711L34.7071 21.7071ZM9 22H34V20H9V22Z'
          fill='var(--mainBlue)'
        />
      </svg>
    </div>
  )
}

interface StatusMapping {
  text: string
  type: 'warning' | 'error' | 'success'
}

const otcStatusMapping: Record<OTCStatus, StatusMapping> = {
  AWAITING_DEPOSIT: { text: 'Awaiting Deposit', type: 'warning' },
  TRADE_REJECTED: { text: 'Trade Cancelled', type: 'error' },
  AWAITING_OFFER: { text: 'Awaiting Offer', type: 'warning' },
  OFFER_RECEIVED: { text: 'Offer Received', type: 'success' },
  OFFER_REJECTED: { text: 'Offer Rejected', type: 'error' },
  TRADE_COMPLETED: { text: 'Trade Completed', type: 'success' },
}

type TradeRowProps = {
  data: OTCResponse
}

export const OtcTradeRow = ({ data }: TradeRowProps) => {
  const { id, fromAssetId, toAssetId, fromAmount, otcStatus, currentOffer, createdAt } = data
  const [isOpen, setIsOpen] = useState(
    ![OTCStatus.OFFER_REJECTED, OTCStatus.TRADE_COMPLETED, OTCStatus.TRADE_REJECTED].includes(otcStatus)
  )
  const [showButtons, setShowButtons] = useState(
    [OTCStatus.AWAITING_DEPOSIT, OTCStatus.OFFER_RECEIVED].includes(otcStatus)
  )

  useEffect(() => {
    const cancelRetry = checkStatusAndRepeatRequest(data)
    return () => {
      cancelRetry()
    }
  }, [data])

  const toggleDetails = () => {
    setIsOpen(!isOpen)
  }

  const handleCancelTrade = async () => {
    setOtcIsLoadingEv(true)
    try {
      await OtcService.cancelDeposit(id)
      await getOtcFx()

      Modal.open(
        <OtcConfirmationModal options={OTC_CONFIRMATION_MODAL_OPTIONS.tradeCancelled} action={Modal.close} />,
        {
          variant: 'center',
          isFullScreen: true,
        }
      )
      setShowButtons(false)
    } catch (error) {
      console.log(error)
      handleError(error)
    } finally {
      setOtcIsLoadingEv(false)
    }
  }

  const handleAcceptOffer = async () => {
    if (!currentOffer?.id) return

    setOtcIsLoadingEv(true)
    try {
      await OtcService.acceptOffer(id, { otcOfferId: currentOffer.id })
      await getOtcFx()
      Modal.open(<OtcConfirmationModal options={OTC_CONFIRMATION_MODAL_OPTIONS.offerAccepted} action={Modal.close} />, {
        variant: 'center',
        isFullScreen: true,
      })
      setShowButtons(false)
    } catch (error) {
      handleError(error)
    } finally {
      setOtcIsLoadingEv(false)
    }
  }

  const handleRejectOffer = async () => {
    setOtcIsLoadingEv(true)
    try {
      await OtcService.rejectOffer(id)
      await getOtcFx()
      Modal.open(<OtcConfirmationModal options={OTC_CONFIRMATION_MODAL_OPTIONS.offerRejected} action={Modal.close} />, {
        variant: 'center',
        isFullScreen: true,
      })
      setShowButtons(false)
    } catch (error) {
      handleError(error)
    } finally {
      setOtcIsLoadingEv(false)
    }
  }

  const handleModalСonfirm = () => {
    if (OTCStatus.AWAITING_DEPOSIT === otcStatus) {
      Modal.open(<OtcDepositFundsModal data={data} />, {
        isFullScreen: true,
      })
    } else if (OTCStatus.OFFER_RECEIVED === otcStatus) {
      Modal.open(
        <OtcConfirmationModal options={OTC_CONFIRMATION_MODAL_OPTIONS.acceptOffer} action={handleAcceptOffer} />,
        {
          variant: 'center',
          isFullScreen: true,
        }
      )
    }
  }

  const handleModalCancel = () => {
    if (OTCStatus.AWAITING_DEPOSIT === otcStatus) {
      Modal.open(
        <OtcConfirmationModal options={OTC_CONFIRMATION_MODAL_OPTIONS.cancelTrade} action={handleCancelTrade} />,
        {
          variant: 'center',
          isFullScreen: true,
        }
      )
    } else if (OTCStatus.OFFER_RECEIVED === otcStatus) {
      Modal.open(
        <OtcConfirmationModal options={OTC_CONFIRMATION_MODAL_OPTIONS.rejectOffer} action={handleRejectOffer} />,
        {
          variant: 'center',
          isFullScreen: true,
        }
      )
    }
  }

  const handleGetUserRequest = async () => {
    setOtcIsLoadingEv(true)
    try {
      getOtcFx()
    } catch (error) {
      handleError(error)
    } finally {
      setOtcIsLoadingEv(false)
    }
  }

  const onExpireAction = async () => {
    setShowButtons(false)
    setTimeout(handleGetUserRequest, 5000)
  }

  const badgeType = otcStatusMapping[otcStatus].type
  const badgeText = otcStatusMapping[otcStatus].text

  const offerButtons = [OTCStatus.OFFER_RECEIVED].includes(otcStatus)
  const timerWarningThreshold = 60

  const amountAddCommas = addCommasToDisplayValue((+fromAmount).toString())
  const amountForDisplay = NumberWithZeroCount({ numberString: amountAddCommas })

  const rateOffer = currentOffer?.rate ? (+currentOffer?.rate).toString() : ''
  const rateOfferAddCommas = rateOffer ? addCommasToDisplayValue(rateOffer) : ''
  const rateOfferForDisplay = NumberWithZeroCount({ numberString: rateOfferAddCommas })

  const offerAmount = currentOffer?.totalAmount
  const offerAmountAddCommas = offerAmount ? addCommasToDisplayValue((+offerAmount).toString()) : ''
  const offerAmountForDisplay = NumberWithZeroCount({ numberString: offerAmountAddCommas })

  const feeFarmat = currentOffer?.feeAmount ? (+currentOffer?.feeAmount).toString() : ''
  const feeForDisplay = NumberWithZeroCount({ numberString: feeFarmat })

  return (
    <div className={clsx(styles.container, isOpen ? styles.containerBg : '')}>
      <div className={styles.row}>
        <div className={styles.infoWrap}>
          <ExchangeIcon />
          <div className={styles.info}>
            <div className={styles.title}>
              {fromAssetId} to {toAssetId}
            </div>
            <div className={styles.textDate}>{moment(createdAt).format('MMMM DD, YYYY')}</div>
          </div>
        </div>

        <div className={styles.titleWrap}>
          <div className={clsx(styles.title, styles.clamp)}>{amountForDisplay}</div>
          <div className={styles.title}>{fromAssetId}</div>
        </div>

        <div className={styles.statusWrap}>
          <OtcStatusBadge badgeType={badgeType} statusText={badgeText} />
        </div>

        <div className={styles.arrow} onClick={toggleDetails}>
          <ArrowIconSmall className={isOpen ? styles.rotate0 : styles.rotate180} />
        </div>
      </div>

      {isOpen && (
        <>
          <hr className={styles.divider} />
          <div className={styles.detailsContainer}>
            <div className={styles.detailsWrap}>
              <div className={styles.title}>OTC Offer</div>

              <div className={styles.details}>
                {[OTCStatus.AWAITING_DEPOSIT].includes(otcStatus) ? (
                  <div className={styles.subTitle}>To receive an OTC Offer please make a deposit first</div>
                ) : (
                  <>
                    <div className={styles.subTitle}>
                      Offer Amount: {offerAmountForDisplay ? offerAmountForDisplay : '-'}
                    </div>
                    <div className={styles.subTitle}>
                      Price Per Coin: {rateOfferForDisplay ? rateOfferForDisplay : '-'}
                    </div>
                    <div className={styles.subTitle}>Fees: {feeForDisplay ? feeForDisplay : '-'}</div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.btnAndTimer}>
              {showButtons && otcStatus !== 'AWAITING_OFFER' ? (
                <div className={styles.buttons}>
                  <button onClick={handleModalСonfirm} className={clsx('btn', 'btn-primary', styles.button)}>
                    {offerButtons ? 'Accept Offer' : 'Deposit'}
                  </button>
                  <button
                    onClick={handleModalCancel}
                    className={clsx('btn', 'btn-secondary', styles.button, styles.btnBorder)}
                  >
                    {offerButtons ? 'Reject Offer' : ' Cancel Trade'}
                  </button>
                </div>
              ) : null}

              {OTCStatus.OFFER_RECEIVED === otcStatus ? (
                <OtcTimer
                  time={currentOffer?.validUntil || ''}
                  title={'Until Offer Expires'}
                  warningThreshold={timerWarningThreshold}
                  onExpire={onExpireAction}
                />
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
