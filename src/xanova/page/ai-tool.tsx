import { ProtectedRoute } from 'components'

import { MainXanova } from '../main-xanova'
import { AiToolXanova } from 'xanova/features/ai-tool-xanova'

export function AiToolPageXanova() {
  return (
    <ProtectedRoute
      type='user'
      element={
        <MainXanova>
          <AiToolXanova />
        </MainXanova>
      }
    />
  )
}
