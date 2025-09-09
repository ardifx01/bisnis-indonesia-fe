import { authMiddleware } from '../middleware/authMiddleware'

export { authMiddleware as middleware }

export const config = {
  matcher: ['/((?!api|public|_next|images).*)']
}
