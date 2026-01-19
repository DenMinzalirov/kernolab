/* eslint-disable max-len */
import { SVGProps } from 'react'

export function PortfolioIcon({ fill = '#fff', stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 20 20' {...props}>
      <path
        fill={fill}
        d='M14.676 0H5.333C1.929 0 0 1.929 0 5.333v9.333C0 18.071 1.929 20 5.333 20h9.342C18.08 20 20 18.071 20 14.667V5.333C20 1.929 18.08 0 14.676 0z'
        opacity='0.4'
      />
      <path
        fill={fill}
        d='M5.37 7.367a.833.833 0 00-.827.836v6.871a.83.83 0 101.662 0v-6.87a.835.835 0 00-.835-.837zM10.036 4.09a.833.833 0 00-.827.836v10.15a.83.83 0 101.662 0V4.927a.836.836 0 00-.835-.836zM14.64 10.996a.835.835 0 00-.835.836v3.244a.83.83 0 101.662 0v-3.244a.833.833 0 00-.826-.836z'
      />
    </svg>
  )
}
