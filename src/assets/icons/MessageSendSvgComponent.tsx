/* eslint-disable max-len */
import * as React from 'react'

type Props = {
  fill: string
}

const SvgComponent: React.FC<Props> = ({ fill }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={159} height={159} fill='none'>
    <circle cx={79.5} cy={79.5} r={79.5} fill='#9C88FD' fillOpacity={0.2} />
    <path
      fill={fill || '#9C88FD'}
      fillRule='evenodd'
      d='M79 150c39.212 0 71-31.788 71-71S118.212 8 79 8 8 39.788 8 79s31.788 71 71 71ZM63.269 52h30.538c8.428 0 15.269 6.81 15.269 15.208v21.315c0 8.398-6.841 15.208-15.269 15.208h-4.58c-.947 0-1.864.458-2.444 1.222l-4.58 6.077c-2.016 2.687-5.314 2.687-7.33 0l-4.58-6.077c-.52-.672-1.619-1.222-2.443-1.222h-4.581c-8.428 0-15.269-6.81-15.269-15.208V67.208C48 58.81 54.84 52 63.269 52Z'
      clipRule='evenodd'
    />
  </svg>
)
export default SvgComponent
