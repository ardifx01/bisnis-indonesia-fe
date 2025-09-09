/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect } from 'react'
import type { HTMLAttributes } from 'react'

import classnames from 'classnames'
import type { CSSObject } from '@emotion/styled'

import type { BreakpointType } from '../../types'
import type { VerticalNavState } from '../../contexts/verticalNavContext'
import useMediaQuery from '../../hooks/useMediaQuery'
import useVerticalNav from '../../hooks/useVerticalNav'
import { verticalNavClasses } from '../../utils/menuClasses'
import StyledBackdrop from '../../styles/StyledBackdrop'
import StyledVerticalNav from '../../styles/vertical/StyledVerticalNav'
import StyledVerticalNavContainer from '../../styles/vertical/StyledVerticalNavContainer'
import StyledVerticalNavBgColorContainer from '../../styles/vertical/StyledVerticalNavBgColorContainer'

import { defaultBreakpoints, verticalNavToggleDuration } from '../../defaultConfigs'

export type VerticalNavProps = HTMLAttributes<HTMLHtmlElement> & {
  width?: VerticalNavState['width']
  breakpoint?: BreakpointType
  customBreakpoint?: string
  breakpoints?: Partial<typeof defaultBreakpoints>
  transitionDuration?: VerticalNavState['transitionDuration']
  backdropColor?: string
  customStyles?: CSSObject
}

const VerticalNav = (props: VerticalNavProps) => {
  const {
    width = 260,
    breakpoint = 'lg',
    customBreakpoint,
    breakpoints,
    transitionDuration = verticalNavToggleDuration,
    backdropColor,
    className,
    customStyles,
    children,
    ...rest
  } = props

  const mergedBreakpoints = { ...defaultBreakpoints, ...breakpoints }

  const {
    updateVerticalNavState,
    width: widthContext,
    isBreakpointReached: isBreakpointReachedContext,
    isToggled: isToggledContext,
    transitionDuration: transitionDurationContext
  } = useVerticalNav()

  const breakpointReached = useMediaQuery(customBreakpoint ?? (breakpoint ? mergedBreakpoints[breakpoint] : breakpoint))

  useEffect(() => {
    updateVerticalNavState({
      width,
      transitionDuration,
      isBreakpointReached: breakpointReached
    })

    if (!breakpointReached) {
      updateVerticalNavState({ isToggled: false })
    }
  }, [width, breakpointReached, updateVerticalNavState])

  const handleBackdropClick = () => {
    updateVerticalNavState({ isToggled: false })
  }

  return (
    <StyledVerticalNav
      width={width}
      isBreakpointReached={isBreakpointReachedContext}
      customStyles={customStyles}
      transitionDuration={transitionDurationContext}
      className={classnames(
        verticalNavClasses.root,
        {
          [verticalNavClasses.toggled]: isToggledContext,
          [verticalNavClasses.breakpointReached]: isBreakpointReachedContext
        },
        className
      )}
      {...rest}
    >
      <StyledVerticalNavContainer
        width={widthContext}
        className={verticalNavClasses.container}
        transitionDuration={transitionDurationContext}
      >
        <StyledVerticalNavBgColorContainer className={verticalNavClasses.bgColorContainer}>
          {children}
        </StyledVerticalNavBgColorContainer>
      </StyledVerticalNavContainer>

      {isToggledContext && breakpointReached && (
        <StyledBackdrop
          role='button'
          tabIndex={0}
          aria-label='backdrop'
          onClick={handleBackdropClick}
          onKeyPress={handleBackdropClick}
          className={verticalNavClasses.backdrop}
          backdropColor={backdropColor}
        />
      )}
    </StyledVerticalNav>
  )
}

export default VerticalNav
