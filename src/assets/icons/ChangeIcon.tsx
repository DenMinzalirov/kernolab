import * as React from 'react'

type Props = {
  fill: string
  width?: number
  height?: number
}

const SvgComponent: React.FC<Props> = ({ fill, width = 13, height = 13 }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} fill='none' viewBox='0 0 13 13'>
    <path
      stroke={fill || '#3D5CF5'}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeMiterlimit='10'
      d='M1.938 2.793h7.496c.9 0 1.625.726 1.625 1.625v1.798'
    />
    <path
      stroke={fill || '#3D5CF5'}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeMiterlimit='10'
      d='M3.65 1.082L1.937 2.794l1.711 1.711M11.06 10.205H3.561c-.899 0-1.624-.726-1.624-1.625V6.78'
    />
    <path
      stroke={fill || '#3D5CF5'}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeMiterlimit='10'
      d='M9.348 11.915l1.711-1.711-1.711-1.712'
    />
  </svg>
)
export default SvgComponent
