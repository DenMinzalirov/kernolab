/* eslint-disable max-len */
import { SVGProps } from 'react'

export interface DepositIcon extends SVGProps<SVGSVGElement> {
  circleBg?: string
  arrowColor?: string
}

export function DepositIcon({ fill = '#34C759', circleBg, arrowColor, ...props }: DepositIcon) {
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
        d='M12.59 16.146a.93.93 0 0 1 .664-.275c.514 0 .94.426.94.94v9.824h9.824c.514 0 .94.426.94.94 0 .515-.425.94-.94.94H13.254a.946.946 0 0 1-.94-.94V16.811a.93.93 0 0 1 .275-.665Z'
      />
      <path
        fill={arrowColor ?? fill}
        d='M12.739 26.757 27.66 11.834a.947.947 0 0 1 1.33 0 .947.947 0 0 1 0 1.33L14.07 28.087a.947.947 0 0 1-1.33 0 .947.947 0 0 1 0-1.33Z'
      />
    </svg>
  )
}
