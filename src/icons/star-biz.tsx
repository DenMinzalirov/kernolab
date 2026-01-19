/* eslint-disable max-len */
import { SVGProps } from 'react'

export function StarBizIcon({ fill = 'none', stroke = '#989898', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={20} height={21} {...props}>
      <path
        fill={fill}
        stroke={stroke}
        strokeOpacity={0.5}
        strokeWidth={0.487}
        d='m10.762 3.633 1.017 3.13c.172.531.667.89 1.225.89h3.292c.775 0 1.098.993.47 1.45l-2.662 1.934c-.452.328-.641.91-.469 1.44l1.018 3.13c.24.739-.605 1.352-1.233.896l-2.663-1.934a1.288 1.288 0 0 0-1.514 0L6.58 16.503c-.628.456-1.472-.157-1.233-.895l1.018-3.13a1.288 1.288 0 0 0-.468-1.441L3.234 9.102c-.628-.456-.305-1.448.47-1.448h3.292c.558 0 1.053-.36 1.225-.89l1.017-3.131c.24-.738 1.284-.738 1.524 0Z'
      />
    </svg>
  )
}
