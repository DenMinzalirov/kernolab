/* eslint-disable max-len */
import { SVGProps } from 'react'

export function CardIcon({ fill = '#fff', stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 20 20' {...props}>
      <path
        fill={fill || '#fff'}
        fillOpacity={0.4}
        fillRule='evenodd'
        d='M0 5.5a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v5a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5v-5ZM3 11a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8A.5.5 0 0 1 3 11Zm1-6.5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H4Z'
        clipRule='evenodd'
      />
    </svg>
  )
}
