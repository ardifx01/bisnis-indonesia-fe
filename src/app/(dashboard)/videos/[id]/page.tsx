/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'

import { useParams } from 'next/navigation'

import * as Yup from 'yup'

import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  CircularProgress,
  FormHelperText,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { useFormik } from 'formik'
import moment from 'moment'

import {
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Star as StarIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material'
import { useSelector } from 'react-redux'

import Swal from 'sweetalert2'

import type { RootState } from '@store/store'
import Form from '@components/Form'
import videoAPIs from '@/views/services/videoAPIs'

// Interface berdasarkan response controller
interface User {
  id: string
  name: string
  email: string
  picture: string
  pictureUrl: string
  bio: string
}

interface VideoDetail {
  id: string
  title: string
  description: string
  url: string
  thumbnail: string
  duration: number
  category: string
  tags: string[]
  language: string
  quality: '480p' | '720p' | '1080p' | '4K'
  views: number
  likes: number
  dislikes: number
  comments: number
  shares: number
  isPublic: boolean
  isActive: boolean
  isFeatured: boolean
  isPremium: boolean
  monetizationEnabled: boolean
  ageRestriction: '' | 'all' | '13+' | '16+' | '18+'
  publishedAt: string | null
  scheduledAt: string | null
  lastViewedAt: string | null
  averageWatchTime: number
  retentionRate: number
  clickThroughRate: number
  fileSize: number
  encoding: string
  createdAt: string
  updatedAt: string
  userId: string
  user: User
}

const initialValues: Partial<VideoDetail> = {
  id: '',
  title: '',
  description: '',
  url: '',
  thumbnail: '',
  duration: 0,
  category: '',
  tags: [],
  language: '',
  quality: '720p',
  views: 0,
  likes: 0,
  dislikes: 0,
  comments: 0,
  shares: 0,
  isPublic: false,
  isActive: true,
  isFeatured: false,
  isPremium: false,
  monetizationEnabled: false,
  ageRestriction: '',
  publishedAt: null,
  scheduledAt: null,
  createdAt: '',
  updatedAt: '',
  userId: ''
}

interface UpdateVideoData {
  title?: string
  description?: string
  url?: string
  thumbnail?: string
  category?: string
  tags?: string[]
  language?: string
  quality?: string
  isPublic?: boolean
  isActive?: boolean
  isFeatured?: boolean
  isPremium?: boolean
  monetizationEnabled?: boolean
  ageRestriction?: string
  publishedAt?: string | null
  scheduledAt?: string | null
}

// Validation Schema
const getValidationSchema = (userRole: string) => {
  const baseSchema = Yup.object().shape({
    title: Yup.string()
      .required('Video title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must not exceed 100 characters'),

    description: Yup.string()
      .required('Video description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must not exceed 1000 characters'),

    url: Yup.string().url('Please enter a valid URL').required('Video URL is required'),

    category: Yup.string()
      .required('Category is required')
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category must not exceed 50 characters'),

    language: Yup.string()
      .required('Language is required')
      .min(2, 'Language must be at least 2 characters')
      .max(30, 'Language must not exceed 30 characters'),

    quality: Yup.string()
      .oneOf(['480p', '720p', '1080p', '4K'], 'Please select a valid quality')
      .required('Quality is required'),

    thumbnail: Yup.string()
      .url('Please enter a valid thumbnail URL')
      .when('isPublic', {
        is: true,
        then: schema => schema.required('Thumbnail is required for public videos'),
        otherwise: schema => schema
      }),

    ageRestriction: Yup.string().oneOf(['', 'all', '13+', '16+', '18+'], 'Please select a valid age restriction'),

    tags: Yup.array().of(Yup.string().min(1, 'Tag cannot be empty')).max(10, 'Maximum 10 tags allowed'),

    isPublic: Yup.boolean(),
    isActive: Yup.boolean(),
    isFeatured: Yup.boolean(),
    isPremium: Yup.boolean(),
    monetizationEnabled: Yup.boolean()
  })

  // Member role has stricter validation
  if (userRole === 'member') {
    return baseSchema.shape({
      isPublic: Yup.boolean().test('member-cannot-publish', 'Members cannot make videos public', value => !value),
      isFeatured: Yup.boolean().test('member-cannot-feature', 'Members cannot create featured videos', value => !value),
      isPremium: Yup.boolean().test('member-cannot-premium', 'Members cannot create premium videos', value => !value),
      monetizationEnabled: Yup.boolean().test(
        'member-cannot-monetize',
        'Members cannot enable monetization',
        value => !value
      )
    })
  }

  return baseSchema
}

function VideoDetail() {
  const { id } = useParams()
  const videoId = Array.isArray(id) ? id[0] : id

  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<Partial<VideoDetail>>(initialValues)
  const user = useSelector((state: RootState) => state.auth.user)

  // Memoize user permissions
  const isDisabled = useMemo(() => user?.role?.slug === 'member', [user?.role?.slug])
  const userRole = useMemo(() => user?.role?.slug || 'member', [user?.role?.slug])

  const fetchVideoDetail = async () => {
    setLoading(true)

    try {
      const response = await videoAPIs.getVideoDetail(videoId)
      const videoDetail = response.data.data

      setData(videoDetail)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch video detail'

      console.error(errorMessage)

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
    fetchVideoDetail()
  }, [])

  const formik = useFormik({
    initialValues: data,
    validationSchema: getValidationSchema(userRole),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values: any) => {
      setLoading(true)

      try {
        const updateData: UpdateVideoData = {
          title: values.title,
          description: values.description,
          url: values.url,
          thumbnail: values.thumbnail,
          category: values.category,
          tags: values.tags,
          language: values.language,
          quality: values.quality,
          isPublic: values.isPublic,
          isActive: values.isActive,
          isFeatured: values.isFeatured,
          isPremium: values.isPremium,
          monetizationEnabled: values.monetizationEnabled,
          ageRestriction: values.ageRestriction,
          publishedAt: values.publishedAt,
          scheduledAt: values.scheduledAt
        }

        // Remove undefined/null/empty values
        const cleanedData: UpdateVideoData = {}

        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanedData[key as keyof UpdateVideoData] = value
          }
        })

        const response = await videoAPIs.updateVideo(videoId as string, cleanedData)

        if (response?.data) {
          Swal.fire({
            title: 'Berhasil!',
            text: 'Video berhasil diperbarui.',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(result => {
            if (result.isConfirmed) {
              fetchVideoDetail()
            }
          })
        }
      } catch (error: any) {
        let errorMessage = 'Gagal memperbarui video'

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error instanceof Error) {
          errorMessage = error.message
        }

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
  })

  // Helper untuk menampilkan error
  const getFieldError = useCallback(
    (fieldName: string) => {
      const touched = formik.touched as Record<string, boolean>
      const errors = formik.errors as Record<string, string>

      return touched[fieldName] && errors[fieldName]
    },
    [formik.touched, formik.errors]
  )

  // Optimized handlers
  const handleTagsChange = useCallback(
    (event: any) => {
      const tagsArray = event.target.value
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t)

      formik.setFieldValue('tags', tagsArray)
    },
    [formik]
  )

  // Helper functions untuk formatting
  const formatNumber = useCallback((num: number | undefined | null): string => {
    return new Intl.NumberFormat().format(num || 0)
  }, [])

  const formatDuration = useCallback((seconds: number | undefined | null): string => {
    if (!seconds) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }, [])

  const formatFileSize = useCallback((bytes: number | undefined | null): string => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Memoized components
  const StatusChip = useMemo(
    () =>
      ({ isPublic, isActive }: { isPublic: boolean; isActive: boolean }) => {
        if (!isActive) {
          return (
            <Chip label='Inactive' color='error' size='small' icon={<LockIcon fontSize='small' />} variant='outlined' />
          )
        }

        if (isPublic) {
          return (
            <Chip
              label='Public'
              color='success'
              size='small'
              icon={<PublicIcon fontSize='small' />}
              variant='outlined'
            />
          )
        }

        return (
          <Chip label='Private' color='default' size='small' icon={<LockIcon fontSize='small' />} variant='outlined' />
        )
      },
    []
  )

  const VideoStats = useMemo(
    () =>
      ({
        views,
        likes,
        dislikes,
        comments,
        shares
      }: {
        views: number
        likes: number
        dislikes: number
        comments: number
        shares: number
      }) => (
        <Box display='flex' gap={2} alignItems='center' flexWrap='wrap'>
          <Box display='flex' alignItems='center' gap={0.5}>
            <VisibilityIcon fontSize='small' color='action' />
            <Typography variant='body2'>{formatNumber(views)}</Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.5}>
            <ThumbUpIcon fontSize='small' color='action' />
            <Typography variant='body2'>{formatNumber(likes)}</Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.5}>
            <ThumbDownIcon fontSize='small' color='action' />
            <Typography variant='body2'>{formatNumber(dislikes)}</Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.5}>
            <CommentIcon fontSize='small' color='action' />
            <Typography variant='body2'>{formatNumber(comments)}</Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.5}>
            <ShareIcon fontSize='small' color='action' />
            <Typography variant='body2'>{formatNumber(shares)}</Typography>
          </Box>
        </Box>
      ),
    [formatNumber]
  )

  // Tags display
  const tagsDisplay = useMemo(() => {
    if (!formik.values.tags || !Array.isArray(formik.values.tags) || formik.values.tags.length === 0) {
      return null
    }

    return (
      <Grid item xs={12}>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Tags:
        </Typography>
        <Box display='flex' flexWrap='wrap' gap={0.5}>
          {formik.values.tags.map((tag: string, index: number) => (
            <Chip key={index} label={tag} size='small' variant='outlined' color='primary' />
          ))}
        </Box>
      </Grid>
    )
  }, [formik.values.tags])

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-96'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader
        action={
          <Box display='flex' alignItems='center' gap={2}>
            <StatusChip isPublic={data.isPublic || false} isActive={data.isActive !== false} />
            {data.isFeatured && <StarIcon color='warning' />}
            {data.isPremium && <MonetizationOnIcon color='primary' />}
          </Box>
        }
      />
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={5}>
            {/* Video Preview Section */}
            <Grid item xs={12}>
              <Card variant='outlined' sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Video Preview
                  </Typography>
                  {data.url && (
                    <Box sx={{ mb: 3 }}>
                      <iframe
                        className='w-full h-[300px] rounded-lg'
                        src={data.url}
                        title='Video player'
                        frameBorder='0'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                        referrerPolicy='strict-origin-when-cross-origin'
                        allowFullScreen
                      />
                    </Box>
                  )}
                  <VideoStats
                    views={data.views || 0}
                    likes={data.likes || 0}
                    dislikes={data.dislikes || 0}
                    comments={data.comments || 0}
                    shares={data.shares || 0}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Video Info Section */}
            <Grid item xs={12}>
              <Card variant='outlined' sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Video Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>ID:</strong> {data.id}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Duration:</strong> {formatDuration(data.duration)}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>File Size:</strong> {formatFileSize(data.fileSize)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Created:</strong>{' '}
                        {data.createdAt ? moment(data.createdAt).format('DD MMM YYYY HH:mm') : '-'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Updated:</strong>{' '}
                        {data.updatedAt ? moment(data.updatedAt).format('DD MMM YYYY HH:mm') : '-'}
                      </Typography>
                      {data.publishedAt && (
                        <Typography variant='body2' color='success.main'>
                          <strong>Published:</strong> {moment(data.publishedAt).format('DD MMM YYYY HH:mm')}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Author Section */}
            {data.user && (
              <Grid item xs={12}>
                <Card variant='outlined' sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      Author
                    </Typography>
                    <Box display='flex' alignItems='center' gap={2}>
                      <Avatar src={data.user.pictureUrl} alt={data.user.name} sx={{ width: 56, height: 56 }}>
                        {data.user.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant='h6'>{data.user.name}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {data.user.email}
                        </Typography>
                        {data.user.bio && (
                          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                            {data.user.bio}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Basic Fields */}
            <Grid item xs={12}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Title'
                required
                placeholder='Video Title'
                name='title'
                value={formik.values.title || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('title')}
                helperText={getFieldError('title') as string}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='URL'
                required
                placeholder='https://example.com/video'
                name='url'
                value={formik.values.url || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('url')}
                helperText={getFieldError('url') as string}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Description'
                multiline
                rows={4}
                required
                placeholder='Video description...'
                name='description'
                value={formik.values.description || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('description')}
                helperText={getFieldError('description') as string}
              />
            </Grid>

            {/* Category & Language */}
            <Grid item xs={12} md={6}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Category'
                required
                placeholder='e.g., Education, Entertainment'
                name='category'
                value={formik.values.category || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('category')}
                helperText={getFieldError('category') as string}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Language'
                required
                placeholder='e.g., English, Indonesian'
                name='language'
                value={formik.values.language || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('language')}
                helperText={getFieldError('language') as string}
              />
            </Grid>

            {/* Quality & Tags */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!getFieldError('quality')} disabled={isDisabled}>
                <InputLabel>Quality *</InputLabel>
                <Select
                  name='quality'
                  value={formik.values.quality || '720p'}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label='Quality *'
                >
                  <MenuItem value='480p'>480p</MenuItem>
                  <MenuItem value='720p'>720p</MenuItem>
                  <MenuItem value='1080p'>1080p</MenuItem>
                  <MenuItem value='4K'>4K</MenuItem>
                </Select>
                {getFieldError('quality') && <FormHelperText>{getFieldError('quality') as string}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Tags'
                placeholder='tag1, tag2, tag3'
                name='tags'
                value={Array.isArray(formik.values.tags) ? formik.values.tags.join(', ') : ''}
                onChange={handleTagsChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('tags')}
                helperText={getFieldError('tags') as string}
              />
            </Grid>

            {/* Thumbnail */}
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                Thumbnail
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Thumbnail URL'
                placeholder='https://example.com/thumbnail.jpg'
                name='thumbnail'
                value={formik.values.thumbnail || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('thumbnail')}
                helperText={getFieldError('thumbnail') as string}
              />
            </Grid>

            {/* Thumbnail Preview */}
            {formik.values.thumbnail && (
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Thumbnail Preview:
                  </Typography>
                  <Box
                    component='img'
                    src={formik.values.thumbnail}
                    alt='Video Thumbnail'
                    sx={{
                      width: 300,
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                    onError={(e: any) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </Box>
              </Grid>
            )}

            {/* Age Restriction */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={isDisabled}>
                <InputLabel>Age Restriction</InputLabel>
                <Select
                  name='ageRestriction'
                  value={formik.values.ageRestriction || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label='Age Restriction'
                >
                  <MenuItem value=''>No Restriction</MenuItem>
                  <MenuItem value='all'>All Ages</MenuItem>
                  <MenuItem value='13+'>13+</MenuItem>
                  <MenuItem value='16+'>16+</MenuItem>
                  <MenuItem value='18+'>18+</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Settings */}
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                Settings
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isPublic || false}
                    onChange={e => formik.setFieldValue('isPublic', e.target.checked)}
                    disabled={isDisabled}
                  />
                }
                label='Public Video'
              />
              {getFieldError('isPublic') && (
                <FormHelperText error>{getFieldError('isPublic') as string}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isActive !== false}
                    onChange={e => formik.setFieldValue('isActive', e.target.checked)}
                    disabled={isDisabled}
                  />
                }
                label='Active'
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isFeatured || false}
                    onChange={e => formik.setFieldValue('isFeatured', e.target.checked)}
                    disabled={isDisabled}
                  />
                }
                label='Featured Video'
              />
              {getFieldError('isFeatured') && (
                <FormHelperText error>{getFieldError('isFeatured') as string}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isPremium || false}
                    onChange={e => formik.setFieldValue('isPremium', e.target.checked)}
                    disabled={isDisabled}
                  />
                }
                label='Premium Video'
              />
              {getFieldError('isPremium') && (
                <FormHelperText error>{getFieldError('isPremium') as string}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.monetizationEnabled || false}
                    onChange={e => formik.setFieldValue('monetizationEnabled', e.target.checked)}
                    disabled={isDisabled}
                  />
                }
                label='Monetization'
              />
              {getFieldError('monetizationEnabled') && (
                <FormHelperText error>{getFieldError('monetizationEnabled') as string}</FormHelperText>
              )}
            </Grid>

            {/* Tags Display */}
            {tagsDisplay}

            {/* Submit Button */}
            {!isDisabled && (
              <Grid item xs={12}>
                <Button variant='contained' type='submit' disabled={loading}>
                  {loading ? 'Updating...' : 'Update Video'}
                </Button>
              </Grid>
            )}
          </Grid>
        </Form>
      </CardContent>
    </Card>
  )
}

export default VideoDetail
