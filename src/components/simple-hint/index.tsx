import { useState } from 'react'

import infoIcon from 'assets/icons/info-icon.svg'

import styles from './styles.module.scss'

export function SimpleHint({ text, icon, width = '150' }: { text: string; icon?: any; width?: string }) {
  const [isShowHint, setIsShowHint] = useState(false)
  return (
    <div
      onMouseLeave={() => setIsShowHint(false)}
      onMouseEnter={() => setIsShowHint(true)}
      style={{ position: 'relative', cursor: 'pointer', display: 'flex' }}
    >
      <img src={icon || infoIcon} alt={''} />
      {isShowHint ? (
        <div
          className={styles.hint}
          style={{
            // ...(icon
            //   ? {
            //       width: 55,
            //       left: -27,
            //       top: '40%',
            //       textAlign: 'center',
            //       wordWrap: 'break-word',
            //     }
            //   : {}),
            ...(icon
              ? {
                  width: 20,
                  top: 20,
                  textAlign: 'center',
                  wordWrap: 'break-word',
                }
              : {}),
            ...(width ? { width } : {}),
          }}
        >
          <div>{text}</div>
        </div>
      ) : null}
    </div>
  )
}
