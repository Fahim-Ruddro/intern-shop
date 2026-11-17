'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/auth/actions'
import { ActionState } from '@/lib/validations/auth'

const initialState: ActionState = {}

export default function AccountForm({
  email,
  fullName,
  phone,
  role,
}: {
  email: string
  fullName: string
  phone: string
  role: string
}) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)

  return (
    <div className="max-w-lg w-full border border-gray-200 dark:border-gray-800 rounded-xl p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and update your profile details</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-medium uppercase rounded-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
          {role}
        </span>
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
          <label className="block text-sm font-medium mb-1 text-gray-500" htmlFor="email">
            Email (read-only)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="full_name">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={fullName}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
          />
          {state.fieldErrors?.full_name && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.full_name[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            placeholder="+1 555 000 0000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
          />
          {state.fieldErrors?.phone && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.phone[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Saving changes...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}