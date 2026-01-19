import { useEffect } from 'react'

import { Modal } from 'components/modal'
import { ModalLayoutProps } from 'components/modal/types'

import styles from './styles.module.scss'

export const ModalRightLayoutXanova = (props: ModalLayoutProps) => {
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.removeProperty('overflow')
    }
  }, [])

  useEffect(() => {
    if (!props.delayClose) return
    const timerClose = setTimeout(close, props.delayClose)
    return () => {
      clearTimeout(timerClose)
    }
  }, [props.delayClose])

  useEffect(() => {
    const onEscClose = ({ key }: KeyboardEvent) => key === 'Escape' && props.closeModal()
    typeof document !== 'undefined' && document.addEventListener('keydown', onEscClose)
    return () => document?.removeEventListener('keydown', onEscClose)
  }, [])

  const handleClose = () => {
    props.closeModal ? props.closeModal() : Modal.close()
  }

  return (
    <div onClick={() => Modal.close()} className={styles.backdrop}>
      <div className={styles.contentWrap} onClick={event => event.stopPropagation()}>
        <div className={styles.line} />
        <div className={styles.closeButton} onClick={handleClose}></div>
        {props.children}
      </div>
    </div>
  )
}
