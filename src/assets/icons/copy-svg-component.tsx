/* eslint-disable max-len */
import * as React from 'react'
import { useUnit } from 'effector-react'

import { $isMobile } from 'model'

type Props = {
  fill: string
}

const SvgComponent: React.FC<Props> = ({ fill }) => {
  // const isMobileScreens = useUnit($isMobile)
  // if (isMobileScreens) {
  //   return (
  //     <svg width='13' height='14' viewBox='0 0 13 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
  //       <path
  //         d='M9.00102 7.43502V10.1353C9.00102 12.3856 8.10092 13.2857 5.85066 13.2857H3.15036C0.900102 13.2857 0 12.3856 0 10.1353V7.43502C0 5.18477 0.900102 4.28467 3.15036 4.28467H5.85066C8.10092 4.28467 9.00102 5.18477 9.00102 7.43502Z'
  //         fill={fill || '#9C88FD'}
  //       />
  //       <path
  //         opacity='0.4'
  //         d='M9.71144 0.428589H7.01113C4.793 0.428589 3.8929 1.3094 3.86719 3.48251H5.85386C8.55417 3.48251 9.80788 4.73622 9.80788 7.43653V9.42318C11.981 9.39746 12.8618 8.49736 12.8618 6.27925V3.57895C12.8618 1.32869 11.9617 0.428589 9.71144 0.428589Z'
  //         fill={fill || '#9C88FD'}
  //       />
  //     </svg>
  //   )
  // }
  return (
    <svg width='20' height='21' viewBox='0 0 20 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M13.6014 11.3421V15.1226C13.6014 18.2729 12.3413 19.5331 9.19093 19.5331H5.4105C2.26014 19.5331 1 18.2729 1 15.1226V11.3421C1 8.19178 2.26014 6.93164 5.4105 6.93164H9.19093C12.3413 6.93164 13.6014 8.19178 13.6014 11.3421Z'
        fill={fill || '#1A1A1A'}
      />
      <path
        opacity='0.4'
        d='M14.5882 1.5332H10.8078C7.70239 1.5332 6.44225 2.76634 6.40625 5.80869H9.18759C12.968 5.80869 14.7232 7.56389 14.7232 11.3443V14.1256C17.7656 14.0896 18.9987 12.8295 18.9987 9.72413V5.9437C18.9987 2.79335 17.7386 1.5332 14.5882 1.5332Z'
        fill={fill || '#1A1A1A'}
      />
    </svg>
  )
}

export default SvgComponent
