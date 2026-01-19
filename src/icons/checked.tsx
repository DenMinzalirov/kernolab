/* eslint-disable max-len */
import { SVGProps } from 'react'

export function CheckedIcon({ fill = '#fff', stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg width='11' height='10' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M10.415 1.227a1 1 0 010 1.324L4.58 9.152a1 1 0 01-1.499 0L.586 6.33a1 1 0 010-1.325l.335-.38a1 1 0 011.498 0L3.83 6.223 8.58.848a1 1 0 011.5 0l.335.379z'
        fill={fill}
      />
    </svg>
  )
}
