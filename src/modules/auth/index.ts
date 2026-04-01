// Public API for the auth module.
export { registerAction } from '@/modules/auth/actions/register-action'
export { loginAction } from '@/modules/auth/actions/login-action'
export { OAuthButtons, AuthDivider } from '@/modules/auth/components/oauth-buttons'
export { RegisterForm } from '@/modules/auth/components/register-form'
export { LoginForm } from '@/modules/auth/components/login-form'
export { registerSchema, loginSchema } from '@/modules/auth/lib/auth-validation'
export type { RegisterInput, LoginInput } from '@/modules/auth/lib/auth-validation'
