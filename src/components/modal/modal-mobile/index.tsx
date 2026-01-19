import { useUnit } from 'effector-react'

import { Modal } from 'components/modal'
import { ModalLayoutProps } from 'components/modal/types'
import { BackArrowIcon } from 'icons/back-arrow'
import { $isMobileNavOpen, setIsMobileNavOpenEV } from 'model'
import menu from 'assets/icons/menu.svg'

import styles from './styles.module.scss'

export function ModalMobileFullscreenLayout(props: ModalLayoutProps) {
  const isMobileNavOpen = useUnit($isMobileNavOpen)

  return (
    <div className={styles.modalMobileContainer}>
      <div className={styles.headerTitle}>
        <div style={{ height: 30 }} onClick={() => Modal.close()}>
          <BackArrowIcon fill='var(--mainBlue)' />
        </div>
        <div>{props.title ?? 'Back'}</div>
        <div onClick={() => setIsMobileNavOpenEV(!isMobileNavOpen)}>
          <img src={menu} alt='' />
        </div>
      </div>
      <div className={styles.contentContainerWrap}>
        <div className={styles.contentContainer}>{props.children}</div>
      </div>
    </div>
  )
}
