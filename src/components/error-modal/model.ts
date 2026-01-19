import { ReactNode } from 'react'
import { createEvent, createStore, restore } from 'effector'

import { ModalOptions } from './types'

export interface ModalErrorData {
  data: ReactNode
  options?: ModalOptions
}

const createErrorModal = createEvent<ModalErrorData>()
export const $errorModal = restore(createErrorModal, null)
export const openErrorModal = (data: ReactNode, options?: ModalOptions) => {
  createErrorModal({ options, data })
}

export const closeErrorModal = createEvent()
$errorModal.reset(closeErrorModal)
