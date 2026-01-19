import { useEffect, useState } from 'react'

import appLandingLogoSvg from './pairs-redirect-logo.svg'
import styles from './styles.module.scss'

// TODO Pairs change ?
const androidLink = 'https://play.google.com/store/apps/details?id=ai.blockbank.bbexpoapp&pcampaignid=web_share'
const iosLink = 'https://apps.apple.com/app/fideum/id1592298073'

export function MobileAppLanding() {
  const [appLink, setAppLink] = useState<string>(androidLink)

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()

    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isMac = /macintosh|mac os x/.test(userAgent)

    if (isIOS || isMac) {
      setAppLink(iosLink)
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img src={appLandingLogoSvg} alt='Logo' />
      </div>

      <div className={styles.title}>Pairs</div>

      <div className={styles.subTitle}>
        Web Application is available only on desktop.
        <br />
        For better screen optimization, we suggest using the mobile app on your phone
      </div>

      <div className={styles.button}>
        <a href={appLink} className={styles.link}>
          Download Mobile App
        </a>
      </div>
    </div>
  )
}
