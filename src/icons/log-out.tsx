/* eslint-disable max-len */
import { SVGProps } from 'react'

export function LogoOutIcon({ fill = '#fff', stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 20 20' {...props}>
      <path
        fill={fill}
        d='M0 4.447A4.492 4.492 0 014.525 0h4.961A4.48 4.48 0 0114 4.437v11.116A4.492 4.492 0 019.474 20H4.515A4.48 4.48 0 010 15.563V4.447z'
        opacity='0.4'
      />
      <path
        fill={fill}
        d='M19.78 9.455l-2.846-2.909a.737.737 0 00-1.06 0 .785.785 0 000 1.09l1.558 1.592H7.55a.77.77 0 100 1.54h9.885l-1.559 1.595a.785.785 0 000 1.09.735.735 0 001.061 0l2.843-2.907a.784.784 0 000-1.09z'
      />
    </svg>
  )
}
