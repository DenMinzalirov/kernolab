import { OperationType } from '../../features/modals/withdraw-banking/fiat'
import styles from './styles.module.scss'

type Props = {
  buttons: OperationType[]
  action: (arg: OperationType) => void
  isDisabled?: boolean
}

export function SwitchGroupButton({ buttons, action, isDisabled }: Props) {
  return (
    <div className={styles.container}>
      {buttons.map(item => {
        return (
          <div
            key={item.name}
            onClick={() => {
              if (isDisabled) return
              action(item)
            }}
            className={styles.itemWrap}
            style={{
              ...{
                cursor: isDisabled ? 'auto' : 'pointer',
              },
              ...(item.isActive
                ? {
                    backgroundColor: 'var(--Deep-Space)',
                    margin: 2,
                    borderRadius: 8,
                    color: 'var(--White)',
                  }
                : {}),
            }}
          >
            {item.name}
          </div>
        )
      })}
    </div>
  )
}
