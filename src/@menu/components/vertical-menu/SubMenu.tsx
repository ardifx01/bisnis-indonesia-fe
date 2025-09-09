/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { Children, cloneElement, forwardRef, useEffect, useId, useRef, useState } from 'react'
import type {
  AnchorHTMLAttributes,
  ForwardRefRenderFunction,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode
} from 'react'

import { usePathname } from 'next/navigation'

import classnames from 'classnames'
import styled from '@emotion/styled'
import type { CSSObject } from '@emotion/styled'

import type { OpenSubmenu } from './Menu'
import type { MenuItemProps } from './MenuItem'
import type { ChildrenType, RootStylesType, SubMenuItemElement } from '../../types'
import SubMenuContent from './SubMenuContent'
import MenuButton, { menuButtonStyles } from './MenuButton'
import ChevronRight from '../../svg/ChevronRight'
import useVerticalNav from '../../hooks/useVerticalNav'
import useVerticalMenu from '../../hooks/useVerticalMenu'
import { menuClasses } from '../../utils/menuClasses'
import { confirmUrlInChildren, renderMenuIcon } from '../../utils/menuUtils'
import StyledMenuLabel from '../../styles/StyledMenuLabel'
import StyledMenuPrefix from '../../styles/StyledMenuPrefix'
import StyledVerticalNavExpandIcon, {
  StyledVerticalNavExpandIconWrapper
} from '../../styles/vertical/StyledVerticalNavExpandIcon'

export type SubMenuProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'prefix'> &
  RootStylesType &
  Partial<ChildrenType> & {
    label: ReactNode
    icon?: ReactElement
    prefix?: ReactNode
    defaultOpen?: boolean
    disabled?: boolean
    contentClassName?: string
    onOpenChange?: (open: boolean) => void

    level?: number
  }

type StyledSubMenuProps = Pick<SubMenuProps, 'rootStyles' | 'disabled'> & {
  level: number
  active?: boolean
  menuItemStyles?: CSSObject
  buttonStyles?: CSSObject
}

const StyledSubMenu = styled.li<StyledSubMenuProps>`
  position: relative;
  inline-size: 100%;
  margin-block-start: 4px;

  &.${menuClasses.open} > .${menuClasses.button} {
    background-color: #f3f3f3;
  }

  ${({ menuItemStyles }) => menuItemStyles};
  ${({ rootStyles }) => rootStyles};

  > .${menuClasses.button} {
    ${({ level, disabled, active, children }) =>
      menuButtonStyles({
        level,
        active,
        disabled,
        children
      })};
    ${({ buttonStyles }) => buttonStyles};
  }
`

const SubMenu: ForwardRefRenderFunction<HTMLLIElement, SubMenuProps> = (props, ref) => {
  const {
    children,
    className,
    contentClassName,
    label,
    icon,
    title,
    prefix,
    defaultOpen,
    level = 0,
    disabled = false,
    rootStyles,
    onOpenChange,
    onClick,
    onKeyUp,
    ...rest
  } = props

  const [active, setActive] = useState<boolean>(false)

  const contentRef = useRef<HTMLDivElement>(null)

  const id = useId()
  const pathname = usePathname()
  const { isBreakpointReached } = useVerticalNav()

  const {
    renderExpandIcon,
    renderExpandedMenuItemIcon,
    menuItemStyles,
    openSubmenu,
    toggleOpenSubmenu,
    transitionDuration,
    openSubmenusRef,
    textTruncate
  } = useVerticalMenu()

  const childNodes = Children.toArray(children).filter(Boolean) as [ReactElement<SubMenuProps | MenuItemProps>]

  const isSubMenuOpen = openSubmenu?.some((item: OpenSubmenu) => item.id === id) ?? false

  const handleSlideToggle = (): void => {
    toggleOpenSubmenu?.({ level, label, active, id })
    onOpenChange?.(!isSubMenuOpen)
    if (openSubmenusRef?.current && openSubmenusRef?.current.length > 0) openSubmenusRef.current = []
  }

  const handleOnClick = (event: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
    onClick?.(event)
    handleSlideToggle()
  }

  const handleOnKeyUp = (event: KeyboardEvent<HTMLAnchorElement>) => {
    onKeyUp?.(event)

    if (event.key === 'Enter') {
      handleSlideToggle()
    }
  }

  const getSubMenuItemStyles = (element: SubMenuItemElement): CSSObject | undefined => {
    if (menuItemStyles) {
      const params = {
        level,
        disabled,
        active,
        isSubmenu: true,
        open: isSubMenuOpen
      }

      const styleFunction = menuItemStyles[element]

      if (styleFunction) {
        return typeof styleFunction === 'function' ? styleFunction(params) : styleFunction
      }
    }
  }

  useEffect(() => {
    if (confirmUrlInChildren(children, pathname)) {
      openSubmenusRef?.current.push({ level, label, active: true, id })
    } else {
      if (defaultOpen) {
        openSubmenusRef?.current.push({ level, label, active: false, id })
      }
    }
  }, [])

  useEffect(() => {
    if (confirmUrlInChildren(children, pathname)) {
      setActive(true)

      if (openSubmenusRef?.current.findIndex(submenu => submenu.id === id) === -1) {
        openSubmenusRef?.current.push({ level, label, active: true, id })
      }
    } else {
      setActive(false)
    }
  }, [pathname])

  const submenuContent = (
    <SubMenuContent
      ref={contentRef}
      transitionDuration={transitionDuration}
      open={isSubMenuOpen}
      level={level}
      className={classnames(menuClasses.subMenuContent, contentClassName)}
      rootStyles={{
        ...getSubMenuItemStyles('subMenuContent')
      }}
    >
      {childNodes.map(node =>
        cloneElement(node, {
          level: level + 1
        })
      )}
    </SubMenuContent>
  )

  return (
    <StyledSubMenu
      ref={ref}
      className={classnames(
        menuClasses.subMenuRoot,
        { [menuClasses.active]: active },
        { [menuClasses.disabled]: disabled },
        { [menuClasses.open]: isSubMenuOpen },
        className
      )}
      menuItemStyles={getSubMenuItemStyles('root')}
      level={level}
      disabled={disabled}
      active={active}
      buttonStyles={getSubMenuItemStyles('button')}
      rootStyles={rootStyles}
    >
      <MenuButton
        ref={null}
        onClick={handleOnClick}
        onKeyUp={handleOnKeyUp}
        title={title}
        className={classnames(menuClasses.button, { [menuClasses.active]: active })}
        tabIndex={disabled ? -1 : 0}
        {...rest}
      >
        {renderMenuIcon({
          icon,
          level,
          active,
          disabled,
          renderExpandedMenuItemIcon,
          styles: getSubMenuItemStyles('icon'),
          isBreakpointReached
        })}

        {prefix && (
          <StyledMenuPrefix className={menuClasses.prefix} rootStyles={getSubMenuItemStyles('prefix')}>
            {prefix}
          </StyledMenuPrefix>
        )}

        <StyledMenuLabel
          className={menuClasses.label}
          rootStyles={getSubMenuItemStyles('label')}
          textTruncate={textTruncate}
        >
          {label}
        </StyledMenuLabel>

        {
          <StyledVerticalNavExpandIconWrapper
            className={menuClasses.subMenuExpandIcon}
            rootStyles={getSubMenuItemStyles('subMenuExpandIcon')}
          >
            {renderExpandIcon ? (
              renderExpandIcon({
                level,
                disabled,
                active,
                open: isSubMenuOpen
              })
            ) : (
              <StyledVerticalNavExpandIcon open={isSubMenuOpen} transitionDuration={transitionDuration}>
                <ChevronRight fontSize='1rem' />
              </StyledVerticalNavExpandIcon>
            )}
          </StyledVerticalNavExpandIconWrapper>
        }
      </MenuButton>

      {submenuContent}
    </StyledSubMenu>
  )
}

export default forwardRef<HTMLLIElement, SubMenuProps>(SubMenu)
