import React, { useCallback, useEffect } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { modalWasClosedByUserEv } from 'components/modal/model'
import { CloseIcon } from 'icons/close'
import { isBiz, isXanova } from 'config'

import { Modal } from '../index'
import { ModalLayoutProps } from '../types'
import stylesBase from './styles.module.scss'
import stylesMobilePairs from './styles-mobile-pairs.module.scss'
import stylesXanova from './styles-xanova.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export const ModalCenterResponseLayout = (props: ModalLayoutProps) => {
  const modalLoader = useUnit(Modal.loader)
  const isLoader = props.loader && modalLoader
  const handleClose = useCallback(() => {
    modalWasClosedByUserEv()
    props.closeModal()
  }, [props.redirect, props.closeModal])

  const { isMobilePairs } = useCurrentBreakpointPairs()
  // centerMobileFix for only center mobile modal (not down)
  const styles = isXanova
    ? stylesXanova
    : isMobilePairs && !props.centerMobileFix && !isBiz
      ? stylesMobilePairs
      : stylesBase

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
          { [styles.contentWrapBizFix]: isBiz },
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
          <button
            data-qa='modalCloseButton'
            className={clsx(
              styles.close,
              isBiz && styles.closeButton,
              props.noPadding && styles.noPaddingClose,
              isXanova && styles.closeButton,
              props.noPadding && styles.noPaddingClose
            )}
            onClick={handleClose}
          >
            {isBiz || isXanova ? null : <CloseIcon />}
          </button>
        )}
        {props.children}
      </div>
    </div>
  )
}
