import { ProtectedRoute } from 'components'
import { Main } from 'features/main'
import Portfolio from 'features/portfolio'

export function PortfolioPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <Main>
          <Portfolio />
        </Main>
      }
    />
  )
}
