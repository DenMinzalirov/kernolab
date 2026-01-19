/* eslint-disable max-len */
import { SVGProps } from 'react'

export function SupportIcon({ fill = '#fff', stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 20 20' {...props}>
      <g fill={fill} clipPath='url(#clip0_877_100)'>
        <path
          d='M14.34 0H5.67C2.28 0 0 2.38 0 5.92v8.17C0 17.62 2.28 20 5.67 20h8.67c3.39 0 5.66-2.38 5.66-5.91V5.92C20 2.38 17.73 0 14.34 0z'
          opacity='0.4'
        />
        <path d='M10.012 4.031A6 6 0 004 10.025a6.325 6.325 0 00.81 2.991.626.626 0 01.042.54l-.4 1.342a.374.374 0 00.492.468l1.212-.36a1.022 1.022 0 01.895.216 5.989 5.989 0 102.961-11.19z' />
      </g>
      <defs>
        <clipPath id='clip0_877_100'>
          <path fill='#fff' d='M0 0H20V20H0z' />
        </clipPath>
      </defs>
    </svg>
  )
}
