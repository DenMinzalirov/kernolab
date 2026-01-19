import React from 'react'

import styles from './styles.module.scss'

type Props = {
  children: React.ReactNode
  title: string | React.ReactNode
  description: string | React.ReactNode
}

export function SettingItemCardWrap({ children, title, description }: Props) {
  const isDescriptionComponent = typeof description !== 'string'

  return (
    <div className={styles.settingItemCardWrap}>
      <div className={styles.settingItemCardTitleWrap}>
        <div className={styles.settingItemCardTitle}>{title}</div>
        <div className={styles.settingItemCardDescription} style={isDescriptionComponent ? { width: 'auto' } : {}}>
          {description}
        </div>
      </div>
      <div className={styles.settingItemCardWrapChild}>{children}</div>
    </div>
  )
}
