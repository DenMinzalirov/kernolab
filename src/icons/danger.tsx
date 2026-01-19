/* eslint-disable max-len */
import { SVGProps } from 'react'

export function DangerIcon({ fill = 'var(--P-System-Red)', stroke, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg width='24' height='22' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        opacity='.4'
        d='M3.268 21.901H3.22A3.4 3.4 0 01.25 17.232L9.035 1.84a3.376 3.376 0 011.32-1.315 3.4 3.4 0 014.615 1.326l8.728 15.273c.194.458.277.83.297 1.209a3.375 3.375 0 01-.87 2.45 3.37 3.37 0 01-2.347 1.116l-17.424.002h-.086z'
        fill={fill}
      />
      <path
        d='M12 14.973c.578 0 1.05.468 1.05 1.043 0 .592-.472 1.064-1.05 1.064a1.052 1.052 0 010-2.107zm0-7.493c.578 0 1.05.472 1.05 1.05v3.394a1.051 1.051 0 01-2.1 0V8.53c0-.578.47-1.05 1.05-1.05z'
        fill={fill}
      />
    </svg>
  )
}
