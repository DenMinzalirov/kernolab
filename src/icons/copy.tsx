/* eslint-disable max-len */
import { SVGProps } from 'react'

export interface CopyIcon extends SVGProps<SVGSVGElement> {
  isMobile: boolean
}

export function CopyIcon({ fill = '#9C88FD', isMobile, ...props }: CopyIcon) {
  return isMobile ? (
    <svg width='13' height='14' viewBox='0 0 13 14' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M9.00102 7.43502V10.1353C9.00102 12.3856 8.10092 13.2857 5.85066 13.2857H3.15036C0.900102 13.2857 0 12.3856 0 10.1353V7.43502C0 5.18477 0.900102 4.28467 3.15036 4.28467H5.85066C8.10092 4.28467 9.00102 5.18477 9.00102 7.43502Z'
        fill={fill}
      />
      <path
        opacity='0.4'
        d='M9.71144 0.428589H7.01113C4.793 0.428589 3.8929 1.3094 3.86719 3.48251H5.85386C8.55417 3.48251 9.80788 4.73622 9.80788 7.43653V9.42318C11.981 9.39746 12.8618 8.49736 12.8618 6.27925V3.57895C12.8618 1.32869 11.9617 0.428589 9.71144 0.428589Z'
        fill={fill}
      />
    </svg>
  ) : (
    <svg xmlns='http://www.w3.org/2000/svg' width={24} height={23} fill='none' {...props}>
      <path
        fill={fill}
        d='M16.317 12.861v4.68c0 3.898-1.56 5.458-5.459 5.458H6.18c-3.9 0-5.46-1.56-5.46-5.459v-4.679c0-3.899 1.56-5.459 5.46-5.459h4.678c3.9 0 5.46 1.56 5.46 5.46Z'
      />
      <path
        fill={fill}
        d='M17.543.719h-4.68C9.02.719 7.462 2.245 7.417 6.01h3.442c4.68 0 6.852 2.173 6.852 6.852v3.442C21.475 16.26 23 14.7 23 10.857v-4.68c0-3.899-1.56-5.458-5.458-5.458Z'
        opacity={0.4}
      />
    </svg>
  )
}
