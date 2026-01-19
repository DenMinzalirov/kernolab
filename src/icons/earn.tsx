/* eslint-disable max-len */
import { SVGProps } from 'react'

export function EarnIcon({ fill = '#fff', stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 20 20' {...props}>
      <path
        fill={fill}
        d='M14.34 0H5.67C2.28 0 0 2.38 0 5.92v8.17C0 17.62 2.28 20 5.67 20h8.67c3.39 0 5.66-2.38 5.66-5.91V5.92C20 2.38 17.73 0 14.34 0z'
        opacity='0.4'
      />
      <path
        fill={fill}
        d='M10.873 13.384v-2.515l2.511.002a.876.876 0 10.004-1.752l-2.515-.001V6.6a.875.875 0 10-1.75 0V9.12l-2.511-.001a.876.876 0 00.001 1.752l2.51-.002v2.517a.875.875 0 101.75-.001z'
      />
    </svg>
  )
}
