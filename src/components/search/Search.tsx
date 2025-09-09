import { TextField, InputAdornment } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'

import type { SearchProps } from '@/types/pages/widgetTypes'

export const Search: React.FC<SearchProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Search users...',
  disabled = false
}) => {
  return (
    <TextField
      fullWidth
      variant='outlined'
      placeholder={placeholder}
      value={searchTerm}
      onChange={e => onSearchChange(e.target.value)}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <SearchIcon />
          </InputAdornment>
        )
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderRadius: 2
          }
        }
      }}
    />
  )
}
