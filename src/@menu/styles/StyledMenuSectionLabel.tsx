import styled from '@emotion/styled'

import type { RootStylesType } from '../types'

type StyledMenuSectionLabelProps = RootStylesType & {
  textTruncate?: boolean
}

const StyledMenuSectionLabel = styled.span<StyledMenuSectionLabelProps>`
  ${({ textTruncate }) =>
    textTruncate &&
    `
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `};
  ${({ rootStyles }) => rootStyles};
`

export default StyledMenuSectionLabel
