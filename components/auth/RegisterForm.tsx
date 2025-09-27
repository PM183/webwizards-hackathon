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
import { registerSchema, RegisterFormData } from '../../lib/utils/validation'

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        studentId: data.studentId,
        role: data.role,
      })
      router.push('/') // Middleware will redirect to appropriate dashboard
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Failed to create account',
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
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Join the polling system to participate in polls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
            </div>

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

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register('role')}
              >
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {selectedRole === 'student' && (
              <div className="space-y-2">
                <label htmlFor="studentId" className="text-sm font-medium">
                  Student ID (Optional)
                </label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter your student ID"
                  error={errors.studentId?.message}
                  {...register('studentId')}
                />
              </div>
            )}

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
              Create Account
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}