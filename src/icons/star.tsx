/* eslint-disable max-len */
import { SVGProps } from 'react'

export function StarIcon({ fill = '#fff', stroke = '#E1E1E1', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24' {...props}>
      <g clipPath='url(#clip0_1426_26008)'>
        <path
          fill={fill}
          stroke={stroke}
          d='M11.558 1.91a.5.5 0 01.884 0l2.554 4.84a1.5 1.5 0 001.071.778l5.393.933a.5.5 0 01.273.841l-3.814 3.925a1.5 1.5 0 00-.41 1.26l.78 5.416a.5.5 0 01-.716.52l-4.911-2.415a1.5 1.5 0 00-1.324 0l-4.911 2.415a.5.5 0 01-.716-.52l.78-5.417a1.5 1.5 0 00-.41-1.259L2.267 9.302a.5.5 0 01.273-.84l5.393-.934a1.5 1.5 0 001.07-.778l2.555-4.84z'
        />
      </g>
      <defs>
        <clipPath id='clip0_1426_26008'>
          <path fill={fill} d='M0 0H24V24H0z' />
        </clipPath>
      </defs>
    </svg>
  )
}
