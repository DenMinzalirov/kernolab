import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useUnit } from 'effector-react'

import { theme } from '../../config'
import { ErrorModalLayout } from './error-modal-layout'
import { $errorModal, closeErrorModal } from './model'

export function ErrorModalPortal() {
  const modalRoot = useRef<HTMLElement | null>(null)
  const modal = useUnit($errorModal)

  if (!modalRoot.current && typeof window !== 'undefined') {
    modalRoot.current = document.querySelector('#modal-root')
    if (modalRoot.current) {
      modalRoot.current.style.position = 'relative'
      modalRoot.current.style.zIndex = '500'
    }
  }

  if (!modalRoot.current) return null
  if (!modal) return null

  const { data } = modal

  return createPortal(
    <div data-theme={theme}>
      <ErrorModalLayout {...modal.options} closeModal={modal.options?.customCloseModal || closeErrorModal}>
        {data}
      </ErrorModalLayout>
    </div>,
    modalRoot.current
  )
}
