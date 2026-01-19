/* eslint-disable max-len */
import { SVGProps } from 'react'

export function CloseIcon({ fill, stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg width={25} height={25} fill='none' {...props}>
      <path
        stroke={fill || 'var(--Deep-Space)'}
        strokeLinecap='round'
        strokeWidth={1.957}
        d='m18.826 6.326-12.5 12.5M18.678 18.823l-12.5-12.5'
      />
    </svg>
  )
}
