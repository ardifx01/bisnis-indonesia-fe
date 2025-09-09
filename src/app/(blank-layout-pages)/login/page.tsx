import Login from '@views/Login'

import { getServerMode } from '@core/utils/serverHelpers'

const LoginPage = () => {
  const mode = getServerMode()

  return <Login mode={mode} />
}

export default LoginPage
