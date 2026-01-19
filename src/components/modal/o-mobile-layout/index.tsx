import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Drawer } from 'components/modal/drawer'
import { FocusTrap } from 'components/modal/focus-trap'
import { $modal, closeModal, modalWasClosedByUserEv } from 'components/modal/model'
import { CloseIcon } from 'icons'

import styles from './styles.module.scss'

export function MobileLayout() {
  const modal = useUnit($modal)

  if (!modal) return null
  if (modal.options?.onlyDesktop) return null

  const onClose = () => {
    modalWasClosedByUserEv()
    modal?.options?.customCloseModal ? modal.options.customCloseModal() : closeModal()
  }

  return (
    <FocusTrap>
      <Drawer anchor='bottom' onClose={onClose} open={Boolean(modal)} options={modal?.options}>
        {(modal?.options?.title || !modal?.options?.noClose) && (
          <div className={clsx(styles.heading, modal?.options?.title && styles.backgroundHeader)}>
            {modal?.options?.title && <div className={styles.title}>{modal.options.title}</div>}
            {!modal?.options?.noClose && (
              <button className={styles.close} onClick={onClose}>
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        <div className={styles.data}>{modal.data}</div>
      </Drawer>
    </FocusTrap>
  )
}
