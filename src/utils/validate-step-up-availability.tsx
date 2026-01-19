import { Modal } from 'components'
import { ErrorModal } from 'components/error-modal'
import { STEP_UP_SCOPE } from 'constant/step-up-scope'
import { WithdrawalsDisabledModal } from 'features/modals/withdrawals-disabled-modal'
import { AuthServiceV4 } from 'wip/services'
import { stepUpBlockExpirationFx } from 'model/step-up-block-expiration'

import { isBiz, isXanova } from '../config'
import { handleError } from './error-handler'
import { SecurityTimerModalBiz } from 'biz/features-biz/modals-biz/security-timer-modal-biz'
import { SecurityTimerModalXanova } from 'xanova/modal/security-timer-modal-xanova'

export const validateStepUpAvailability = async (scopeValue: string) => {
  if ([STEP_UP_SCOPE.FIAT_WITHDRAWAL, STEP_UP_SCOPE.WITHDRAWAL, STEP_UP_SCOPE.CARD_DATA].includes(scopeValue)) {
    try {
      const stepUpBlockInfo = await stepUpBlockExpirationFx()

      if (!stepUpBlockInfo?.expiresAt) {
        const stepUpRes = await AuthServiceV4.stepUp({ scope: scopeValue })
        return stepUpRes
      }

      if (isBiz) {
        Modal.open(<SecurityTimerModalBiz />, { variant: 'center' })
        return
      }

      if (isXanova) {
        Modal.open(<SecurityTimerModalXanova />, { variant: 'center' })
        return
      }

      ErrorModal.open(
        <WithdrawalsDisabledModal
          expirationDateString={stepUpBlockInfo.expiresAt}
          closeAction={() => {
            ErrorModal.close()
            Modal.close()
          }}
        />
      )
    } catch (error: any) {
      handleError(error)
    }
  } else {
    const stepUpRes = await AuthServiceV4.stepUp({ scope: scopeValue })
    return stepUpRes
  }
}
