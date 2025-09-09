'use client'

import classnames from 'classnames'
import type { CSSObject } from '@emotion/styled'

import type { ChildrenType } from '@core/types'

import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

import StyledFooter from '@layouts/styles/vertical/StyledFooter'

type Props = ChildrenType & {
  overrideStyles?: CSSObject
}

const Footer = (props: Props) => {
  const { children, overrideStyles } = props

  return (
    <StyledFooter
      overrideStyles={overrideStyles}
      className={classnames(
        verticalLayoutClasses.footer,
        verticalLayoutClasses.footerContentCompact,
        verticalLayoutClasses.footerStatic,
        verticalLayoutClasses.footerDetached,
        'is-full'
      )}
    >
      <div className={verticalLayoutClasses.footerContentWrapper}>{children}</div>
    </StyledFooter>
  )
}

export default Footer
