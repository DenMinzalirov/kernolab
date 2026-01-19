import { CompleteIconBlur, HeaderTitle, Modal } from 'components'
import backArrow from 'assets/icons/back-arrow.svg'

import styles from './styles.module.scss'

type Props = {
  title: string
  description: string
  headerTitle: string
  btnText: string
  btnAction: () => void
  backBtnTitle?: string
  btnIconPosition?: 'left' | 'right' | 'none'
}

export function SuccessChangeSettingsComponent({
  title,
  description,
  headerTitle,
  btnText,
  btnAction,
  backBtnTitle,
  btnIconPosition = 'left',
}: Props) {
  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={headerTitle} showBackBtn backBtnTitle={backBtnTitle || 'Settings'} />
      <div className={styles.contentWrap} style={{ flexDirection: 'column' }}>
        <div className={styles.isSuccessIconWrap}>
          <CompleteIconBlur isMobile={false} />
        </div>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>

        <div style={{ height: 56 }} />

        <button onClick={btnAction} className='btn-new transparent big' style={{ maxWidth: 440 }}>
          {btnIconPosition === 'left' && <img alt='icon' src={backArrow} className={styles.btnIconLeft} />}
          {btnText}
          {btnIconPosition === 'right' && <img alt='icon' src={backArrow} className={styles.btnIconRight} />}
        </button>
      </div>
    </div>
  )
}
