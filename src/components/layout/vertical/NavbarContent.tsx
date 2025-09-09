import IconButton from '@mui/material/IconButton'
import classnames from 'classnames'

import NavToggle from './NavToggle'

import ModeDropdown from '@components/layout/shared/ModeDropdown'

import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-2 sm:gap-4'>
        <NavToggle />
      </div>
      <div className='flex items-center'>
        <ModeDropdown />
        <IconButton className='text-textPrimary'>
          <i className='ri-notification-2-line' />
        </IconButton>
      </div>
    </div>
  )
}

export default NavbarContent
