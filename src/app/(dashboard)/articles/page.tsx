/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent
} from '@mui/material'
import moment from 'moment'
import Swal from 'sweetalert2'
import { useDebounce } from 'use-debounce'

import {
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Public as PublicIcon,
  Drafts as DraftsIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material'

import { useSelector } from 'react-redux'

import articleAPIs from '@/views/services/articleAPIs'
import type { Article } from '@/types/pages/widgetTypes'
import Table from '@/components/table/Table'
import { Paginations } from '@/components/pagination/Pagination'
import { Search } from '@/components/search/Search'
import type { RootState } from '@store/store'

interface ArticleFilters {
  search: string
  status: string
  author: string
  featured: string
}

interface GetAllParams {
  search: string
  page: number
  perPage: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  status?: string
  author?: string
  featured?: boolean | null
}

const ArticlePage = () => {
  const router = useRouter()

  const [loading, setLoading] = useState<boolean>(true)
  const [loadingDelete, setLoadingDelete] = useState<{ [key: string]: boolean }>({})
  const [data, setData] = useState<Article[]>([])

  // Filter states
  const [filters, setFilters] = useState<ArticleFilters>({
    search: '',
    status: '',
    author: '',
    featured: ''
  })

  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [perPage, setPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000)

  const user = useSelector((state: RootState) => state.auth.user)

  // Filter options based on your backend controller
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'archived', label: 'Archived' }
  ]

  const featuredOptions = [
    { value: '', label: 'All Articles' },
    { value: 'true', label: 'Featured Only' },
    { value: 'false', label: 'Not Featured' }
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Created At' },
    { value: 'updatedAt', label: 'Updated At' },
    { value: 'publishedAt', label: 'Published At' },
    { value: 'title', label: 'Title' },
    { value: 'viewsCount', label: 'Views' },
    { value: 'likesCount', label: 'Likes' },
    { value: 'commentsCount', label: 'Comments' },
    { value: 'readingTime', label: 'Reading Time' }
  ]

  const fetchAllArticles = async () => {
    setLoading(true)

    try {
      const payload: GetAllParams = {
        search: debouncedSearchTerm,
        page: currentPage,
        perPage: perPage,
        sortBy: sortBy,
        sortOrder: sortOrder
      }

      // Add filters only if they have values
      if (filters.status) {
        payload.status = filters.status
      }

      if (filters.author) {
        payload.author = filters.author
      }

      if (filters.featured !== '') {
        payload.featured = filters.featured === 'true' ? true : filters.featured === 'false' ? false : null
      }

      const response = await articleAPIs.getAllArticle(payload)
      const articles = response.data.data

      setData(articles)
      setTotalPages(response.data.pagination.totalPages || 1)
      setTotalItems(response.data.pagination.totalItems || articles.length)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch articles'

      console.log(errorMessage)

      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllArticles()
  }, [currentPage, perPage, sortBy, sortOrder, filters, debouncedSearchTerm])

  const handleDetail = (id: string) => {
    router.push(`/articles/${id}`)
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    setLoadingDelete(prev => ({ ...prev, [id]: true }))

    try {
      await articleAPIs.deleteArticle(id)

      Swal.fire({
        title: 'Deleted!',
        text: 'Article has been deleted successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(result => {
        if (result.isConfirmed) {
          fetchAllArticles()
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete article'

      Swal.fire({
        title: 'Delete Failed!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setLoadingDelete(prev => {
        const newState = { ...prev }

        delete newState[id]

        return newState
      })
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (key: keyof ArticleFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      author: '',
      featured: ''
    })
    setCurrentPage(1)
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length
  }

  if (loading && data.length === 0) {
    return (
      <div className='flex justify-center items-center min-h-96'>
        <CircularProgress />
      </div>
    )
  }

  // Status chip component
  const StatusChip = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'published':
          return { color: 'success', icon: <PublicIcon fontSize='small' /> }
        case 'draft':
          return { color: 'default', icon: <DraftsIcon fontSize='small' /> }
        case 'scheduled':
          return { color: 'info', icon: <ScheduleIcon fontSize='small' /> }
        case 'archived':
          return { color: 'secondary', icon: <ArchiveIcon fontSize='small' /> }
        default:
          return { color: 'default', icon: null }
      }
    }

    const config = getStatusConfig(status)

    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={config.color as any}
        size='small'
        icon={config.icon || undefined}
        variant='outlined'
      />
    )
  }

  // Reading time component
  const ReadingTime = ({ minutes }: { minutes: number }) => (
    <Typography variant='caption' color='text.secondary'>
      {minutes} min read
    </Typography>
  )

  // Article stats component
  const ArticleStats = ({ views, likes, comments }: { views: number; likes: number; comments: number }) => (
    <Box display='flex' gap={2} alignItems='center'>
      <Box display='flex' alignItems='center' gap={0.5}>
        <VisibilityIcon fontSize='small' color='action' />
        <Typography variant='caption'>{views?.toLocaleString() || 0}</Typography>
      </Box>
      <Box display='flex' alignItems='center' gap={0.5}>
        <FavoriteIcon fontSize='small' color='action' />
        <Typography variant='caption'>{likes?.toLocaleString() || 0}</Typography>
      </Box>
      <Box display='flex' alignItems='center' gap={0.5}>
        <CommentIcon fontSize='small' color='action' />
        <Typography variant='caption'>{comments?.toLocaleString() || 0}</Typography>
      </Box>
    </Box>
  )

  const columns = [
    {
      header: 'Article',
      accessor: (row: any) => (
        <Box>
          <Box display='flex' alignItems='center' gap={1} mb={1}>
            <Typography variant='subtitle2' fontWeight='bold'>
              {row.title}
            </Typography>
            {row.featured && <StarIcon fontSize='small' color='warning' />}
          </Box>
          {row.excerpt && (
            <Typography variant='caption' color='text.secondary' display='block' mb={1}>
              {row.excerpt.length > 100 ? `${row.excerpt.substring(0, 100)}...` : row.excerpt}
            </Typography>
          )}
          <Box display='flex' alignItems='center' gap={2}>
            <StatusChip status={row.status} />
            {row.readingTime && <ReadingTime minutes={row.readingTime} />}
          </Box>
        </Box>
      )
    },
    {
      header: 'Author',
      accessor: (row: any) => (
        <Box display='flex' alignItems='center' gap={1}>
          <Avatar src={row.user?.pictureUrl} alt={row.user?.name} sx={{ width: 32, height: 32 }}>
            {row.user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant='body2' fontWeight='medium'>
              {row.user?.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.user?.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      header: 'Thumbnail',
      accessor: (row: any) =>
        row.thumbnail ? (
          <Box
            component='img'
            src={row.thumbnail}
            alt={row.thumbnailAlt || row.title}
            sx={{
              width: 60,
              height: 40,
              objectFit: 'cover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          />
        ) : (
          <Box
            sx={{
              width: 60,
              height: 40,
              backgroundColor: 'grey.200',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              No Image
            </Typography>
          </Box>
        )
    },
    {
      header: 'Keywords',
      accessor: (row: any) => {
        // Handle different keyword formats (string, array, or null/undefined)
        const getKeywordArray = (keywords: any) => {
          if (!keywords) return []
          if (Array.isArray(keywords)) return keywords
          if (typeof keywords === 'string')
            return keywords
              .split(',')
              .map(k => k.trim())
              .filter(k => k)

          return []
        }

        const keywordArray = getKeywordArray(row.keywords)

        return (
          <Box>
            {keywordArray.length > 0 ? (
              <Box display='flex' flexWrap='wrap' gap={0.5}>
                {keywordArray.slice(0, 3).map((keyword: string, index: number) => (
                  <Chip key={index} label={keyword} size='small' variant='outlined' color='primary' />
                ))}
                {keywordArray.length > 3 && (
                  <Chip label={`+${keywordArray.length - 3}`} size='small' variant='outlined' />
                )}
              </Box>
            ) : (
              <Typography variant='caption' color='text.secondary'>
                No keywords
              </Typography>
            )}
          </Box>
        )
      }
    },
    {
      header: 'Stats',
      accessor: (row: any) => (
        <ArticleStats views={row.viewsCount} likes={row.likesCount} comments={row.commentsCount} />
      )
    },
    {
      header: 'Dates',
      accessor: (row: any) => (
        <Box>
          <Typography variant='caption' color='text.secondary' display='block'>
            Created: {moment(row.createdAt).format('DD MMM YYYY')}
          </Typography>
          <Typography variant='caption' color='text.secondary' display='block'>
            Updated: {moment(row.updatedAt).format('DD MMM YYYY')}
          </Typography>
          {row.publishedAt && (
            <Typography variant='caption' color='success.main' display='block'>
              Published: {moment(row.publishedAt).format('DD MMM YYYY')}
            </Typography>
          )}
          {row.scheduledAt && (
            <Typography variant='caption' color='info.main' display='block'>
              Scheduled: {moment(row.scheduledAt).format('DD MMM YYYY')}
            </Typography>
          )}
        </Box>
      )
    },
    {
      sortable: false,
      header: () => <div className='text-center'>Action</div>,
      accessor: (row: any) => (
        <Box display='flex' gap={1} justifyContent='center' alignItems='center' flexWrap='nowrap'>
          <Button variant='outlined' size='small' onClick={() => handleDetail(row.id)}>
            Detail
          </Button>

          {user && user.role?.slug !== 'member' && (
            <Button
              variant='contained'
              color='error'
              size='small'
              onClick={() => handleDelete(row.id)}
              disabled={loadingDelete[row.id]}
            >
              {loadingDelete[row.id] ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </Box>
      )
    }
  ]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {/* Header */}
        <Box display='flex' justifyContent='flex-end' alignItems='center' mb={3}>
          <Box display='flex' gap={2}>
            <Button variant='outlined' onClick={() => setShowFilters(!showFilters)}>
              Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </Button>
          </Box>
        </Box>

        {/* Search */}
        <Box mb={3}>
          <Search
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder='Search articles, content, authors, keywords...'
            disabled={loading}
          />
        </Box>

        {/* Filters Panel */}
        {showFilters && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h6'>Filters</Typography>
                <Button size='small' onClick={clearFilters}>
                  Clear All
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={e => handleFilterChange('status', e.target.value)}
                      label='Status'
                    >
                      {statusOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Featured Status</InputLabel>
                    <Select
                      value={filters.featured}
                      onChange={e => handleFilterChange('featured', e.target.value)}
                      label='Featured Status'
                    >
                      {featuredOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Sort By</InputLabel>
                    <Select value={sortBy} onChange={e => setSortBy(e.target.value)} label='Sort By'>
                      {sortOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sortOrder === 'desc'}
                        onChange={e => setSortOrder(e.target.checked ? 'desc' : 'asc')}
                      />
                    }
                    label={`Sort: ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        <Box mb={3}>
          <Typography variant='body2' color='textSecondary'>
            Showing {data.length} of {totalItems} articles
            {getActiveFiltersCount() > 0 && ` (${getActiveFiltersCount()} filters applied)`}
          </Typography>
        </Box>

        {/* Table */}
        <Table
          data={data || []}
          columns={columns}
          loading={loading}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Pagination */}
        <Paginations
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          disabled={loading}
        />
      </Grid>
    </Grid>
  )
}

export default ArticlePage
