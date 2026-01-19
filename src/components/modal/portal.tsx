import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useUnit } from 'effector-react'

import { theme } from '../../config'
import { ModalLayout } from './modal-layout'
import { $isMobileModal, $modal, closeModal } from './model'
import { MobileLayout } from './o-mobile-layout'

function Modal() {
  const modal = useUnit($modal)

  if (!modal) return null
  if (modal.options?.onlyMobile) return null

  const { data } = modal

  return (
    <ModalLayout {...modal.options} closeModal={modal.options?.customCloseModal || closeModal}>
      {data}
    </ModalLayout>
  )
}

export function ModalPortal() {
  const modalRoot = useRef<HTMLElement | null>(null)
  const isMobileModal = useUnit($isMobileModal)
  const modal = useUnit($modal)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const delayCloseMs = modal?.options?.delayClose

    if (delayCloseMs) {
      timeout = setTimeout(() => {
        closeModal()
      }, delayCloseMs)
    }
    return () => {
      clearTimeout(timeout)
    }
  }, [modal])

  useEffect(() => {
    // самозакрывающаяся модалка при именении экрана до десктопа
    if (modal && modal.options?.onlyMobile && !isMobileModal) {
      modal.options?.customCloseModal ? modal.options.customCloseModal() : closeModal()
    }
    if (modal && modal.options?.onlyDesktop && isMobileModal) {
      modal.options?.customCloseModal ? modal.options.customCloseModal() : closeModal()
    }
  }, [isMobileModal, modal])

  if (modal && modal.options?.drawer && isMobileModal) return <MobileLayout />

  if (!modalRoot.current && typeof window !== 'undefined') {
    modalRoot.current = document.querySelector('#modal-root')
    if (modalRoot.current) {
      modalRoot.current.style.position = 'relative'
      modalRoot.current.style.zIndex = '500'
    }
  }
  if (!modalRoot.current) return null
  return createPortal(
    <div data-theme={theme}>
      <Modal />
    </div>,
    modalRoot.current
  )
}

export default ModalPortal
