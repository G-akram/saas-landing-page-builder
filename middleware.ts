export { auth as middleware } from '@/shared/lib/auth'

export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*'],
}
