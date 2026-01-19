import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Modal } from 'components'
import { pages } from 'constant'
import { OTC_CONFIRMATION_MODAL_OPTIONS, OtcConfirmationModal } from 'features/modals/otc-confirmation-modal'
import { checkStatusAndRepeatRequest } from 'features/otc/helpers/check-status-and-repeat-request'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { handleError } from 'utils/error-handler'
import { NumberWithZeroCount } from 'utils/number-with-zero-count'
import { OTCResponse, OtcService, OTCStatus } from 'wip/services/otc'
import { getOtcFx, setOtcIsLoadingEv } from 'model/otc'

interface StatusMapping {
  text: string
  type: 'warning' | 'error' | 'success'
}
//TODO переписать OtcConfirmationModal на ConfirmationModalBiz
const otcStatusMapping: Record<OTCStatus, StatusMapping> = {
  AWAITING_DEPOSIT: { text: 'Awaiting Deposit', type: 'warning' },
  TRADE_REJECTED: { text: 'Trade Cancelled', type: 'error' },
  AWAITING_OFFER: { text: 'Awaiting Offer', type: 'warning' },
  OFFER_RECEIVED: { text: 'Offer Received', type: 'success' },
  OFFER_REJECTED: { text: 'Offer Rejected', type: 'error' },
  TRADE_COMPLETED: { text: 'Trade Completed', type: 'success' },
}

export const useOtcTradeRow = (data: OTCResponse) => {
  const navigate = useNavigate()

  const { id, fromAssetId, toAssetId, fromAmount, otcStatus, currentOffer, createdAt } = data
  const [isOpen, setIsOpen] = useState(
    ![OTCStatus.OFFER_REJECTED, OTCStatus.TRADE_COMPLETED, OTCStatus.TRADE_REJECTED].includes(otcStatus)
  )
  const [showButtons, setShowButtons] = useState(
    [OTCStatus.AWAITING_DEPOSIT, OTCStatus.OFFER_RECEIVED].includes(otcStatus)
  )

  useEffect(() => {
    if ([OTCStatus.AWAITING_DEPOSIT, OTCStatus.OFFER_RECEIVED].includes(otcStatus)) {
      setShowButtons(true)
    }
  }, [otcStatus])

  useEffect(() => {
    const cancelRetry = checkStatusAndRepeatRequest(data)
    return () => cancelRetry()
  }, [data])

  const toggleDetails = () => setIsOpen(!isOpen)

  const handleCancelTrade = async () => {
    setOtcIsLoadingEv(true)
    try {
      await OtcService.cancelDeposit(id)
      await getOtcFx()
      Modal.open(
        <OtcConfirmationModal options={OTC_CONFIRMATION_MODAL_OPTIONS.tradeCancelled} action={Modal.close} />,
        { variant: 'center' }
      )
      setShowButtons(false)
    } catch (error) {
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
      })
      setShowButtons(false)
    } catch (error) {
      handleError(error)
    } finally {
      setOtcIsLoadingEv(false)
    }
  }

  const handleModalConfirm = () => {
    if (OTCStatus.AWAITING_DEPOSIT === otcStatus) {
      navigate(pages.OTC_DEPOSIT.path, { state: { data: data } })
      // Modal.open(<OtcDepositFundsModal data={data} />, { isFullScreen: true }) //TODO for old OTC
    } else if (OTCStatus.OFFER_RECEIVED === otcStatus) {
      Modal.open(
        <OtcConfirmationModal options={OTC_CONFIRMATION_MODAL_OPTIONS.acceptOffer} action={handleAcceptOffer} />,
        { variant: 'center' }
      )
    }
  }

  const handleModalCancel = () => {
    if (OTCStatus.AWAITING_DEPOSIT === otcStatus) {
      Modal.open(
        <OtcConfirmationModal options={OTC_CONFIRMATION_MODAL_OPTIONS.cancelTrade} action={handleCancelTrade} />,
        { variant: 'center' }
      )
    } else if (OTCStatus.OFFER_RECEIVED === otcStatus) {
      Modal.open(
        <OtcConfirmationModal options={OTC_CONFIRMATION_MODAL_OPTIONS.rejectOffer} action={handleRejectOffer} />,
        { variant: 'center' }
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

  return {
    isOpen,
    toggleDetails,
    handleModalConfirm,
    handleModalCancel,
    onExpireAction,
    showButtons,
    timerWarningThreshold,
    badgeType,
    badgeText,
    offerButtons,
    amountForDisplay,
    rateOfferForDisplay,
    offerAmountForDisplay,
    feeForDisplay,
    createdAt,
    otcStatus,
    currentOffer,
    fromAssetId,
    toAssetId,
  }
}
