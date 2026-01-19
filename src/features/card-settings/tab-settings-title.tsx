import styles from './styles.module.scss'

type Props = {
  title: string
  description: string
}

export function TabSettingsTitle({ title, description }: Props) {
  return (
    <div className={styles.tabSettingsTitleWrap}>
      <div className={styles.tabSettingsTitle}>{title}</div>
      <div className={styles.tabSettingsDescription}>{description}</div>
    </div>
  )
}
