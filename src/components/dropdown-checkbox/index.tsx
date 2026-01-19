import clsx from 'clsx'

import { isBiz } from 'config'

import stylesFideum from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'

type Props = {
  checked: boolean
}

export const DropdownCheckbox = ({ checked }: Props) => {
  const styles = isBiz ? stylesBiz : stylesFideum

  return (
    <div className={styles.checkboxButton}>
      <div className={clsx({ [styles.checkboxButtonInner]: checked })} />
    </div>
  )
}
