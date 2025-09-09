/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useDebounce } from 'use-debounce'

import classnames from 'classnames'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import { useSelector } from 'react-redux'
import { Box } from '@mui/material'

import Swal from 'sweetalert2'

import Table from '@/components/table/Table'
import UserAPIs from '@/views/services/UserAPIs'
import type { User } from '@/types/pages/widgetTypes'
import type { RootState } from '@store/store'
import { Search } from '@/components/search/Search'
import { Paginations } from '@/components/pagination/Pagination'

const UsersPage = () => {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)

  const [loading, setLoading] = useState<boolean>(true)
  const [loadingDelete, setLoadingDelete] = useState<{ [key: string]: boolean }>({})
  const [data, setData] = useState<User[]>([])

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [perPage, setPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)

  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000)

  const fetchAllUsers = async () => {
    setLoading(true)

    try {
      const payload = {
        search: debouncedSearchTerm,
        page: currentPage,
        perPage: perPage,
        sortBy: sortBy.toLowerCase().replace(/\s+/g, '_'),
        sortOrder: sortOrder
      }

      const response = await UserAPIs.getAllUser(payload)
      const users = response.data.data

      setData(users)

      setTotalPages(response.data.pagination.totalPages || 1)
      setTotalItems(response.data.pagination.totalItems || users.length)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users'

      console.log(errorMessage)
    } finally {
      setLoading(false)
    }
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
      await UserAPIs.deleteUser(id)

      Swal.fire({
        title: 'Deleted!',
        text: 'User has been deleted successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(result => {
        if (result.isConfirmed) {
          fetchAllUsers()
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user'

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
  }

  useEffect(() => {
    fetchAllUsers()
  }, [currentPage, perPage, sortBy, sortOrder, debouncedSearchTerm])

  const handleDetail = (id: string) => {
    router.push(`/users/${id}`)
  }

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Helper function to get membership status
  const getMembershipStatus = (membership: any) => {
    if (!membership) return { text: 'No Membership', color: 'default' as const }

    if (membership.is_expired) {
      return { text: 'Expired', color: 'error' as const }
    }

    return { text: 'Active', color: 'success' as const }
  }

  const columns = [
    {
      header: 'User',
      accessor: (row: any) => (
        <div className='flex items-center gap-3'>
          <Avatar src={row.pictureUrl || undefined} alt={row.name} sx={{ width: 40, height: 40 }}>
            {row.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <Typography variant='body2' fontWeight={500}>
              {row.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.email}
            </Typography>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: (row: any) => (
        <div className='flex items-center gap-2'>
          <i
            className={classnames(
              row.role?.slug === 'super_admin'
                ? 'ri-vip-crown-line'
                : row.role?.slug === 'admin'
                  ? 'ri-shield-user-line'
                  : 'ri-user-3-line',
              row.role?.slug === 'super_admin'
                ? 'text-warning'
                : row.role?.slug === 'admin'
                  ? 'text-primary'
                  : 'text-success',
              'text-[18px]'
            )}
          />
          <Typography className='capitalize'>{row.role?.name?.replace(/_/g, ' ') || 'No Role'}</Typography>
        </div>
      )
    },
    {
      header: 'Membership',
      accessor: (row: any) => (
        <div>
          <Typography variant='body2' fontWeight={500}>
            {row.membership?.name || 'No Membership'}
          </Typography>
          {row.membership && (
            <div className='flex items-center gap-2 mt-1'>
              <Chip
                label={getMembershipStatus(row.membership).text}
                color={getMembershipStatus(row.membership).color}
                size='small'
              />
              {row.membership.expires_at && (
                <Typography variant='caption' color='text.secondary'>
                  Expires: {formatDate(row.membership.expires_at)}
                </Typography>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <div className='flex flex-col gap-1'>
          <Chip
            label={row.is_active ? 'Active' : 'Inactive'}
            color={row.is_active ? 'success' : 'error'}
            size='small'
          />
          {row.email_verified ? (
            <Chip label='Verified' color='info' size='small' variant='outlined' />
          ) : (
            <Chip label='Unverified' color='warning' size='small' variant='outlined' />
          )}
        </div>
      )
    },
    {
      header: 'Last Login',
      accessor: (row: any) => <Typography variant='body2'>{formatDate(row.last_login_at)}</Typography>
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
              disabled={loadingDelete[row.id] || row.role?.slug === 'super_admin'}
            >
              {loadingDelete[row.id] ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box sx={{ mb: 3 }}>
          <Search
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder='Search by name, email, role, or membership...'
            disabled={loading}
          />
        </Box>

        <Table
          data={data || []}
          columns={columns}
          loading={loading}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

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

export default UsersPage
