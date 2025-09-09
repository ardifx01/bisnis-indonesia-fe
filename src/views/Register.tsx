'use client'
import React, { useState, useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useDispatch, useSelector } from 'react-redux'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Checkbox,
  Button,
  FormControlLabel,
  Divider
} from '@mui/material'

import { register, registerFacebook, reset } from '@store/slices/authSlice'
import type { AppDispatch, RootState } from '@store/store'
import { useImageVariant } from '@core/hooks/useImageVariant'
import type { Mode } from '@core/types'

const darkImg = '/images/pages/auth-v1-mask-dark.png'
const lightImg = '/images/pages/auth-v1-mask-light.png'

const PrivacyPolicyLabel = React.memo(() => (
  <FormControlLabel
    control={<Checkbox />}
    label={
      <>
        <span className='text-[#686677]'>
          By creating an account, I agree to our{' '}
          <Link className='font-bold text-[#19181F] underline' href='/' onClick={e => e.preventDefault()}>
            Terms
          </Link>{' '}
          of use and{' '}
        </span>
        <Link className='font-bold text-[#19181F] underline' href='/' onClick={e => e.preventDefault()}>
          privacy policy
        </Link>
      </>
    }
  />
))

const Register = ({ mode }: { mode: Mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfPasswordShown, setIsConfPasswordShown] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confPassword, setConfPassword] = useState('')
  const [firstName, setFisrtName] = useState('')
  const [lastName, setLastName] = useState('')

  const dispatch = useDispatch<AppDispatch>()

  const router = useRouter()

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfPassword = () => setIsConfPasswordShown(show => !show)

  const { loading, error } = useSelector((state: RootState) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await dispatch(register(email, password, `${firstName} ${lastName}`, confPassword))

      router.push('/login')
    } catch (error) {
      console.error('Registration failed:', error)
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

  const handleFacebookRegister = () => {
    if (window.FB) {
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            window.FB.api('/me', { fields: 'id,name,email,picture' }, (profileResponse: any) => {
              if (profileResponse && !profileResponse.error) {
                const accessToken = response.authResponse.accessToken

                try {
                  dispatch<any>(registerFacebook(accessToken))
                  router.push('/login')
                } catch (error) {
                  console.error('Registration failed:', error)
                }
              } else {
                console.error('Error fetching Facebook profile:', profileResponse.error)
              }
            })
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

  const handleGoogleLogin = () => {
    router.push('http://localhost:5000/api/auth/google')
  }

  const socialRegister = [
    {
      platform: 'Facebook',
      iconClass: 'ri-facebook-fill',
      onClick: handleFacebookRegister,
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
          style={{ backgroundImage: 'url("/images/avatars/3d-render-secure-login-password-illustration 1.webp")' }}
        ></div>
      </div>

      <div className='flex flex-col justify-center items-center flex-1 p-6'>
        <Card className='flex flex-col sm:is-[450px]'>
          <CardContent className='p-6 sm:!p-12'>
            <Typography variant='h4'>Create an account</Typography>
            <div className='flex flex-col gap-5'>
              <Typography className='mbs-1'></Typography>
              {error && <Typography color='error'>{error}</Typography>}
              <form noValidate autoComplete='off' onSubmit={e => handleSubmit(e)} className='flex flex-col gap-5'>
                <div className='flex flex-col gap-1'>
                  <label htmlFor='firstName' className='font-bold text-sm'>
                    First Name
                  </label>
                  <TextField
                    id='firstName'
                    autoFocus
                    fullWidth
                    value={firstName}
                    onChange={e => setFisrtName(e.target.value)}
                  />
                </div>

                <div className='flex flex-col gap-1'>
                  <label htmlFor='lastName' className='font-bold text-sm'>
                    Last Name
                  </label>
                  <TextField id='lastName' fullWidth value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>

                <div className='flex flex-col gap-1'>
                  <label htmlFor='email' className='font-bold text-sm'>
                    Email
                  </label>
                  <TextField id='email' fullWidth value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div className='flex flex-col gap-1'>
                  <label htmlFor='password' className='font-bold text-sm'>
                    Password
                  </label>
                  <TextField
                    id='password'
                    fullWidth
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type={isPasswordShown ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </div>

                <div className='flex flex-col gap-1'>
                  <label htmlFor='confPassword' className='font-bold text-sm'>
                    Confirm Password
                  </label>
                  <TextField
                    id='confPassword'
                    fullWidth
                    value={confPassword}
                    onChange={e => setConfPassword(e.target.value)}
                    type={isConfPasswordShown ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            edge='end'
                            onClick={handleClickShowConfPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isConfPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </div>
                <PrivacyPolicyLabel />
                <Button fullWidth variant='contained' type='submit' disabled={loading}>
                  {loading ? 'Sign Up...' : 'Sign Up'}
                </Button>
                <div className='flex justify-center items-center flex-wrap gap-2'>
                  <Typography>Already have an account?</Typography>
                  <Typography component={Link} href='/login' color='primary' onClick={() => dispatch(reset())}>
                    Sign in instead
                  </Typography>
                </div>
                <Divider className='gap-3'>Or</Divider>
                <div className='flex justify-center items-center gap-2'>
                  {socialRegister.map(({ platform, iconClass, onClick, colorClass }) => (
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

export default Register
