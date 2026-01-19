/* eslint-disable max-len */
import { SVGProps } from 'react'

export function ArrowBottomLeft({ fill = '#1F1D3A' }: SVGProps<SVGSVGElement>) {
  return (
    <svg width='15' height='16' viewBox='0 0 15 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M11.2475 4.74749C11.3842 4.6108 11.3842 4.3892 11.2475 4.25251C11.1108 4.11583 10.8892 4.11583 10.7525 4.25251L11.2475 4.74749ZM3.65 11.5C3.65 11.6933 3.8067 11.85 4 11.85L7.15 11.85C7.3433 11.85 7.5 11.6933 7.5 11.5C7.5 11.3067 7.3433 11.15 7.15 11.15L4.35 11.15L4.35 8.35C4.35 8.1567 4.1933 8 4 8C3.8067 8 3.65 8.1567 3.65 8.35L3.65 11.5ZM10.7525 4.25251L3.75251 11.2525L4.24749 11.7475L11.2475 4.74749L10.7525 4.25251Z'
        fill={fill || '#1F1D3A'}
      />
    </svg>
  )
}
