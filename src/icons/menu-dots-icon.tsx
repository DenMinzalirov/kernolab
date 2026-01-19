/* eslint-disable max-len */
import { SVGProps } from 'react'

export function MenuDotsIcon({ fill = '#1F1D3A' }: SVGProps<SVGSVGElement>) {
  return (
    <svg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='8' cy='3' r='1' fill={fill} />
      <circle cx='8' cy='7' r='1' fill={fill} />
      <circle cx='8' cy='11' r='1' fill={fill} />
    </svg>
  )
}
