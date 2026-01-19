import { HTMLAttributes } from 'react'

import { DangerIcon } from 'icons'

export interface ErrorRedBlock extends HTMLAttributes<HTMLDivElement> {
  requestError: string
}

export function ErrorRedBlock({ requestError, ...props }: ErrorRedBlock) {
  return (
    <div
      style={{
        height: 78,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        margin: '24px 0',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
      }}
      {...props}
    >
      <DangerIcon style={{ height: 24, margin: '0 24px' }} />
      <div style={{ marginRight: 24 }}>{requestError}</div>
    </div>
  )
}
