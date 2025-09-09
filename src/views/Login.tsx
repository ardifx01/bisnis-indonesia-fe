/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useEffect, useState } from 'react'

import type { FormEvent } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useDispatch, useSelector } from 'react-redux'
import { setCookie } from 'nookies'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import {
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Checkbox,
  Button,
  FormControlLabel,
  Divider
} from '@mui/material'

import type { Mode } from '@core/types'
import type { RootState } from '@store/store'

import Logo from '@components/layout/shared/Logo'
import { useImageVariant } from '@core/hooks/useImageVariant'
import { login, loginFacebook, loginSuccess, reset } from '@store/slices/authSlice'

declare global {
  interface Window {
    FB: any
  }
}

const RememberMe = React.memo(() => {
  return <FormControlLabel control={<Checkbox />} label='Remember me' />
})

const MemoizedLogo = React.memo(() => (
  <Link href='/' className='flex items-center mbe-6'>
    <Logo />
  </Link>
))

const darkImg = '/images/pages/auth-v1-mask-dark.png'
const lightImg = '/images/pages/auth-v1-mask-light.png'

const Login = ({ mode }: { mode: Mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const dispatch = useDispatch()

  const { loading, error } = useSelector((state: RootState) => state.auth)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await dispatch<any>(login(email, password))
      router.push('/')
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const loadFacebookSDK = () => {
      if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script')

        script.id = 'facebook-jssdk'
        script.src = 'https://connect.facebook.net/en_US/sdk.js'
        script.async = true
        script.defer = true

        script.onload = () => {
          if (window.FB) {
            window.FB.init({
              appId: process.env.NEXT_PUBLIC_APP_ID,
              cookie: true,
              xfbml: true,
              version: 'v12.0'
            })
          }
        }

        document.body.appendChild(script)
      }
    }

    loadFacebookSDK()
  }, [])

  const handleFacebookLogin = () => {
    if (window.FB) {
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken

            handleLogin(accessToken)
          } else {
            console.log('User cancelled login or did not fully authorize.')
          }
        },
        { scope: 'email,public_profile' }
      )
    } else {
      console.error('Facebook SDK not loaded yet.')
    }
  }

  const handleLogin = async (accessToken: string) => {
    await dispatch<any>(loginFacebook(accessToken))
    router.push('/')
  }

  const handleGoogleLogin = () => {
    router.push(`${process.env.NEXT_PUBLIC_APP_URL_API}auth/google`)
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const user = urlParams.get('user')

    if (token && user) {
      const handleLoginSuccess = async () => {
        try {
          if (user) {
            const parsedUser = JSON.parse(user)

            dispatch(loginSuccess(parsedUser))
          } else {
            console.warn('No user data found in URL parameters')
          }

          if (token) {
            setCookie(null, 'token', token, {
              maxAge: 7 * 24 * 60 * 60,
              path: '/'
            })
          } else {
            console.warn('No token found in URL parameters')
          }

          router.push('/')
          window.close()
        } catch (error) {
          console.error('Error handling login success:', error)
        }
      }

      handleLoginSuccess()
    }
  }, [router])

  const socialLogins = [
    {
      platform: 'Facebook',
      iconClass: 'ri-facebook-fill',
      onClick: handleFacebookLogin,
      colorClass: 'text-facebook'
    },
    {
      platform: 'Twitter',
      iconClass: 'ri-twitter-fill',
      onClick: () => {},
      colorClass: 'text-twitter'
    },
    {
      platform: 'GitHub',
      iconClass: 'ri-github-fill',
      onClick: () => {},
      colorClass: 'text-github'
    },
    {
      platform: 'Google',
      iconClass: 'ri-google-fill',
      onClick: handleGoogleLogin,
      colorClass: 'text-googlePlus'
    }
  ]

  return (
    <div className='flex min-h-screen'>
      <div className='flex-1 flex justify-center items-center '>
        <div
          className='w-[25rem] h-[25rem] bg-contain bg-center bg-no-repeat'
          style={{ backgroundImage: 'url("/images/avatars/Illustration.webp")' }}
        ></div>
      </div>

      <div className='flex flex-col justify-center items-center flex-1 p-6'>
        <Card className='flex flex-col sm:is-[450px] w-full max-w-md'>
          <CardContent className='p-6 sm:!p-12'>
            <MemoizedLogo />
            <div className='flex flex-col gap-5'>
              {error && <Typography color='error'>{error}</Typography>}
              <form noValidate autoComplete='off' onSubmit={e => handleSubmit(e)} className='flex flex-col gap-5'>
                <TextField
                  autoFocus
                  fullWidth
                  label='Email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <svg width='25' height='18' viewBox='0 0 30 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M27 0H3C1.35 0 0.015 1.35 0.015 3L0 21C0 22.65 1.35 24 3 24H27C28.65 24 30 22.65 30 21V3C30 1.35 28.65 0 27 0ZM27 6L15 13.5L3 6V3L15 10.5L27 3V6Z'
                            fill='black'
                          />
                        </svg>
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  label='Password'
                  id='outlined-adornment-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <svg width='25' height='18' viewBox='0 0 27 27' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M12.3749 21.3749V22.4998C12.3749 22.7982 12.2564 23.0844 12.0454 23.2953C11.8344 23.5063 11.5483 23.6248 11.2499 23.6248H8.99994V24.7498C8.99994 25.3466 8.76289 25.9189 8.34093 26.3408C7.91898 26.7628 7.34669 26.9998 6.74995 26.9998H2.24998C1.65325 26.9998 1.08096 26.7628 0.659005 26.3408C0.237051 25.9189 0 25.3466 0 24.7498V21.8406C0.000127433 21.2439 0.237262 20.6717 0.659245 20.2499L9.36669 11.5424C8.83278 9.72947 8.88315 7.79444 9.51066 6.01172C10.1382 4.229 11.311 2.68906 12.8628 1.61026C14.4146 0.531463 16.2666 -0.0314448 18.1562 0.00135624C20.0459 0.0341573 21.8773 0.661002 23.3907 1.79301C24.9041 2.92501 26.0227 4.50472 26.588 6.30815C27.1533 8.11158 27.1364 10.0472 26.5399 11.8405C25.9434 13.6339 24.7975 15.1939 23.2647 16.2994C21.7318 17.405 19.8898 17.9999 17.9999 17.9999H15.7476V20.2499C15.7476 20.5482 15.6291 20.8344 15.4181 21.0454C15.2072 21.2563 14.921 21.3749 14.6226 21.3749H12.3727H12.3749ZM20.2499 8.99994C20.8466 8.99994 21.4189 8.76289 21.8408 8.34093C22.2628 7.91898 22.4998 7.34669 22.4998 6.74995C22.4998 6.15322 22.2628 5.58093 21.8408 5.15898C21.4189 4.73702 20.8466 4.49997 20.2499 4.49997C19.6531 4.49997 19.0808 4.73702 18.6589 5.15898C18.2369 5.58093 17.9999 6.15322 17.9999 6.74995C17.9999 7.34669 18.2369 7.91898 18.6589 8.34093C19.0808 8.76289 19.6531 8.99994 20.2499 8.99994Z'
                            fill='black'
                          />
                        </svg>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={() => handleClickShowPassword()}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                  <RememberMe />
                  <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                    Forgot password?
                  </Typography>
                </div>
                <Button fullWidth variant='contained' type='submit' disabled={loading}>
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
                <div className='flex justify-center items-center flex-wrap gap-2'>
                  <Typography>New on our platform?</Typography>
                  <Typography component={Link} href='/register' color='primary' onClick={() => dispatch(reset())}>
                    Register
                  </Typography>
                </div>
                <Divider className='gap-3'>or</Divider>
                <div className='flex justify-center items-center gap-2'>
                  {socialLogins.map(({ platform, iconClass, onClick, colorClass }) => (
                    <IconButton key={platform} size='small' className={colorClass} onClick={onClick}>
                      <i className={iconClass} />
                    </IconButton>
                  ))}
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
