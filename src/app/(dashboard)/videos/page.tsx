/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Card,
  CardContent
} from '@mui/material'

import { useDebounce } from 'use-debounce'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'

import moment from 'moment'

import { Visibility as VisibilityIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material'

import type { Video } from '@/types/pages/widgetTypes'
import videoAPIs from '@/views/services/videoAPIs'
import { Search } from '@/components/search/Search'
import Table from '@/components/table/Table'
import { Paginations } from '@/components/pagination/Pagination'
import type { RootState } from '@store/store'

interface VideoFilters {
  search: string
  category: string
  language: string
  quality: string
  isPublic: string
  isFeatured: string
  isPremium: string
}

const VideoPage = () => {
  const router = useRouter()
  const [loadingDelete, setLoadingDelete] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<Video[]>([])

  // Filter states
  const [filters, setFilters] = useState<VideoFilters>({
    search: '',
    category: '',
    language: '',
    quality: '',
    isPublic: '',
    isFeatured: '',
    isPremium: ''
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

  // Filter options based on your backend validation
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'programming', label: 'Programming' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'health', label: 'Health' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'education', label: 'Education' },
    { value: 'tutorial', label: 'Tutorial' }
  ]

  const languageOptions = [
    { value: '', label: 'All Languages' },
    { value: 'id', label: 'Indonesian' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' }
  ]

  const qualityOptions = [
    { value: '', label: 'All Qualities' },
    { value: '360p', label: '360p' },
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p' },
    { value: '1080p', label: '1080p' },
    { value: '1440p', label: '1440p' },
    { value: '4k', label: '4K' }
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Created At' },
    { value: 'updatedAt', label: 'Updated At' },
    { value: 'publishedAt', label: 'Published At' },
    { value: 'title', label: 'Title' },
    { value: 'views', label: 'Views' },
    { value: 'likes', label: 'Likes' },
    { value: 'duration', label: 'Duration' },
    { value: 'retentionRate', label: 'Retention Rate' },
    { value: 'clickThroughRate', label: 'Click Through Rate' }
  ]

  const fetchAllVideos = async () => {
    try {
      setLoading(true)

      const payload = {
        search: debouncedSearchTerm,
        page: currentPage,
        perPage: perPage,
        sortBy: sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
        category: filters.category,
        language: filters.language,
        quality: filters.quality,
        isPublic: filters.isPublic,
        isFeatured: filters.isFeatured,
        isPremium: filters.isPremium
      }

      const response = await videoAPIs.getAllVideo(payload)
      const videos = response.data.data

      setData(videos)
      setTotalPages(response.data.pagination.totalPages || 1)
      setTotalItems(response.data.pagination.totalItems || videos.length)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch videos'

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
    fetchAllVideos()
  }, [currentPage, perPage, sortBy, sortOrder, debouncedSearchTerm, filters])

  const handleDetail = (id: string) => {
    router.push(`/videos/${id}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (key: keyof VideoFilters, value: string) => {
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
      await videoAPIs.deleteVideo(id)

      Swal.fire({
        title: 'Deleted!',
        text: 'Video has been deleted successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(result => {
        if (result.isConfirmed) {
          fetchAllVideos()
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete video'

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

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      language: '',
      quality: '',
      isPublic: '',
      isFeatured: '',
      isPremium: ''
    })
    setCurrentPage(1)
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const columns = [
    {
      header: 'Title',
      accessor: (row: any) => (
        <Box>
          <Typography variant='body1' fontWeight='medium'>
            {row.title}
          </Typography>
          <Typography variant='caption' color='textSecondary'>
            {row.category.replace('-', ' ').toUpperCase()}
          </Typography>
        </Box>
      )
    },
    {
      header: 'Creator',
      accessor: (row: any) => (
        <Box>
          <Typography>{row.user.name}</Typography>
          <Typography variant='caption' color='textSecondary'>
            {row.user.email}
          </Typography>
        </Box>
      )
    },
    {
      header: 'Stats',
      accessor: (row: any) => (
        <Box>
          <Typography variant='body2'>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VisibilityIcon fontSize='small' color='action' />
              <span>{row.views.toLocaleString()}</span>
              <span>•</span>
              <ThumbUpIcon fontSize='small' color='action' />
              <span>{row.likes.toLocaleString()}</span>
            </Box>
          </Typography>
          <Typography variant='caption' color='textSecondary'>
            Duration: {formatDuration(row.duration)}
          </Typography>
        </Box>
      )
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <Box display='flex' flexDirection='column' gap={0.5}>
          <Box display='flex' gap={0.5}>
            {row.isPublic && <Chip label='Public' size='small' color='success' />}
            {row.isPremium && <Chip label='Premium' size='small' color='warning' />}
            {row.isFeatured && <Chip label='Featured' size='small' color='primary' />}
          </Box>
          <Box display='flex' gap={0.5}>
            <Chip label={row.quality} size='small' variant='outlined' />
            <Chip label={row.language.toUpperCase()} size='small' variant='outlined' />
          </Box>
        </Box>
      )
    },
    {
      header: 'Published',
      accessor: (row: any) => (
        <Typography variant='body2'>
          {row.publishedAt ? moment(row.publishedAt).format('DD MMM YYYY') : 'Not Published'}
        </Typography>
      )
    },
    {
      sortable: false,
      header: () => <div className='text-center'>Action</div>,
      accessor: (row: any) => (
        <div className='flex gap-2 justify-center'>
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
        </div>
      )
    }
  ]

  if (loading && data.length === 0) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <CircularProgress />
      </div>
    )
  }

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
            placeholder='Search videos, users, or tags...'
            disabled={loading}
          />
        </Box>

        {/* Filters Panel */}
        {showFilters && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display='flex' justifyContent='between' alignItems='center' mb={2}>
                <Typography variant='h6'>Filters</Typography>
                <Button size='small' onClick={clearFilters}>
                  Clear All
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={e => handleFilterChange('category', e.target.value)}
                      label='Category'
                    >
                      {categoryOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={filters.language}
                      onChange={e => handleFilterChange('language', e.target.value)}
                      label='Language'
                    >
                      {languageOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Quality</InputLabel>
                    <Select
                      value={filters.quality}
                      onChange={e => handleFilterChange('quality', e.target.value)}
                      label='Quality'
                    >
                      {qualityOptions.map(option => (
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

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Public Status</InputLabel>
                    <Select
                      value={filters.isPublic}
                      onChange={e => handleFilterChange('isPublic', e.target.value)}
                      label='Public Status'
                    >
                      <MenuItem value=''>All</MenuItem>
                      <MenuItem value='true'>Public Only</MenuItem>
                      <MenuItem value='false'>Private Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Featured Status</InputLabel>
                    <Select
                      value={filters.isFeatured}
                      onChange={e => handleFilterChange('isFeatured', e.target.value)}
                      label='Featured Status'
                    >
                      <MenuItem value=''>All</MenuItem>
                      <MenuItem value='true'>Featured Only</MenuItem>
                      <MenuItem value='false'>Not Featured</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Premium Status</InputLabel>
                    <Select
                      value={filters.isPremium}
                      onChange={e => handleFilterChange('isPremium', e.target.value)}
                      label='Premium Status'
                    >
                      <MenuItem value=''>All</MenuItem>
                      <MenuItem value='true'>Premium Only</MenuItem>
                      <MenuItem value='false'>Free Only</MenuItem>
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
            Showing {data.length} of {totalItems} videos
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

export default VideoPage
