import { ReactNode } from 'react'
import { createEvent, createStore, restore } from 'effector'

import { ModalOptions } from './types'

export interface ModalData {
  data: ReactNode
  options?: ModalOptions
}

const createModal = createEvent<ModalData>()
export const $modal = restore(createModal, null)
export const closeModal = createEvent()
export const modalWasClosedByUserEv = createEvent()
export const $isModalClosedByUser = createStore(false)
  .on(modalWasClosedByUserEv, () => true)
  .reset(createModal)

export const openModal = (data: ReactNode, options?: ModalOptions) => {
  createModal({ options, data })
}
export const setModalLoader = createEvent<boolean>()
export const $modalLoader = restore(setModalLoader, true)

$modal.reset(closeModal)

export const changeMobileModal = createEvent<boolean>()
export const $isMobileModal = restore(changeMobileModal, false)
