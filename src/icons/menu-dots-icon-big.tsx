/* eslint-disable max-len */
import { SVGProps } from 'react'

export function MenuDotsIconBig({ fill = '#1F1D3A' }: SVGProps<SVGSVGElement>) {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='9.5' cy='3.5' r='1.5' fill={fill} />
      <circle cx='9.5' cy='9.5' r='1.5' fill={fill} />
      <circle cx='9.5' cy='15.5' r='1.5' fill={fill} />
    </svg>
  )
}
