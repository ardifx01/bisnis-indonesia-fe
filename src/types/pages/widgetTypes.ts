import type { ThemeColor } from '@core/types'
import type { OptionsMenuType } from '@core/components/option-menu/types'
import type { CustomAvatarProps } from '@core/components/mui/Avatar'

export type CardStatsVerticalProps = {
  title: string
  stats: string
  avatarIcon: string
  subtitle: string
  avatarColor?: ThemeColor
  trendNumber: string
  trend?: 'positive' | 'negative'
  avatarSkin?: CustomAvatarProps['skin']
  avatarSize?: number
  moreOptions?: OptionsMenuType
}

export type Article = {
  id: string
  title: string
  content: string
  createdAt: string | null
  user: {
    name: string
    email: string
  }
}

export type articleState = {
  articles: Article[]
  articleDetail: Article | null
  loading: boolean
  error: string | null
}

export type User = {
  id: string
  name: string
  email: string
  bio?: string
  picture?: string
  pictureUrl?: string
  is_active: boolean
  email_verified: boolean
  last_login_at?: string
  createdAt: string
  updatedAt: string
  role: {
    id: string
    name: string
    slug: string
    permissions: string[]
  }
  membership: {
    id: string
    name: string
    slug: string
    price: number
    duration_days: number
    features: string[]
    limits?: any
    expires_at?: string
    is_expired: boolean
  }
}

export type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
}

export type UsersState = {
  users: User[]
  userDetail: User | null
  loading: boolean
  error: string | null
}

export type Video = {
  id: string
  title: string
  url: string
  createdAt: string | null
  user: {
    name: string
    email: string
  }
}

export type videoState = {
  videos: Video[]
  videoDetail: Video | null
  loading: boolean
  error: string | null
}

export type RootState = {
  auth: {
    user: User | null
  }
}

export type GetAllParams = {
  search: string
  page: number
  perPage: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export type SearchProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export type PaginationProps = {
  currentPage: number
  totalPages: number
  perPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  disabled?: boolean
}
