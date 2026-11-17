'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, signup, forgotPassword, resetPassword } from '@/app/auth/actions'
import { ActionState } from '@/lib/validations/auth'

const initialState: ActionState = {}

export function LoginForm({
  nextPath,
  initialMessage,
  initialError,
}: {
  nextPath?: string
  initialMessage?: string
  initialError?: string
}) {
  const [state, formAction, isPending] = useActionState(login, initialState)
  const displayError = state.error || initialError

  return (
    <div className="max-w-md w-full space-y-6 border border-gray-200 dark:border-gray-800 p-8 rounded-xl shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your Intern Shop account</p>
      </div>

      {displayError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-lg">
          {displayError}
        </div>
      )}
      {initialMessage && !displayError && (
        <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 rounded-lg">
          {initialMessage}
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        {nextPath && <input type="hidden" name="next" value={nextPath} />}

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
            placeholder="you@example.com"
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
          />
          {state.fieldErrors?.password && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState)

  return (
    <div className="max-w-md w-full space-y-6 border border-gray-200 dark:border-gray-800 p-8 rounded-xl shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-sm text-gray-500 mt-1">Join Intern Shop today</p>
      </div>

      {state.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-lg">
          {state.error}
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="full_name">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
            placeholder="Jane Doe"
          />
          {state.fieldErrors?.full_name && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.full_name[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            Phone Number (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
            placeholder="+1 555 000 0000"
          />
          {state.fieldErrors?.phone && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.phone[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
            placeholder="you@example.com"
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
          />
          {state.fieldErrors?.password && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState)

  return (
    <div className="max-w-md w-full space-y-6 border border-gray-200 dark:border-gray-800 p-8 rounded-xl shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {state.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-lg">
          {state.error}
        </div>
      )}
      {state.message && (
        <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 rounded-lg">
          {state.message}
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
            placeholder="you@example.com"
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  return (
    <div className="max-w-md w-full space-y-6 border border-gray-200 dark:border-gray-800 p-8 rounded-xl shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Choose a new password</h1>
        <p className="text-sm text-gray-500 mt-1">Enter and confirm your new password below</p>
      </div>

      {state.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-lg">
          {state.error}
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
          />
          {state.fieldErrors?.password && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
          />
          {state.fieldErrors?.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.confirmPassword[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}