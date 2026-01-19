import { useCallback, useEffect } from 'react'
import clsx from 'clsx'

import { isBiz, isXanova } from 'config'

import stylesBiz from './styles.module.scss'
import stylesPairs from './styles-pairs.module.scss'
import stylesXanova from './styles-xanova.module.scss'
import { ErrorModalLayoutProps } from './types'

export const ErrorModalLayout = (props: ErrorModalLayoutProps) => {
  const styles = isBiz ? stylesBiz : isXanova ? stylesXanova : stylesPairs

  const handleClose = useCallback(() => {
    props.closeModal()
  }, [props.closeModal])

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

  return (
    <div className={styles.backdrop} onMouseDown={closeIfCurrentTarget}>
      <div className={clsx(styles.contentWrap, { [styles.contentWrapBizFix]: isBiz })}>
        <button
          data-qa='modalCloseButton'
          className={clsx(styles.close, isBiz && styles.closeButton)}
          onClick={handleClose}
        ></button>
        {props.children}
      </div>
    </div>
  )
}
