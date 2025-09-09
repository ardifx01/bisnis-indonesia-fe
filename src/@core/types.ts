// React Imports
import type { ReactNode } from 'react'

export type Skin = 'default' | 'bordered'

export type Mode = 'light' | 'dark'

export type SystemMode = 'light' | 'dark'

export type Direction = 'ltr' | 'rtl'

export type ChildrenType = {
  children: ReactNode
}

export type ThemeColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'

export type RowData = {
  avatarSrc: string
  name: string
  username: string
  email: string
  roleIcon: string
  iconClass: string
  role: string
  status: string
}

export type TableColumn<T> = {
  header: string
  accessor: (item: T) => React.ReactNode
  className?: string
}

export type TableProps<T> = {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string | null
  emptyText?: string
}

export type TableRow = {
  name: string
  id: string
  email: string
  createdAt: string
}
