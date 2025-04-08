import styles from './Option.module.css'
import { FC, MouseEvent } from 'react'

export type OptionType = {
  name: string
  value: string
  group?: string
}

type OptionProps = {
  option: OptionType
  focused?: boolean,
  selected?: boolean,
  onClicked?: (e: MouseEvent) => void,
  onPressed?: (e: MouseEvent) => void,
  onHover?: (e: MouseEvent) => void,
}

const defaultSelectedIcon = <svg className={ styles.selectedIcon } role='img' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>

const Option: FC<OptionProps> = ({ option, focused=false, selected=false, onClicked, onPressed, onHover }) => {

  return (
    <div
      id={ `select__option-${option.value}` }
      key={ option.value }
      role='option'
      className={ `${styles.option} ${focused ? styles.optionFocused : ''}` }
      tabIndex={ 0 }
      onClick={ onClicked }
      onMouseDown={ onPressed }
      onMouseEnter={ onHover }
      aria-selected={ selected }
    >
      <div className={ styles.optionLabel }>
        { option.name }
        { selected &&
          <span className={ styles.optionIconContainer } data-testid='selected-mark'>
            { defaultSelectedIcon }
          </span>
        }
      </div>
    </div>
  )
}

export default Option