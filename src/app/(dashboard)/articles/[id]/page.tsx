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
  FormHelperText
} from '@mui/material'
import { useFormik } from 'formik'
import moment from 'moment'

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

import Swal from 'sweetalert2'

import type { RootState } from '@store/store'

import Form from '@components/Form'
import articleAPIs from '@/views/services/articleAPIs'
import TinyEditor from '@/components/editor/TinyEditor'

// Interface berdasarkan response controller
interface User {
  id: string
  name: string
  email: string
  picture: string
  pictureUrl: string
  bio: string
}

interface ArticleDetail {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  status: 'published' | 'draft' | 'scheduled' | 'archived'
  userId: string
  thumbnail: string
  thumbnailAlt: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  readingTime: number
  viewsCount: number
  likesCount: number
  commentsCount: number
  featured: boolean
  allowComments: boolean
  publishedAt: string | null
  scheduledAt: string | null
  createdAt: string
  updatedAt: string
  user: User
}

const initialValues: Partial<ArticleDetail> = {
  id: '',
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  status: 'draft',
  userId: '',
  thumbnail: '',
  thumbnailAlt: '',
  metaTitle: '',
  metaDescription: '',
  keywords: [],
  readingTime: 0,
  viewsCount: 0,
  likesCount: 0,
  commentsCount: 0,
  featured: false,
  allowComments: true,
  publishedAt: null,
  scheduledAt: null,
  createdAt: '',
  updatedAt: ''
}

interface UpdateArticleData {
  title?: string
  content?: string
  excerpt?: string
  status?: string
  thumbnail?: string
  thumbnailAlt?: string
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  featured?: boolean
  allowComments?: boolean
  publishedAt?: string | null
  scheduledAt?: string | null
}

// Validation Schema
const getValidationSchema = (userRole: string) => {
  const baseSchema = Yup.object().shape({
    title: Yup.string()
      .required('Article title is required')
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title must not exceed 100 characters'),

    slug: Yup.string()
      .required('Slug is required')
      .matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
      .min(3, 'Slug must be at least 3 characters')
      .max(100, 'Slug must not exceed 100 characters'),

    excerpt: Yup.string()
      .max(300, 'Excerpt must not exceed 300 characters')
      .when('status', {
        is: 'published',
        then: schema => schema.required('Excerpt is required for published articles'),
        otherwise: schema => schema
      }),

    content: Yup.string().required('Article content cannot be empty').min(50, 'Content must be at least 50 characters'),

    status: Yup.string()
      .oneOf(['published', 'draft', 'scheduled', 'archived'], 'Invalid status')
      .required('Status is required'),

    thumbnail: Yup.string()
      .url('Invalid thumbnail URL')
      .when('status', {
        is: 'published',
        then: schema => schema.required('Thumbnail is required for published articles'),
        otherwise: schema => schema
      }),

    thumbnailAlt: Yup.string().when('thumbnail', {
      is: (thumbnail: string) => thumbnail && thumbnail.length > 0,
      then: schema => schema.required('Alt text is required when thumbnail is provided'),
      otherwise: schema => schema
    }),

    metaTitle: Yup.string().max(60, 'Meta title must not exceed 60 characters for optimal SEO'),

    metaDescription: Yup.string().max(160, 'Meta description must not exceed 160 characters for optimal SEO'),

    keywords: Yup.array().of(Yup.string()).max(10, 'Maximum 10 keywords allowed'),

    scheduledAt: Yup.date()
      .nullable()
      .when('status', {
        is: 'scheduled',
        then: schema =>
          schema
            .required('Scheduled date is required for scheduled articles')
            .min(new Date(), 'Scheduled date must be in the future'),
        otherwise: schema => schema
      }),

    featured: Yup.boolean(),
    allowComments: Yup.boolean()
  })

  // Member role has stricter validation
  if (userRole === 'member') {
    return baseSchema.shape({
      status: Yup.string().oneOf(['draft'], 'Members can only save articles as draft').required('Status is required'),

      featured: Yup.boolean().test('member-cannot-feature', 'Members cannot create featured articles', value => !value)
    })
  }

  return baseSchema
}

function ArticleDetail() {
  const { id } = useParams()
  const articleId = Array.isArray(id) ? id[0] : id

  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<Partial<ArticleDetail>>(initialValues)
  const user = useSelector((state: RootState) => state.auth.user)

  // Memoize user permissions
  const isDisabled = useMemo(() => user?.role?.slug === 'member', [user?.role?.slug])
  const userRole = useMemo(() => user?.role?.slug || 'member', [user?.role?.slug])

  const fetchArticleDetail = async () => {
    setLoading(true)

    try {
      const response = await articleAPIs.getArticleDetail(articleId)
      const articleDetail = response.data

      setData(articleDetail)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch article detail'

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
    fetchArticleDetail()
  }, [])

  const prepareContent = useCallback((content: any) => {
    if (!content) return JSON.stringify({ blocks: [] })

    if (typeof content === 'string') {
      try {
        JSON.parse(content)

        return content
      } catch (e) {
        return content
      }
    }

    return JSON.stringify(content)
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
        const updateData: UpdateArticleData = {
          title: values.title,
          content: prepareContent(values.content),
          excerpt: values.excerpt,
          status: values.status,
          thumbnail: values.thumbnail,
          thumbnailAlt: values.thumbnailAlt,
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
          keywords: values.keywords,
          featured: values.featured,
          allowComments: values.allowComments,
          publishedAt: values.publishedAt,
          scheduledAt: values.scheduledAt
        }

        // Remove undefined/null/empty values
        const cleanedData: UpdateArticleData = {}

        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanedData[key as keyof UpdateArticleData] = value
          }
        })

        const response = await articleAPIs.updateArticle(articleId as string, cleanedData)

        if (response?.data) {
          Swal.fire({
            title: 'Berhasil!',
            text: 'Artikel berhasil diperbarui.',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(result => {
            if (result.isConfirmed) {
              fetchArticleDetail()
            }
          })
        }
      } catch (error: any) {
        let errorMessage = 'Gagal memperbarui artikel'

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
  const handleKeywordsChange = useCallback(
    (event: any) => {
      const keywordsArray = event.target.value
        .split(',')
        .map((k: string) => k.trim())
        .filter((k: string) => k)

      formik.setFieldValue('keywords', keywordsArray)
    },
    [formik]
  )

  // Memoized components
  const StatusChip = useMemo(
    () =>
      ({ status }: { status: string }) => {
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
      },
    []
  )

  const ArticleStats = useMemo(
    () =>
      ({ views, likes, comments }: { views: number; likes: number; comments: number }) => (
        <Box display='flex' gap={2} alignItems='center'>
          <Box display='flex' alignItems='center' gap={0.5}>
            <VisibilityIcon fontSize='small' color='action' />
            <Typography variant='body2'>{views?.toLocaleString() || 0}</Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.5}>
            <FavoriteIcon fontSize='small' color='action' />
            <Typography variant='body2'>{likes?.toLocaleString() || 0}</Typography>
          </Box>
          <Box display='flex' alignItems='center' gap={0.5}>
            <CommentIcon fontSize='small' color='action' />
            <Typography variant='body2'>{comments?.toLocaleString() || 0}</Typography>
          </Box>
        </Box>
      ),
    []
  )

  // Keywords display
  const keywordsDisplay = useMemo(() => {
    if (!formik.values.keywords || !Array.isArray(formik.values.keywords) || formik.values.keywords.length === 0) {
      return null
    }

    return (
      <Grid item xs={12}>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Keywords:
        </Typography>
        <Box display='flex' flexWrap='wrap' gap={0.5}>
          {formik.values.keywords.map((keyword: string, index: number) => (
            <Chip key={index} label={keyword} size='small' variant='outlined' color='primary' />
          ))}
        </Box>
      </Grid>
    )
  }, [formik.values.keywords])

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
            <StatusChip status={data.status || 'draft'} />
            {data.featured && <StarIcon color='warning' />}
          </Box>
        }
      />
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={5}>
            {/* Article Info Section */}
            <Grid item xs={12}>
              <Card variant='outlined' sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Article Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>ID:</strong> {data.id}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Slug:</strong> {data.slug}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Reading Time:</strong> {data.readingTime} min
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
                      {data.scheduledAt && (
                        <Typography variant='body2' color='info.main'>
                          <strong>Scheduled:</strong> {moment(data.scheduledAt).format('DD MMM YYYY HH:mm')}
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

            {/* Stats Section */}
            <Grid item xs={12}>
              <Card variant='outlined' sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Statistics
                  </Typography>
                  <ArticleStats
                    views={data.viewsCount || 0}
                    likes={data.likesCount || 0}
                    comments={data.commentsCount || 0}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Basic Fields */}
            <Grid item xs={12} md={8}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Title'
                required
                placeholder='Article Title'
                name='title'
                value={formik.values.title || ''}
                onChange={e => {
                  formik.setFieldValue('title', e.target.value)
                  formik.setFieldValue(
                    'slug',
                    e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/\s+/g, '-')
                      .replace(/-+/g, '-')
                  )
                }}
                onBlur={formik.handleBlur}
                error={!!getFieldError('title')}
                helperText={getFieldError('title') as string}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                disabled
                fullWidth
                label='Slug'
                required
                placeholder='article-slug'
                name='slug'
                value={formik.values.slug || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('slug')}
                helperText={getFieldError('slug') as string}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Excerpt'
                multiline
                rows={3}
                placeholder='Article excerpt...'
                name='excerpt'
                value={formik.values.excerpt || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('excerpt')}
                helperText={getFieldError('excerpt') as string}
              />
            </Grid>

            {/* SEO Fields */}
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                SEO Settings
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Meta Title'
                placeholder='SEO Meta Title'
                name='metaTitle'
                value={formik.values.metaTitle || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('metaTitle')}
                helperText={getFieldError('metaTitle') as string}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Keywords'
                placeholder='keyword1, keyword2, keyword3'
                name='keywords'
                value={Array.isArray(formik.values.keywords) ? formik.values.keywords.join(', ') : ''}
                onChange={handleKeywordsChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('keywords')}
                helperText={getFieldError('keywords') as string}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Meta Description'
                multiline
                rows={2}
                placeholder='SEO Meta Description'
                name='metaDescription'
                value={formik.values.metaDescription || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('metaDescription')}
                helperText={getFieldError('metaDescription') as string}
              />
            </Grid>

            {/* Thumbnail Fields */}
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                Thumbnail
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Thumbnail URL'
                placeholder='https://example.com/image.jpg'
                name='thumbnail'
                value={formik.values.thumbnail || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('thumbnail')}
                helperText={getFieldError('thumbnail') as string}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                disabled={isDisabled}
                fullWidth
                label='Thumbnail Alt Text'
                placeholder='Alt text for thumbnail'
                name='thumbnailAlt'
                value={formik.values.thumbnailAlt || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError('thumbnailAlt')}
                helperText={getFieldError('thumbnailAlt') as string}
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
                    alt={formik.values.thumbnailAlt || 'Thumbnail'}
                    sx={{
                      width: 200,
                      height: 120,
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
                    checked={formik.values.featured || false}
                    onChange={e => formik.setFieldValue('featured', e.target.checked)}
                    disabled={isDisabled}
                  />
                }
                label='Featured Article'
              />
              {getFieldError('featured') && (
                <FormHelperText error>{getFieldError('featured') as string}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.allowComments !== false}
                    onChange={e => formik.setFieldValue('allowComments', e.target.checked)}
                    disabled={isDisabled}
                  />
                }
                label='Allow Comments'
              />
            </Grid>

            {/* Content Editor */}
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom sx={{ mt: 2, mb: 2 }}>
                Content *
              </Typography>
              <TinyEditor
                disabled={isDisabled}
                value={formik.values.content || ''}
                onChange={(content: string) => formik.setFieldValue('content', content)}
                height={400}
                plugins='lists link image table code help wordcount fullscreen media'
                toolbar='undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help fullscreen'
              />
              {getFieldError('content') && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {getFieldError('content') as string}
                </FormHelperText>
              )}
            </Grid>

            {/* Keywords Display */}
            {keywordsDisplay}

            {/* Submit Button */}
            {!isDisabled && (
              <Grid item xs={12}>
                <Button variant='contained' type='submit' disabled={loading}>
                  {loading ? 'Updating...' : 'Update Article'}
                </Button>
              </Grid>
            )}
          </Grid>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ArticleDetail
