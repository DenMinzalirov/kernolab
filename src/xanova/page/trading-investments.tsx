import { ProtectedRoute } from '../../components'
import { TradingInvestments } from '../features/trading-investments'
import { MainXanova } from '../main-xanova'

export function TradingInvestmentsPage() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <TradingInvestments />
        </MainXanova>
      }
    />
  )
}
