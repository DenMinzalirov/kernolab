import { getAuthLogo, getFooterTitle, isFideumOTC, theme, themeValue } from 'config'
import bgBiz from 'assets/images/bg_biz.png'
import kaizenBg from 'assets/images/bg_kaizen.png'
import zekretBg from 'assets/images/zekretBg.png'

import { FideumAuthLogo } from '../../../assets/icons/fideumAuthLogo'
import { KaizenAuthLogo } from '../../../assets/icons/kaizenAuthLogo'
import { ZekretAuthLogo } from '../../../assets/icons/zekretAuthLogo'
import styles from './styles.module.scss'

type Props = {
  children: React.ReactNode
}

// const authBackground = theme === 'kaizen' ? 'inherit' : 'var(--mainBlue)'

export function AuthLayoutBiz({ children }: Props) {
  const footerTitle = getFooterTitle()
  const authLogoMobile = getAuthLogo()
  const backgroundImages = {
    [themeValue.kaizen]: `url(${kaizenBg})`,
    [themeValue.biz]: `url(${bgBiz})`,
    [themeValue.zekret]: `url(${zekretBg})`,
  }

  return (
    <div
      className={styles.main}
      style={{ backgroundImage: backgroundImages[theme], backgroundColor: isFideumOTC ? 'white' : 'inherit' }}
    >
      <div className={styles.logoWrap}>
        <div className={styles.logo}>{authLogoMobile}</div>
      </div>
      {children}
      <div className={styles.dynamicHeight}></div>

      <div className={styles.footer}>
        <div className={styles.footerText}>{footerTitle}</div>
      </div>
    </div>
  )
}
