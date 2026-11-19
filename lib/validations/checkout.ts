import { z } from 'zod'

export const FIXED_DELIVERY_CHARGE_CENTS = 500 // $5.00 fixed delivery fee

export const addressSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 digits')
    .max(25, 'Phone number is too long')
    .regex(/^[+0-9\s()-]+$/, 'Enter a valid phone number'),
  address: z
    .string()
    .trim()
    .min(5, 'Street address must be at least 5 characters')
    .max(250, 'Address is too long'),
  city: z
    .string()
    .trim()
    .min(2, 'City is required')
    .max(100, 'City name is too long'),
  area: z
    .string()
    .trim()
    .min(2, 'Area / neighborhood is required')
    .max(100, 'Area name is too long'),
})

export type AddressInput = z.infer<typeof addressSchema>