import React, { HTMLAttributes } from 'react'
import clsx from 'clsx'

import successfullyBizIcon from '../../assets/icons/successfully-biz.svg'
import styles from './styles.module.scss'

export interface Success extends HTMLAttributes<HTMLDivElement> {
  textData: {
    title: string
    description: string
    btnText: string
  }
  action: () => void
}

export function SuccessfullyBiz({ textData, action, className, ...props }: Success) {
  return (
    <div className={clsx(styles.container, className)} {...props}>
      <img src={successfullyBizIcon} alt='' style={{ width: 117, height: 117 }} />
      <div style={{ textAlign: 'center' }}>
        <div className={styles.title}>{textData.title}</div>
        <div className={styles.description}>{textData.description}</div>
      </div>
      <button onClick={action} className='btn-biz blue big'>
        {textData.btnText}
      </button>
    </div>
  )
}
