import { describe, expect, it } from 'vitest'
import {
  loginSchema,
  signupSchema,
  resetPasswordSchema,
  profileSchema,
} from '@/lib/validations/auth'
import { addressSchema } from '@/lib/validations/checkout'
import { productSchema, validateImageFile } from '@/lib/validations/product'

describe('auth Zod schemas', () => {
  it('validates login credentials and trims email whitespace', () => {
    const result = loginSchema.safeParse({
      email: '  alice@example.com  ',
      password: 'secret',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('alice@example.com')
    }
  })

  it('rejects invalid signup phone numbers and short passwords', () => {
    const invalid = signupSchema.safeParse({
      full_name: 'Alice',
      phone: '123',
      email: 'alice@example.com',
      password: '123',
    })
    expect(invalid.success).toBe(false)
    if (!invalid.success) {
      const fields = invalid.error.flatten().fieldErrors
      expect(fields.phone).toBeDefined()
      expect(fields.password).toBeDefined()
    }
  })

  it('allows empty optional phone on signup and profile update', () => {
    expect(
      signupSchema.safeParse({
        full_name: 'Alice Smith',
        phone: '',
        email: 'alice@example.com',
        password: 'password123',
      }).success
    ).toBe(true)

    expect(
      profileSchema.safeParse({
        full_name: 'Alice Smith',
        phone: '',
      }).success
    ).toBe(true)
  })

  it('requires resetPasswordSchema passwords to match', () => {
    const mismatch = resetPasswordSchema.safeParse({
      password: 'newpassword1',
      confirmPassword: 'newpassword2',
    })
    expect(mismatch.success).toBe(false)
  })
})

describe('checkout addressSchema', () => {
  it('accepts a complete valid shipping address', () => {
    const result = addressSchema.safeParse({
      name: 'Fahim Ruddro',
      phone: '+880 1711-000000',
      address: 'House 12, Road 4, Block B',
      city: 'Rajshahi',
      area: 'Shaheb Bazar',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short street addresses and missing city/area', () => {
    const result = addressSchema.safeParse({
      name: 'F',
      phone: '123',
      address: '123',
      city: '',
      area: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('productSchema & image validation', () => {
  const validCategoryId = '550e8400-e29b-41d4-a716-446655440000'

  it('coerces price_dollars and stock strings and validates slug format', () => {
    const result = productSchema.safeParse({
      name: 'Minimalist Backpack',
      slug: 'minimalist-backpack',
      category_id: validCategoryId,
      description: 'Water-resistant daily carry backpack.',
      price_dollars: '49.99',
      stock: '12',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.price_dollars).toBe(49.99)
      expect(result.data.stock).toBe(12)
    }
  })

  it('rejects uppercase/spaced slugs, negative stock, and prices below $0.50', () => {
    const result = productSchema.safeParse({
      name: 'Bad Product',
      slug: 'Invalid Slug!',
      category_id: 'not-a-uuid',
      price_dollars: 0.1,
      stock: -3,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields.slug).toBeDefined()
      expect(fields.category_id).toBeDefined()
      expect(fields.price_dollars).toBeDefined()
      expect(fields.stock).toBeDefined()
    }
  })

  it('validates image MIME types and 2 MB size cap', () => {
    expect(validateImageFile(null)).toBeNull()

    const validWebp = new File([new Uint8Array(1024)], 'photo.webp', {
      type: 'image/webp',
    })
    expect(validateImageFile(validWebp)).toBeNull()

    const badGif = new File([new Uint8Array(1024)], 'anim.gif', {
      type: 'image/gif',
    })
    expect(validateImageFile(badGif)).toMatch(/Invalid file type/i)

    const oversized = new File(
      [new Uint8Array(2 * 1024 * 1024 + 1)],
      'huge.png',
      { type: 'image/png' }
    )
    expect(validateImageFile(oversized)).toMatch(/2 MB/i)
  })
})