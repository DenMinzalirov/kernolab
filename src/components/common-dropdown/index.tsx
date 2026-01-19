import { ReactElement, useEffect, useState } from 'react'
import clsx from 'clsx'

import { TriangleIcon } from 'icons'
import { CloseCircleIcon } from 'assets/icons/close-circle-icon'

import { isXanova } from '../../config'
import stylesOrig from './styles-orig.module.scss'
import stylesXanova from './styles-xanova.module.scss'

export interface CommonDropDown {
  data: Array<any>
  setSelectedData?: React.Dispatch<any>
  selectedData: any
  itemComponent: (arg0: any) => ReactElement
  isClearButton?: boolean
  showDropdownForSingleItem?: boolean
  isDisabled?: boolean
}

export function CommonDropdown({
  data,
  itemComponent,
  setSelectedData,
  selectedData,
  isClearButton = false,
  showDropdownForSingleItem = false,
  isDisabled = false,
}: CommonDropDown) {
  const styles = isXanova ? stylesXanova : stylesOrig
  const [isShowContent, setIsShowContent] = useState(false)

  const hideContent = () => {
    setIsShowContent(false)
  }

  useEffect(() => {
    document.addEventListener('click', hideContent)

    return () => {
      document.removeEventListener('click', hideContent)
    }
  }, [isShowContent])

  const clearSelect = () => {
    setSelectedData && setSelectedData('')
    setIsShowContent(false)
  }

  return (
    <>
      <div
        className={styles.networksDropdownMain}
        style={isShowContent ? { borderColor: 'var(--Deep-Space)' } : {}} // height: 62 ??
        onClick={e => {
          if (data.length > (showDropdownForSingleItem ? 0 : 1)) {
            if (isDisabled) return
            e.stopPropagation()
            setIsShowContent(!isShowContent)
          }
        }}
      >
        <div className={styles.dropDownSelectedText}>{itemComponent(selectedData)}</div>
        {data.length > (showDropdownForSingleItem ? 0 : 1) ? (
          <>
            {selectedData && isClearButton ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 20,
                  height: 20,
                  marginLeft: 5,
                  marginRight: 10,
                }}
                onClick={e => {
                  e.stopPropagation()
                  clearSelect()
                }}
              >
                <div style={{ width: 15, height: 13 }}>
                  <CloseCircleIcon fill='var(--Deep-Space)' />
                </div>
              </div>
            ) : null}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 20,
                width: 20,
                marginRight: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 15,
                  width: 13,
                  transform: `rotate(${isShowContent ? '+90' : '-90'}deg)`,
                }}
              >
                <TriangleIcon fill='var(--Deep-Space)' />
              </div>
            </div>
          </>
        ) : null}
      </div>
      {isShowContent && (
        <div className={styles.networksDropdownContainer}>
          {data.map((item, index) => {
            // TODO: refactor
            const isClearScreen = item?.assetName === 'clear'
            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                onClick={() => {
                  if (setSelectedData) {
                    setSelectedData(item)
                  }
                  setIsShowContent(false)
                }}
                className={clsx(styles.dropDownSelectedText, styles.networksDropdownItem)}
                style={isClearScreen ? { height: 'auto' } : {}}
              >
                {itemComponent(item)}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
