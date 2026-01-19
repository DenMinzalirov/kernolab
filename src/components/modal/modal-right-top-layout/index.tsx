import React, { useCallback, useEffect } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { modalWasClosedByUserEv } from 'components/modal/model'

import { Modal } from '../index'
import { ModalLayoutProps } from '../types'
import styles from './styles.module.scss'

export const ModalRightTopLayout = (props: ModalLayoutProps) => {
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
    <div className={styles.backdrop} onMouseDown={closeIfCurrentTarget}>
      <div
        className={clsx(
          styles.contentWrap,
          {
            [styles.paperTopFixed]: props.topFixed,
            [styles.noPadding]: props.noPadding,
            [styles.loader]: props.loader && isLoader,
            [styles.noClose]: props.noClose,
          },
          props.className,
          props.className ? styles[props.className] : ''
        )}
        style={{ maxWidth: props.maxWidth }}
      >
        {!props.noClose && (
          <button data-qa='modalCloseButton' className={clsx(styles.closeButton)} onClick={handleClose}></button>
        )}
        {props.children}
      </div>
    </div>
  )
}
