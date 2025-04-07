import styles from './Chip.module.css'
import { FC, MouseEvent, ReactNode, useState } from 'react'

type ChipProps = {
  label: string
  icon?: ReactNode
  removeIcon?: ReactNode
  selectedIcon?: ReactNode
  selectable?: boolean
  removable?: boolean,
  onRemove?: () => void,
  chipStyle?: 'outline' | 'solid'
  color?: string,
  borderColor?: string,
  iconColor?: string,
}

const defaultRemoveIcon = <svg className={ styles.removeIcon } role='img' aria-hidden='true' data-testid='remove-icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'><path d='M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z'/></svg>
const defaultSelectedIcon = <svg className={ styles.selectedIcon } role='img' aria-hidden='true' data-testid='selected-icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path d='M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z'/></svg>

const Chip: FC<ChipProps> = ({
  label,
  icon,
  removeIcon,
  selectedIcon,
  selectable=false,
  removable=false,
  onRemove,
  chipStyle='outline',
  color='#6C6C6C',
  borderColor,
  iconColor=''
}) => {
  if (selectable && removable)
    throw new Error(`Selectable: ${ selectable }, removable: ${removable}.
      Chip can be either selectable or removable, not both at the same`)

  const [selected, setSelected] = useState(false)

  const selectableIcon = selectable && (selectedIcon || defaultSelectedIcon)
  const leadingIcon = selected ? selectableIcon : icon
  const trailingIcon = removable && (removeIcon || defaultRemoveIcon)

  const toggleChip = (): void => {
    if (selectable)
      setSelected(!selected)
  }

  return (
    <div
      className={ styles.chip }
      style={{
        backgroundColor: chipStyle === 'solid' ? color : '',
        borderColor: borderColor || color,
        cursor: selectable ? 'pointer' : 'auto'
      }}
      data-testid='chip'
      onClick={ toggleChip }
      role={ selectable ? 'button' : ''}
      aria-selected={ selected }
    >
      { leadingIcon && <span className={styles.leadingIcon} style={{ color: iconColor }}>{ leadingIcon }</span> }
      <span className={styles.label}>{label}</span>
      { trailingIcon &&
        <span
          className={ styles.trailingIcon }
          onClick={ onRemove }
          role='button'
          aria-label='remove this option'
        >
          { trailingIcon }
        </span>
      }
    </div>
  )
}

export default Chip