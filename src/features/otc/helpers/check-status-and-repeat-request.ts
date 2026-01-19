import { OTCResponse, OtcService } from 'wip/services/otc'
import { getOtcFx } from 'model/otc'

const STATUS_OTC_FOR_RETRY = 'AWAITING_OFFER'
const FETCH_RETRY_DELAY = 5000

export const checkStatusAndRepeatRequest = (data: OTCResponse) => {
  if (data.otcStatus !== STATUS_OTC_FOR_RETRY) {
    return () => {}
  }

  let isActive = true

  const fetchWithRetry = async () => {
    if (!isActive) {
      return
    }

    try {
      const otcResponse = await OtcService.getUserRequest(data.id)
      const isAwaitingOffer = otcResponse.otcStatus === STATUS_OTC_FOR_RETRY

      if (isAwaitingOffer) {
        setTimeout(fetchWithRetry, FETCH_RETRY_DELAY)
      } else {
        getOtcFx()
      }
    } catch (error: any) {
      console.log(error)
    }
  }

  fetchWithRetry()

  return () => {
    isActive = false
  }
}
