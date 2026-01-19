import pairsBg from 'assets/images/bg_pairs.png'

import fideumOnboardingLogo from '../../../assets/icons/fideumOnboardingLogo.svg'
import kernolabLogo from '../../../assets/icons/Kernolab-logo-2021-black.svg'
import styles from './styles.module.scss'

type Props = {
  children: React.ReactNode
}

export function AuthLayout({ children }: Props) {
  return (
    <div className={styles.main}>
      <div className={styles.logoWrap}>
        <img width={502} src={kernolabLogo} alt='' />
      </div>
      {children}
    </div>
  )
}
