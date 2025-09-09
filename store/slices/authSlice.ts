import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { setCookie, destroyCookie } from 'nookies'

import AuthAPIs from '@/views/services/authAPIs'
import type { AuthState, User } from '@/types/pages/widgetTypes'

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: state => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.loading = false
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    logout: state => {
      state.user = null
      state.loading = false
      state.error = null

      destroyCookie(null, 'token')
    },

    registerRequest: state => {
      state.loading = true
      state.error = null
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.loading = false
      state.error = null
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    reset: state => {
      state.loading = false
      state.error = null
      state.user = null
    }
  }
})

export const login = (email: string, password: string) => async (dispatch: any) => {
  dispatch(loginRequest())

  try {
    const response = await AuthAPIs.login({ email, password })

    const { user, accessToken } = response.data

    setCookie(null, 'token', accessToken, {
      maxAge: 7 * 24 * 60 * 60
    })

    dispatch(loginSuccess(user))
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Login failed'

    dispatch(loginFailure(errorMessage))
    throw new Error(errorMessage)
  }
}

export const loginFacebook = (accessToken: string) => async (dispatch: any) => {
  dispatch(loginRequest())

  try {
    const response = await AuthAPIs.loginFacebook({ accessToken })

    if (response && response.data) {
      setCookie(null, 'token', response.data.accessToken, {
        maxAge: 7 * 24 * 60 * 60
      })

      dispatch(loginSuccess(response.data.user))

      return response.data.accessToken
    } else {
      throw new Error('Invalid response from server')
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Login failed'

    dispatch(loginFailure(errorMessage))
    console.error(error)
    throw new Error(errorMessage)
  }
}

export const registerFacebook = (accessToken: string) => async (dispatch: any) => {
  dispatch(registerRequest())

  try {
    const response = await AuthAPIs.registerFacebook({ accessToken })

    dispatch(registerSuccess(response.data.message))
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Registration failed'

    dispatch(registerFailure(errorMessage))
    throw new Error(errorMessage)
  }
}

export const register =
  (email: string, password: string, name: string, confPassword: string) => async (dispatch: any) => {
    if (!email || !password || !name || !confPassword) {
      const errorMessage = 'All fields are required.'

      dispatch(registerFailure(errorMessage))
      throw new Error(errorMessage)
    }

    if (password !== confPassword) {
      const errorMessage = 'Password and confirm password do not match.'

      dispatch(registerFailure(errorMessage))
      throw new Error(errorMessage)
    }

    dispatch(registerRequest())

    try {
      const response = await AuthAPIs.register({ email, password, name, confPassword })

      dispatch(registerSuccess(response.data))
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed'

      dispatch(registerFailure(errorMessage))
      throw new Error(errorMessage)
    }
  }

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  registerRequest,
  registerSuccess,
  registerFailure,
  reset
} = authSlice.actions
export default authSlice.reducer
