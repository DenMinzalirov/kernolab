import * as React from 'react'
import { SVGProps } from 'react'

export const MessageIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={56} height={56} fill='none' {...props}>
    <g filter='url(#a)'>
      <path
        fill='#00A848'
        d='M41.77.5H14.258C6.663.5.5 6.636.5 14.202v19.205c0 7.566 6.163 13.701 13.757 13.701h4.127c.743 0 1.733.495 2.201 1.1l4.127 5.476c1.816 2.421 4.788 2.421 6.603 0l4.128-5.475a2.789 2.789 0 0 1 2.2-1.1h4.128c7.593 0 13.757-6.136 13.757-13.703V14.203C55.528 6.636 49.364.5 41.77.5Z'
      />
    </g>
    <defs>
      <filter
        id='a'
        width={55.027}
        height={58.604}
        x={0.5}
        y={0.5}
        colorInterpolationFilters='sRGB'
        filterUnits='userSpaceOnUse'
      >
        <feFlood floodOpacity={0} result='BackgroundImageFix' />
        <feBlend in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
        <feColorMatrix in='SourceAlpha' result='hardAlpha' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' />
        <feOffset dy={3.604} />
        <feGaussianBlur stdDeviation={2.568} />
        <feComposite in2='hardAlpha' k2={-1} k3={1} operator='arithmetic' />
        <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.17 0' />
        <feBlend in2='shape' result='effect1_innerShadow_8016_5182' />
      </filter>
    </defs>
  </svg>
)
