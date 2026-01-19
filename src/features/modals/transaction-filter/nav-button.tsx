import clsx from 'clsx'

import { isBiz } from 'config'

import stylesFideum from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'

type Props = {
  value: string
  action: () => void
  icon?: string
  iconLocation?: 'left' | 'right'
  isActive?: boolean
}

export const NavButton = ({ value, action, icon, iconLocation = 'left', isActive }: Props) => {
  const styles = isBiz ? stylesBiz : stylesFideum

  return (
    <div className={clsx(styles.navButton, isActive ? styles.navButtonActive : '')} onClick={action}>
      {icon && iconLocation === 'left' ? <img className={styles.listIcon} alt='icon' src={icon} /> : null}
      <div className={clsx(styles.navButtonTitle, isActive ? styles.navButtonTitleActive : '')}>{value}</div>
      {icon && iconLocation === 'right' ? <img className={styles.listIcon} alt='icon' src={icon} /> : null}
    </div>
  )
}
