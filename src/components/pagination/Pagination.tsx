import { Pagination, Select, MenuItem, FormControl, Box } from '@mui/material'
import Typography from '@mui/material/Typography'

import type { PaginationProps } from '@/types/pages/widgetTypes'

export const Paginations: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  perPage,
  totalItems,
  onPageChange,
  onPerPageChange,
  disabled = false
}) => {
  const perPageOptions = [5, 10, 25, 50]

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, totalItems)

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mt: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          Show
        </Typography>
        <FormControl size='small' sx={{ minWidth: 70 }}>
          <Select
            value={perPage}
            onChange={e => onPerPageChange(Number(e.target.value))}
            disabled={disabled}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: 1
              }
            }}
          >
            {perPageOptions.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant='body2' color='text.secondary'>
          entries
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant='body2' color='text.secondary'>
          Showing {startItem} to {endItem} of {totalItems} entries
        </Typography>

        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => onPageChange(page)}
          disabled={disabled}
          color='primary'
          size='small'
          showFirstButton
          showLastButton
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 1
            }
          }}
        />
      </Box>
    </Box>
  )
}
