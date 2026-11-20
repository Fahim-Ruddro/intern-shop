import { test, expect } from '@playwright/test'
import Stripe from 'stripe'

const TEST_EMAIL = process.env.E2E_USER_EMAIL
const TEST_PASSWORD = process.env.E2E_USER_PASSWORD
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

test.describe('End-to-End Storefront Checkout Flow', () => {
  test.skip(
    !TEST_EMAIL ||
      !TEST_PASSWORD ||
      !STRIPE_SECRET_KEY ||
      !STRIPE_WEBHOOK_SECRET,
    'Requires E2E_USER_EMAIL, E2E_USER_PASSWORD, STRIPE_SECRET_KEY, and STRIPE_WEBHOOK_SECRET.'
  )

  test('search -> product -> add to cart -> log in -> checkout with test card -> order appears in order history', async ({
    page,
    request,
    baseURL,
  }) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY!)

    // 1. Search / browse in-stock products
    await page.goto('/search?inStock=true')
    const firstProductCard = page.locator('a[href^="/products/"]').first()
    await expect(firstProductCard).toBeVisible()

    const productName = (
      await firstProductCard.locator('h2').innerText()
    ).trim()

    // 2. Open product detail page
    await firstProductCard.click()
    await expect(page).toHaveURL(/\/products\//)
    await expect(page.getByRole('heading', { name: productName })).toBeVisible()

    // 3. Add product to cart as a guest
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i })
    await expect(addToCartBtn).toBeEnabled()
    await addToCartBtn.click()
    await expect(page.getByText(/in cart/i)).toBeVisible()

    // 4. Go to cart and proceed to login
    await page.goto('/cart')
    await expect(page.getByRole('link', { name: productName })).toBeVisible()
    await page.getByRole('link', { name: /log in to checkout/i }).click()

    // 5. Log in (guest cart merges into DB cart)
    await expect(page).toHaveURL(
      /\/login\?next=%2Fcheckout|\/login\?next=\/checkout/
    )
    await page.getByLabel('Email').fill(TEST_EMAIL!)
    await page.getByLabel('Password').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: /^log in$/i }).click()

    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 20_000,
    })

    // 6. Wait until /checkout is fully rendered with the merged DB cart (re-clicking Proceed if bounced to /cart)
    const payButton = page.getByRole('button', { name: /pay with stripe/i })
    await expect(async () => {
      if (new URL(page.url()).pathname === '/cart') {
        const proceedLink = page.getByRole('link', {
          name: /proceed to checkout/i,
        })
        await expect(proceedLink).toBeVisible({ timeout: 2_000 })
        await proceedLink.click()
      }
      await expect(page).toHaveURL(/\/checkout$/, { timeout: 3_000 })
      await expect(payButton).toBeVisible({ timeout: 3_000 })
    }).toPass({ timeout: 25_000, intervals: [1_000] })

    await expect(page.getByText(productName)).toBeVisible()

    // If a saved-address selector is rendered instead of the blank form, reveal the new address form
    const addNewAddressBtn = page.getByRole('button', {
      name: /add a new address|new address|enter new address/i,
    })
    if (await addNewAddressBtn.isVisible().catch(() => false)) {
      await addNewAddressBtn.click()
    }

    const fullNameInput = page.getByLabel('Full Name')
    if (await fullNameInput.isVisible().catch(() => false)) {
      await fullNameInput.fill('Playwright E2E Buyer')
      await page.getByLabel('Phone Number').fill('+1 555 234 5678')
      await page.getByLabel('Street Address').fill('742 Evergreen Terrace')
      await page.getByLabel('City').fill('Springfield')
      await page.getByLabel('Area / District').fill('Downtown')
    }

    // 7. Intercept redirect to Stripe Hosted Checkout, verify the real Stripe session,
    // and send a cryptographically signed checkout.session.completed webhook to our API
    let capturedStripeUrl = ''
    await page.route('https://checkout.stripe.com/**', async (route) => {
      capturedStripeUrl = route.request().url()
      await route.abort()
    })

    await payButton.click()

    await expect
      .poll(() => capturedStripeUrl, { timeout: 20_000 })
      .toContain('https://checkout.stripe.com/')

    await page.unroute('https://checkout.stripe.com/**')

    const sessionIdMatch = capturedStripeUrl.match(/(cs_test_[a-zA-Z0-9]+)/)
    expect(sessionIdMatch).not.toBeNull()
    const sessionId = sessionIdMatch![1]

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    expect(session.metadata?.user_id).toBeTruthy()
    expect(session.metadata?.address_id).toBeTruthy()

    const webhookPayload = JSON.stringify({
      id: `evt_test_${Date.now()}`,
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          ...session,
          payment_status: 'paid',
          status: 'complete',
        },
      },
    })

    const signature = stripe.webhooks.generateTestHeaderString({
      payload: webhookPayload,
      secret: STRIPE_WEBHOOK_SECRET!,
    })

    const webhookRes = await request.post(`${baseURL}/api/webhooks/stripe`, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      data: webhookPayload,
    })
    expect(webhookRes.status()).toBe(200)

    // 8. Navigate to /checkout/success, verify the DB order link was resolved, and confirm in order history
    await page.goto(`/checkout/success?session_id=${sessionId}`)
    const viewOrderLink = page.getByRole('link', {
      name: /view order details/i,
    })
    await expect(viewOrderLink).toBeVisible()
    await expect(viewOrderLink).toHaveAttribute('href', /\/account\/orders\/.+/)

    await viewOrderLink.click()
    await expect(page).toHaveURL(/\/account\/orders\/.+/)
    await expect(page.getByText(productName)).toBeVisible()

    // Also verify the order appears in the /account/orders list
    await page.goto('/account/orders')
    await expect(page).toHaveURL(/\/account\/orders/)
    await expect(page.locator('a[href^="/account/orders/"]').first()).toBeVisible()
  })
})