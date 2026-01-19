/* eslint-disable max-len */
import { SVGProps } from 'react'

export interface CompleteIcon extends SVGProps<SVGSVGElement> {
  isMobile?: boolean
}

export function CompleteIcon({ fill = '#3D5CF5', isMobile, ...props }: CompleteIcon) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={isMobile ? '106' : '142'}
      height={isMobile ? '106' : '142'}
      viewBox='0 0 142 142'
      fill='none'
      {...props}
    >
      <circle cx='70.5' cy='70.5' r='64.5' fill={fill} />
      <path
        d='M70.7039 0C31.746 0 0 31.746 0 70.7039C0 109.662 31.746 141.408 70.7039 141.408C109.662 141.408 141.408 109.662 141.408 70.7039C141.408 31.746 109.662 0 70.7039 0ZM104.5 54.442L64.4112 94.5311C63.4214 95.5209 62.078 96.0865 60.6639 96.0865C59.2498 96.0865 57.9065 95.5209 56.9166 94.5311L36.9074 74.5219C34.857 72.4715 34.857 69.0777 36.9074 67.0273C38.9578 64.9768 42.3516 64.9768 44.402 67.0273L60.6639 83.2891L97.0057 46.9474C99.0561 44.897 102.45 44.897 104.5 46.9474C106.551 48.9978 106.551 52.3209 104.5 54.442Z'
        fill='white'
      />
    </svg>
  )
}
