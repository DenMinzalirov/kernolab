import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { pages } from 'constant'

export function RedirectHome() {
  console.log('RedirectHome')
  const redirectPath = pages.SignIn.path

  const navigate = useNavigate()

  useEffect(() => {
    navigate(redirectPath)
  }, [])

  return null
}
