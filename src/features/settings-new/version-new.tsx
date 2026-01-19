import packageJson from '../../../package.json'
import { SettingItemCardWrap } from './setting-item-card-wrap'
import styles from './styles.module.scss'

function Version() {
  return (
    <SettingItemCardWrap
      title={'Web App Version'}
      description={'You are currently using the latest version\nof our web based application.'}
    >
      <div className={styles.settingVersionAppText}>Version {packageJson.version}</div>
    </SettingItemCardWrap>
  )
}

export default Version
