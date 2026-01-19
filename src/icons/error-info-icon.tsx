import * as React from 'react'
import { SVGProps } from 'react'
export const ErrorInfoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={14} height={14} fill='none' {...props}>
    <g stroke='#F55C47' strokeWidth={0.996} clipPath='url(#a)' opacity={0.8}>
      <circle cx={7.176} cy={7.175} r={5.978} />
      <path strokeLinecap='round' d='M7.176 10.662V6.677M7.176 4.686v-.997' />
    </g>
    <defs>
      <clipPath id='a'>
        <path fill='#fff' d='M0 0h14v14H0z' />
      </clipPath>
    </defs>
  </svg>
)
