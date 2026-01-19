/* eslint-disable max-len */
import { SVGProps } from 'react'

export function UpDownIcon({ fill = '#1F1D3A', stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg width='7' height='13' viewBox='0 0 7 13' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M2.97411 0.949133C3.20788 0.544223 3.79232 0.544223 4.02609 0.949132L6.1788 4.67773C6.41257 5.08264 6.12035 5.58877 5.65281 5.58877H1.3474C0.879847 5.58877 0.587628 5.08264 0.821403 4.67773L2.97411 0.949133Z'
        fill={fill}
      />
      <path
        d='M2.97411 12.0509C3.20788 12.4558 3.79232 12.4558 4.02609 12.0509L6.1788 8.32227C6.41257 7.91736 6.12035 7.41123 5.65281 7.41123H1.3474C0.879847 7.41123 0.587628 7.91736 0.821403 8.32227L2.97411 12.0509Z'
        fill={fill}
      />
    </svg>
  )
}
