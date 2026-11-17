import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  next: z.string().optional(),
})

export const signupSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => val === '' || /^[+]?[\d\s()-]{7,20}$/.test(val),
      'Please enter a valid phone number (7–20 digits)'
    ),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password is too long'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .max(72, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => val === '' || /^[+]?[\d\s()-]{7,20}$/.test(val),
      'Please enter a valid phone number (7–20 digits)'
    ),
})

export type ActionState = {
  error?: string
  message?: string
  fieldErrors?: Record<string, string[]>
}