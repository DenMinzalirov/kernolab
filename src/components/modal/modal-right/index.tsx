import React, { useCallback, useEffect } from 'react'
import { useUnit } from 'effector-react'

import { BackButton } from 'components'
import { Modal } from 'components/modal'
import { modalWasClosedByUserEv } from 'components/modal/model'
import { ModalLayoutProps } from 'components/modal/types'

import styles from './styles.module.scss'

export const ModalRightLayout = (props: ModalLayoutProps) => {
  const modalLoader = useUnit(Modal.loader)
  const isLoader = props.loader && modalLoader
  const handleClose = useCallback(() => {
    modalWasClosedByUserEv()
    props.closeModal()
  }, [props.redirect, props.closeModal])

  const closeIfCurrentTarget = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) handleClose()
    },
    [handleClose]
  )
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

  return (
    <div onClick={() => Modal.close()} className={styles.backdrop}>
      <div className={styles.contentWrap} onClick={event => event.stopPropagation()}>
        <BackButton backFn={Modal.close} />
        {props.children}
      </div>
    </div>
  )
}
