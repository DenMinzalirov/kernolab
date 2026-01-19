import { useUnit } from 'effector-react'

import { isXanova } from 'config'
import { $isMobile } from 'model'

import { ModalCenterResponseLayout } from './modal-center-response'
import { ModalDefaultLayout } from './modal-default'
import { ModalDownMobileLayout } from './modal-down-mobile-layout'
import { ModalMobileFullscreenLayout } from './modal-mobile'
import { ModalRightLayout } from './modal-right'
import { ModalRightTopLayout } from './modal-right-top-layout'
import { ModalRightLayoutXanova } from './modal-right-xanova'
import { ModalLayoutProps } from './types'

export const ModalLayout = (props: ModalLayoutProps) => {
  const isMobile = useUnit($isMobile)

  if (props.isFullScreen && isMobile) return <ModalMobileFullscreenLayout {...props} />
  if (props.variant === 'center') return <ModalCenterResponseLayout {...props} />
  if (props.variant === 'right')
    return isXanova ? <ModalRightLayoutXanova {...props} /> : <ModalRightLayout {...props} />
  if (props.variant === 'right-top') return <ModalRightTopLayout {...props} />
  if (props.variant === 'down-mobile') return <ModalDownMobileLayout {...props} />
  return <ModalDefaultLayout {...props} />
}
