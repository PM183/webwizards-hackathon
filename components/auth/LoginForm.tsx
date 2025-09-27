'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../lib/hooks/useAuth'
import { loginSchema, LoginFormData } from '../../lib/utils/validation'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      await signIn(data)
      router.push('/') // Middleware will redirect to appropriate dashboard
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Failed to sign in',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the polling system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {errors.root && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}