import { HeaderTitle } from 'components'
import { helpSupportUrl } from 'config'

const Support: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <div>
        <HeaderTitle headerTitle='Support' />
      </div>
      <iframe
        title='Support'
        sandbox='allow-scripts allow-popups allow-forms allow-same-origin'
        width='100%'
        height='100%'
        style={{ border: 0 }}
        src={helpSupportUrl()}
      >
        Your browser does not allow embedded content.
      </iframe>
    </div>
  )
}

export default Support
