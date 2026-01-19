/* eslint-disable max-len */
type LogoutIconProps = {
  className?: string
}

export function LogoutIcon({ className }: LogoutIconProps) {
  return (
    <svg
      className={className}
      width='20'
      height='21'
      viewBox='0 0 20 21'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M11.2308 18.2046H6.94992C5.87337 18.2538 4.82073 17.8772 4.01975 17.1562C3.21877 16.4352 2.73385 15.4279 2.66992 14.3521V6.64877C2.73385 5.573 3.21877 4.56565 4.01975 3.84467C4.82073 3.12369 5.87337 2.74706 6.94992 2.79627H11.2299'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M17.3287 10.5H6.20117' stroke='currentColor' strokeMiterlimit='10' strokeLinecap='round' />
      <path
        d='M13.4023 14.7807L17.0723 11.1107C17.2332 10.9484 17.3234 10.7292 17.3234 10.5007C17.3234 10.2722 17.2332 10.053 17.0723 9.8907L13.4023 6.2207'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
