import {
  $isModalClosedByUser,
  $modal,
  $modalLoader,
  changeMobileModal,
  closeModal,
  openModal,
  setModalLoader,
} from './model'
import { ModalPortal } from './portal'

export const Modal = {
  close: closeModal,
  open: openModal,
  isOpen: $modal.map(Boolean),
  loader: $modalLoader,
  setModalLoader: setModalLoader,
  changeMobileModal: changeMobileModal,
  portal: ModalPortal,
  isModalClosedByUser: $isModalClosedByUser,
}
