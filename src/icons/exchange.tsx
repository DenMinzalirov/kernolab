/* eslint-disable max-len */
import { SVGProps } from 'react'

export interface ExchangeIcon extends SVGProps<SVGSVGElement> {
  circleBg?: string
  arrowColor?: string
}

export function ExchangeIcon({ fill = '#AA9DE4', circleBg, arrowColor, ...props }: ExchangeIcon) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={41} height={41} fill='none' {...props}>
      <circle
        cx={20.5}
        cy={20.5}
        r={20.5}
        fill={circleBg ?? fill}
        fillOpacity={0.1}
        transform='rotate(-180 20.5 20.5)'
      />
      <path
        fill={arrowColor ?? fill}
        d='M15.383 11.713a.93.93 0 0 1 .665.276.946.946 0 0 1 0 1.33L9.1 20.264l6.947 6.947a.946.946 0 0 1 0 1.329.946.946 0 0 1-1.33 0l-7.61-7.611a.946.946 0 0 1 0-1.33l7.61-7.61a.93.93 0 0 1 .665-.277Z'
      />
      <path
        fill={arrowColor ?? fill}
        d='M7.983 19.325h21.104c.514 0 .94.427.94.94 0 .515-.426.941-.94.941H7.983a.947.947 0 0 1-.94-.94c0-.514.426-.94.94-.94Z'
      />
      <path
        fill={arrowColor ?? fill}
        d='M25.949 28.821a.93.93 0 0 1-.665-.276.946.946 0 0 1 0-1.329l6.947-6.947-6.947-6.946a.946.946 0 0 1 0-1.33.946.946 0 0 1 1.33 0l7.61 7.612a.946.946 0 0 1 0 1.329l-7.61 7.611a.93.93 0 0 1-.665.276Z'
      />
      <path
        fill={arrowColor ?? fill}
        d='M33.349 21.209H12.245a.947.947 0 0 1-.94-.94c0-.514.426-.94.94-.94H33.35c.514 0 .94.425.94.94 0 .514-.426.94-.94.94Z'
      />
    </svg>
  )
}
