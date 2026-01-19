import { Navigate } from 'react-router-dom'

import { ProtectedRoute } from 'components'
import { pages } from 'constant'
import { getToken, parseJwt } from 'utils'

import { MembershipXanova } from 'xanova/auth/membership'

export function MembershipPageXanova() {
  const token = getToken()
  const parsedToken = parseJwt(token)
  const scope = parsedToken?.scope

  if (scope && scope.includes('MEMBER')) {
    return <Navigate to={pages.Base.path} replace />
  }

  return <ProtectedRoute type='user' element={<MembershipXanova />} />
}
