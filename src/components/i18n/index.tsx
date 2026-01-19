import { memo } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import clsx from 'clsx'

// REFACTOR replace with i18n from ./localize

interface IProps extends WithTranslation {
  tKey: string
  onClick?: () => void
  classname?: string
  isHTMLContent?: boolean
}

const I18n: React.FC<IProps> = ({ isHTMLContent = false, tKey, onClick, classname, t }) => (
  <div>
    {!isHTMLContent ? (
      <span className={clsx(classname)} onClick={onClick}>
        {t(tKey)}
      </span>
    ) : (
      <div>---</div>
      // <div dangerouslySetInnerHTML={{__html: t(tKey)}} />
    )}
  </div>
)

export default withTranslation()(memo(I18n))
