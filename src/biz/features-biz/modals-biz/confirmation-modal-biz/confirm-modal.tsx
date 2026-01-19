import { ErrorModal } from 'components/error-modal'

import { CONFIRMATION_MODAL_OPTIONS, ConfirmationModalBiz } from '.'

type ConfirmKey = keyof typeof CONFIRMATION_MODAL_OPTIONS

export function confirmModal(key: ConfirmKey): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    const resolveTrue = () => {
      resolve(true)
      ErrorModal.close()
    }
    const resolveFalse = () => {
      resolve(false)
      ErrorModal.close()
    }

    ErrorModal.open(
      <ConfirmationModalBiz
        options={CONFIRMATION_MODAL_OPTIONS[key]}
        action={resolveTrue} // клик по основной кнопке => true
        onCancel={resolveFalse} // клик по "Cancel" => false
      />,
      { customCloseModal: resolveFalse }
    )
  })
}
