/* eslint-disable max-len */
import { SVGProps } from 'react'

export function BackArrowIcon({ fill = '#AA9DE4', stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={32} height={32} fill='none' {...props}>
      <circle cx={16} cy={16} r={16} fill='#fff' transform='rotate(180 16 16)' />
      <path stroke={fill} strokeLinecap='round' strokeWidth={2} d='m18.27 22-6.4-6.4M11.867 15.6l6.4-6.4' />
    </svg>
  )
}
