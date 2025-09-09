'use client'

import Link from 'next/link'

import classnames from 'classnames'

import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span>{`© ${new Date().getFullYear()}, Made with `}</span>
        <span>{`❤️`}</span>
        <span>{` by `}</span>
        <Link href='#' className='text-primary'>
          Arif Yudi
        </Link>
      </p>
    </div>
  )
}

export default FooterContent
