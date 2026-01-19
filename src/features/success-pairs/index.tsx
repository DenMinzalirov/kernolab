import { HeaderTitle } from 'components'
import { SuccessPairsComponent } from 'components/success-pairs-component'

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

export function SuccessPairs({
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
      <div className={styles.contentWrap}>
        <SuccessPairsComponent
          title={title}
          description={description}
          btnText={btnText}
          btnAction={btnAction}
          btnIconPosition={btnIconPosition}
        />
      </div>
    </div>
  )
}
