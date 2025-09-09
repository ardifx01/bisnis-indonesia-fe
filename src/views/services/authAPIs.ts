import instance from '../../services/AxiosGlobal'

const login = (data: { email: string; password: string }) => {
  return instance.post('login', data)
}

const loginFacebook = (data: { accessToken: string }) => {
  return instance.post('auth/facebook/login', data)
}

const registerFacebook = (data: { accessToken: string }) => {
  return instance.post('auth/facebook/register', data)
}

const register = (data: { email: string; password: string; name: string; confPassword: string }) => {
  return instance.post('register', data)
}

const AuthAPIs = {
  login,
  register,
  loginFacebook,
  registerFacebook
}

export default AuthAPIs
