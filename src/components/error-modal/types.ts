export interface ModalOptions {
  customCloseModal?: () => void
}

export interface ErrorModalLayoutProps {
  closeModal: () => void
  customCloseModal?: () => void
  children: React.ReactNode
}
