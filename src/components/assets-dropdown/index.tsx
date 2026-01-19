import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import { TriangleIcon } from 'icons'
import { isBiz } from 'config'

import stylesPairs from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'

export interface AssetsDropdown {
  assets: any
  selectedData: any
  setSelectedData: React.Dispatch<any>
}

export function AssetsDropdown({ assets, selectedData, setSelectedData }: AssetsDropdown) {
  const styles = isBiz ? stylesBiz : stylesPairs

  const [shouldShowContent, setShouldShowContent] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShouldShowContent(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div
        className={clsx(styles.networksDropdownMain, shouldShowContent && styles.networksDropdownMainActive)}
        onClick={() => setShouldShowContent(prev => !prev)}
      >
        <div className={styles.dropDownSelectedTextWrap}>
          <img className={clsx(styles.assetIcon, 'asset-icon')} src={selectedData.icon} alt='' />
          {selectedData?.assetName}
        </div>
        <div
          className={styles.networksDropdownTriangle}
          style={shouldShowContent ? { transform: 'rotate(+90deg)' } : {}}
        >
          <TriangleIcon fill='var(--Deep-Space)' />
        </div>
      </div>
      {shouldShowContent && (
        <div className={clsx(styles.networksDropdownContainer, styles.networksDropdownContainerTrade)}>
          {assets
            .filter((asset: any) => !asset.isFiat)
            .map((asset: any) => {
              return (
                <div
                  key={asset.assetId}
                  onClick={() => {
                    setSelectedData(asset)
                    setShouldShowContent(false)
                  }}
                  className={styles.networksDropdownItem}
                >
                  <img className={clsx(styles.dropdownItemAssetIcon, 'asset-icon')} src={asset.icon} alt='' />
                  {asset?.assetName}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
