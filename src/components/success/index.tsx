import { HTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CompleteIconBlur, Modal } from 'components'
import { CloseIcon } from 'icons'
import { $isMobile } from 'model'

import styles from './styles.module.scss'

export interface Success extends HTMLAttributes<HTMLDivElement> {
  text: string
}

export function Success({ text, className, ...props }: Success) {
  const isMobile = useUnit($isMobile)
  const navigate = useNavigate()

  return (
    <div className={clsx(styles.container, className)} {...props}>
      {/* <div className={styles.closeWrap} onClick={() => Modal.close()}>
        <CloseIcon className={styles.closeIcon} />
      </div> */}
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <CompleteIconBlur isMobile={isMobile} />
        <div className={styles.completedText}>{text}</div>
        {/*for mobile*/}
        <div className={styles.closeBtn}>
          <button onClick={() => navigate(-1)} className='btn-new primary'>
            Close and Return
          </button>
        </div>
      </div>
    </div>
  )
}
