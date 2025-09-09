'use client'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'

import 'react-perfect-scrollbar/dist/css/styles.css'
import type { ChildrenType } from '@core/types'
import '@/app/globals.css'
import '@assets/iconify-icons/generated-icons.css'
import { store, persistor } from '@store/store'

const RootLayout = ({ children }: ChildrenType) => {
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        </Provider>
      </body>
    </html>
  )
}

export default RootLayout
