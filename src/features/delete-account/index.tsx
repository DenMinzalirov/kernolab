import { HeaderTitle } from 'components'
import { theme, themeValue } from 'config'

export const helpUrl = (): string => {
  if (theme === themeValue.biz) {
    return 'https://forms.helpdesk.com/?licenseID=1962211529&contactFormID=5f0341cf-4b3b-47b1-889e-6eb89c5ed11a'
  }
  if (theme === themeValue.kaizen) {
    return 'https://forms.helpdesk.com/?licenseID=1962211529&contactFormID=a3243351-530e-4829-a7d8-d340cca7fd8f'
  }
  return 'https://forms.helpdesk.com?licenseID=1962211529&contactFormID=31bf8571-5432-4960-ae90-6dcbd00e07ba'
}

const DeleteAccount: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <div style={{ margin: '0 -15px' }}>
        <HeaderTitle headerTitle='Delete account' />
      </div>

      <iframe
        title='Support'
        sandbox='allow-scripts allow-popups allow-forms allow-same-origin'
        width='100%'
        height='100%'
        style={{ border: 0 }}
        src={helpUrl()}
      >
        Your browser does not allow embedded content.
      </iframe>
    </div>
  )
}

export default DeleteAccount
