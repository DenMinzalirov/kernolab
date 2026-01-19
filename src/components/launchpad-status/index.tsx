import React from 'react'

import styles from '../../features/launchpad/styles.module.scss'

type Props = {
  status: string
}

// 'COMING_SOON' | 'ACTIVE' | 'FULLY_RAISED' | ' FINISHED' | ' NOT_RAISED' | ' CANCELED'

const statusColors: Record<string, string> = {
  COMING_SOON: 'var(--Deep-Space)',
  ACTIVE: 'var(--P-System-Green)',
  FULLY_RAISED: 'var(--P-Label-Blue)',
  FINISHED: 'var(--P-Label-Blue)',
  NOT_RAISED: 'var(--P-Label-Blue)',
  CANCELED: 'var(--P-System-Red)',
}

const backGroundStatusColors: Record<string, string> = {
  COMING_SOON: 'var(--Deep-Space-10)',
  ACTIVE: 'var(--P-System-Green-10)',
  FULLY_RAISED: 'var(--P-Label-Blue-10)',
  FINISHED: 'var(--P-Label-Blue-10)',
  NOT_RAISED: 'var(--P-Label-Blue-10)',
  CANCELED: 'var(--P-System-Red-10)',
}

export function LaunchpadStatus({ status }: Props) {
  const showedStatus = status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
  const textColor = statusColors[status]
  const backgroundColor = backGroundStatusColors[status]

  return (
    <div
      style={{
        // marginLeft: 'auto',
        display: 'flex',
        alignSelf: 'self-start',
        alignItems: 'center',
        backgroundColor: backgroundColor || 'var(--Deep-Space-10)',
        padding: '3px 12px',
        borderRadius: 61,
        justifyContent: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: 7,
          backgroundColor: textColor || 'var(--P-System-Green)',
          marginRight: 8,
        }}
      />
      <div
        style={{
          color: textColor || 'var(--P-System-Green)',
          fontFamily: 'Mulish, sans-serif',
          fontSize: 12,
          fontWeight: 400,
          lineHeight: '160%',
        }}
      >
        {showedStatus}
      </div>
    </div>
  )
}
