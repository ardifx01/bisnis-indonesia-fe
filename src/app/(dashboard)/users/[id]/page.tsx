/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useSelector } from 'react-redux'

import Swal from 'sweetalert2'
import { Avatar, Typography, Chip, Box } from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import { useFormik } from 'formik'
import CardHeader from '@mui/material/CardHeader'

import Form from '@components/Form'
import UserAPIs from '@/views/services/UserAPIs'
import { UserSchema } from '@/schemas/userSchema'
import type { RootState } from '@/types/pages/widgetTypes'

const initialValues = {
  email: '',
  id: '',
  name: '',
  bio: '',
  picture: '',
  pictureUrl: '',
  is_active: true,
  email_verified: false,
  role: {
    id: '',
    name: '',
    slug: '',
    level: 0,
    permissions: []
  },
  membership: {
    id: '',
    name: '',
    slug: '',
    price: 0,
    duration_days: 0,
    features: [],
    limits: null,
    expires_at: '',
    is_expired: false
  }
}

// Updated membership options based on seeder data
const MembershipOptions = [
  { value: 'free', label: 'Free - $0.00', color: 'default' },
  { value: 'premium', label: 'Premium - $29.99', color: 'primary' },
  { value: 'enterprise', label: 'Enterprise - $99.99', color: 'secondary' }
]

// Role options based on seeder data
const RoleOptions = [
  { value: 'member', label: 'Member', color: 'default' },
  { value: 'admin', label: 'Admin', color: 'warning' },
  { value: 'super_admin', label: 'Super Admin', color: 'error' }
]

function UserDetail() {
  const router = useRouter()

  const currentUser = useSelector((state: RootState) => state.auth.user)

  const { id } = useParams()
  const userId = Array.isArray(id) ? id[0] : id

  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState(initialValues)

  const fetchUserDetail = async () => {
    setLoading(true)

    try {
      const response = await UserAPIs.getUserDetail(userId)
      const userDetail = response.data.data

      setData(userDetail)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user detail'

      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        router.push('/users')
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDetail()
  }, [])

  const formik = useFormik({
    initialValues: data || initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema: UserSchema,
    onSubmit: async (values: any) => {
      try {
        if (values.picture && typeof values.picture !== 'string') {
          const formData = new FormData()

          formData.append('picture', values.picture)

          try {
            await UserAPIs.imgUserDetail(userId, formData)
          } catch (imageError) {
            console.error('Error uploading image:', imageError)

            Swal.fire({
              title: 'Image Upload Error!',
              text: 'Failed to upload image. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            })

            return
          }
        }

        // Prepare update data
        const updateData = {
          name: values.name,
          email: values.email,
          bio: values.bio,
          membership_slug: values.membership?.slug,
          role_slug: values.role?.slug
        }

        await UserAPIs.updatedUserDetail(userId, updateData)

        Swal.fire({
          title: 'Success!',
          text: 'User details updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          router.push('/users')
        })
      } catch (error) {
        console.error('Error updating user details:', error)

        Swal.fire({
          title: 'Error!',
          text: (error as Error).message || 'Failed to update user details. Please try again.',
          icon: 'error',
          confirmButtonText: 'Retry'
        })
      }
    }
  })

  const handleFileChange = (event: any) => {
    const file = event.target.files[0]

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File too large',
          text: 'The file size must be less than 5 MB.'
        })

        return
      }

      if (!['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Unsupported file type',
          text: 'Only PNG, JPG, and JPEG formats are allowed.'
        })

        return
      }

      formik.setFieldValue('picture', file)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isAdmin = currentUser?.role?.slug === 'admin' || currentUser?.role?.slug === 'super_admin'
  const canEdit = currentUser?.id === userId || isAdmin

  return (
    <Card>
      <CardHeader
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={data.is_active ? 'Active' : 'Inactive'}
              color={data.is_active ? 'success' : 'error'}
              size='small'
            />
            <Chip
              label={data.email_verified ? 'Verified' : 'Unverified'}
              color={data.email_verified ? 'success' : 'warning'}
              size='small'
            />
          </Box>
        }
      />
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3} alignItems='center' direction='column'>
            <Grid item>
              <Avatar
                src={formik.values.pictureUrl || formik.values.picture || '/images/avatars/1.png'}
                alt='Profile Picture'
                sx={{ width: 120, height: 120 }}
              />
            </Grid>
            <Grid item>
              <Typography variant='body2' color='textSecondary'>
                Accepted formats: PNG, JPG, JPEG (Max size: 5 MB)
              </Typography>
            </Grid>
            {canEdit && (
              <Grid item className='mb-3'>
                <Button variant='contained' component='label' startIcon={<AddPhotoAlternateIcon />}>
                  Select File
                  <input type='file' accept='image/png, image/jpg, image/jpeg' hidden onChange={handleFileChange} />
                </Button>
              </Grid>
            )}
          </Grid>

          {/* User Info Display */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, borderRadius: 1 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Role Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip
                    label={`${data.role?.name} (Level ${data.role?.level})`}
                    color={
                      data.role?.slug === 'super_admin' ? 'error' : data.role?.slug === 'admin' ? 'warning' : 'default'
                    }
                    size='small'
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, borderRadius: 1 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Membership Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip
                    label={`${data.membership?.name} - $${data.membership?.price}`}
                    color={
                      data.membership?.slug === 'enterprise'
                        ? 'secondary'
                        : data.membership?.slug === 'premium'
                          ? 'primary'
                          : 'default'
                    }
                    size='small'
                  />
                  {data.membership?.is_expired && <Chip label='Expired' color='error' size='small' />}
                </Box>
                <Typography variant='caption' color='textSecondary' sx={{ mt: 1, display: 'block' }}>
                  Expires: {formatDate(data.membership?.expires_at)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Name'
                placeholder='John Doe'
                name='name'
                value={formik.values.name}
                disabled={!canEdit}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={
                  formik.touched.name && typeof formik.errors.name === 'string' ? formik.errors.name : undefined
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-user-3-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='email'
                label='Email'
                placeholder='johndoe@gmail.com'
                required
                name='email'
                value={formik.values.email}
                disabled={!canEdit}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={
                  formik.touched.email && typeof formik.errors.email === 'string' ? formik.errors.email : undefined
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-mail-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Role Selection - Only for admins */}
            {isAdmin && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name='role.slug'
                    value={formik.values.role?.slug || ''}
                    onChange={e => {
                      formik.setFieldValue('role.slug', e.target.value)
                    }}
                    label='Role'
                    disabled={!isAdmin}
                  >
                    {RoleOptions.map(role => (
                      <MenuItem value={role.value} key={role.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={role.label} color={role.color as any} size='small' />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Membership Selection */}
            <Grid item xs={12} md={isAdmin ? 6 : 12}>
              <FormControl fullWidth>
                <InputLabel>Membership</InputLabel>
                <Select
                  name='membership.slug'
                  value={formik.values.membership?.slug || ''}
                  onChange={e => {
                    formik.setFieldValue('membership.slug', e.target.value)
                  }}
                  label='Membership'
                  disabled={!canEdit}
                >
                  {MembershipOptions.map(membership => (
                    <MenuItem value={membership.value} key={membership.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={membership.label} color={membership.color as any} size='small' />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                rows={4}
                multiline
                label='Bio'
                placeholder='Bio...'
                name='bio'
                value={formik.values.bio || ''}
                onChange={formik.handleChange}
                disabled={!canEdit}
                onBlur={formik.handleBlur}
                sx={{ '& .MuiOutlinedInput-root': { alignItems: 'baseline' } }}
                error={formik.touched.bio && Boolean(formik.errors.bio)}
                helperText={formik.touched.bio && typeof formik.errors.bio === 'string' ? formik.errors.bio : undefined}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-message-2-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {canEdit && (
              <Grid item xs={12}>
                <Button variant='contained' type='submit' disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Grid>
            )}
          </Grid>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UserDetail
