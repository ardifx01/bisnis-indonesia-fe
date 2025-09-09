'use client'

import type { CSSProperties } from 'react'

import styled from '@emotion/styled'

import themeConfig from '@configs/themeConfig'

type LogoTextProps = {
  color?: CSSProperties['color']
}

const LogoText = styled.span<LogoTextProps>`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.15px;
`

const SecondaryText = styled.span<LogoTextProps>`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-family: Poppins;
  font-weight: 900;
  font-size: 28px;
  line-height: 136%;
  letter-spacing: 0%;
  margin-top: 2px;
`

const Logo = ({ color }: { color?: CSSProperties['color'] }) => {
  return (
    <div className='flex flex-col items-start min-bs-[24px]'>
      <LogoText color={color}>{themeConfig.templateName}</LogoText>
      <SecondaryText color='#6358DC'>BIGFORUM</SecondaryText>
    </div>
  )
}

export default Logo
