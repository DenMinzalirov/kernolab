import { ErrorModalPortal } from './error-portal'
import { closeErrorModal, openErrorModal } from './model'

export const ErrorModal = {
  open: openErrorModal,
  close: closeErrorModal,
  portal: ErrorModalPortal,
}
