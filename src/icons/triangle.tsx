/* eslint-disable max-len */
import { SVGProps } from 'react'

export function TriangleIcon({ fill = '#9C88FD', stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      preserveAspectRatio='none'
      xmlns='http://www.w3.org/2000/svg'
      width='100%'
      height='100%'
      fill='none'
      viewBox='0 0 13 13'
      {...props}
    >
      <path
        preserveAspectRatio='none'
        fill={fill}
        d='M1 8.232c-1.333-.77-1.333-2.694 0-3.464L7.75.871c1.333-.77 3 .192 3 1.732v7.794c0 1.54-1.667 2.502-3 1.732L1 8.232Z'
      />
    </svg>
  )
}
