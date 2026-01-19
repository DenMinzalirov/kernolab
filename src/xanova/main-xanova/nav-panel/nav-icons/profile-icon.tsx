/* eslint-disable max-len */
type ProfileIconProps = {
  className?: string
}

export function ProfileIcon({ className }: ProfileIconProps) {
  return (
    <svg
      className={className}
      width='21'
      height='21'
      viewBox='0 0 21 21'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clipPath='url(#profileIconClip)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M14.198 5.791c0 1.992-1.617 3.617-3.617 3.617l-.008-.008c-1.991 0-3.617-1.625-3.617-3.617 0-1.992 1.633-3.617 3.625-3.617 1.992 0 3.617 1.634 3.617 3.625Zm-1.25-.008c0-1.3-1.058-2.367-2.366-2.367-1.3 0-2.367 1.067-2.367 2.367 0 1.3 1.067 2.367 2.367 2.367.626-.002 1.227-.252 1.67-.696.443-.443.693-1.044.696-1.67Z'
          fill='currentColor'
        />
        <path
          d='M10.523 10.659c2.225 0 3.967.625 5.175 1.858v-.008c1.705 1.738 1.7 4.038 1.7 4.186v.005a.75.75 0 0 1-.626.622h-.008a.75.75 0 0 1-.636-.633c0-.041 0-1.941-1.35-3.307-.966-.975-2.408-1.475-4.274-1.475-1.867 0-3.309.5-4.276 1.475-1.35 1.375-1.35 3.292-1.35 3.308 0 .342-.275.633-.616.633-.3.017-.634-.267-.634-.608V16.7c-.001-.14-.007-2.45 1.7-4.189 1.208-1.233 2.95-1.858 5.175-1.858Z'
          fill='currentColor'
        />
      </g>
      <defs>
        <clipPath id='profileIconClip'>
          <rect width='20' height='20' fill='white' transform='translate(.5 .5)' />
        </clipPath>
      </defs>
    </svg>
  )
}
