import styled from '@emotion/styled'

import type { RootStylesType } from '../types'

type StyledMenuPrefixProps = RootStylesType

const StyledMenuPrefix = styled.span<StyledMenuPrefixProps>`
  margin-inline-end: 5px;
  display: flex;
  ${({ rootStyles }) => rootStyles};
`

export default StyledMenuPrefix
