'use client'

import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

import Link from 'next/link'
import Avatar from '@mui/material/Avatar'

import { styled, useTheme } from '@mui/material/styles'

import VerticalNav, { NavHeader } from '@menu/vertical-menu'
import VerticalMenu from './VerticalMenu'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import navigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import { Button, Typography } from '@mui/material'
import { logout } from '@store/slices/authSlice'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@store/store'

const StyledBoxForShadow = styled('div')(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(var(--mui-palette-background-default) 5%, rgb(var(--mui-palette-background-defaultChannel) / 0.85) 30%, rgb(var(--mui-palette-background-defaultChannel) / 0.5) 65%, rgb(var(--mui-palette-background-defaultChannel) / 0.3) 75%, transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const Navigation = () => {
  const theme = useTheme()
  const { isBreakpointReached, toggleVerticalNav } = useVerticalNav()
  const anchorRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const shadowRef = useRef(null)

  const { user } = useSelector((state: RootState) => state.auth)

  const scrollMenu = (container: any, isPerfectScrollbar: boolean) => {
    container = isBreakpointReached || !isPerfectScrollbar ? container.target : container

    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains('scrolled')) {
        // @ts-ignore
        shadowRef.current.classList.add('scrolled')
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove('scrolled')
    }
  }

  const dispatch = useDispatch()

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      dispatch(logout())
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  return (
    <VerticalNav customStyles={navigationCustomStyles(theme)}>
      <NavHeader>
        <Link href='/'>
          <div className='border-l-4 border-yellow-400 pl-3 font-bold font-[20px]'>CRUD OPERATIONS</div>
        </Link>
        {isBreakpointReached && <i className='ri-close-line text-xl' onClick={() => toggleVerticalNav(false)} />}
      </NavHeader>
      <StyledBoxForShadow ref={shadowRef} />
      <div className='flex flex-col items-center mb-10'>
        <Avatar
          ref={anchorRef}
          alt='John Doe'
          src={user?.picture || user?.pictureUrl || '/images/avatars/1.png'}
          className='bs-[100px] is-[100px] mb-4'
        />
        <div className='flex items-center flex-col text-center'>
          <Typography className='font-[10px] font-bold' color='text.primary'>
            {user?.name}
          </Typography>
          <Typography variant='caption' className='capitalize text-[#893976] mt-5'>
            {user?.role?.slug === 'super_admin' ? 'super admin' : user?.role?.slug}
          </Typography>
        </div>
      </div>
      <VerticalMenu scrollMenu={scrollMenu} />
      <div className='justify-center flex'>
        <Button
          variant='text'
          color='inherit'
          size='small'
          endIcon={<i className='ri-logout-box-r-line' />}
          onClick={e => handleDropdownClose(e, '/login')}
          sx={{
            '& .MuiButton-endIcon': { marginInlineStart: 1.5 },
            marginBottom: 5
          }}
        >
          Logout
        </Button>
      </div>
    </VerticalNav>
  )
}

export default Navigation
