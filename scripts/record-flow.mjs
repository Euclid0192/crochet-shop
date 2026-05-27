import { chromium } from 'playwright'
import { join } from 'path'

const SCREENSHOTS_DIR = '/Users/j/crochet-shop/screenshots'
const BASE_URL = 'http://localhost:3000'

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox'],
})

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: SCREENSHOTS_DIR,
    size: { width: 1440, height: 900 },
  },
})

const page = await context.newPage()

async function shot(name) {
  await page.screenshot({ path: join(SCREENSHOTS_DIR, `flow-${name}.png`), fullPage: false })
  console.log(`📸 ${name}`)
}

async function wait(ms) {
  await page.waitForTimeout(ms)
}

console.log('🎬 Starting flow recording...')

// 1. Land on homepage
await page.goto(BASE_URL, { waitUntil: 'networkidle' })
await wait(1500)
await shot('01-homepage')

// 2. Scroll down to product catalog
await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }))
await wait(1000)
await shot('02-catalog')

// 3. Click on first product card (Rainbow Bunny Amigurumi)
const firstProduct = page.locator('a[href^="/products/"]').first()
await firstProduct.click()
await page.waitForURL('**/products/**', { waitUntil: 'networkidle' })
await wait(1200)
await shot('03-product-detail')

// 4. Click Add to Cart
const addToCartBtn = page.getByRole('button', { name: /add to cart/i })
await addToCartBtn.click()
await wait(1000)
await shot('04-cart-drawer-open')

// 5. Click View Full Cart
const viewCartBtn = page.getByRole('link', { name: /view full cart/i })
await viewCartBtn.click()
await page.waitForURL('**/cart', { waitUntil: 'networkidle' })
await wait(1000)
await shot('05-cart-page')

// 6. Proceed to Checkout
const checkoutBtn = page.getByRole('link', { name: /proceed to checkout/i })
await checkoutBtn.click()
await page.waitForURL('**/checkout', { waitUntil: 'networkidle' })
await wait(1000)
await shot('06-checkout-page')

// 7. Fill out shipping form
await page.fill('input[id="name"]', 'Jenny Tran')
await wait(300)
await page.fill('input[id="email"]', 'jenny@example.com')
await wait(300)
await page.fill('input[id="line1"]', '123 Crochet Lane')
await wait(300)
await page.fill('input[id="city"]', 'San Jose')
await wait(300)
await page.fill('input[id="state"]', 'CA')
await wait(300)
await page.fill('input[id="postal_code"]', '95133')
await wait(500)
await shot('07-checkout-filled')

// 8. Submit to Stripe
const continueBtn = page.getByRole('button', { name: /continue to payment/i })
await continueBtn.click()

// Wait for Stripe redirect
try {
  await page.waitForURL('**/checkout.stripe.com/**', { timeout: 15000 })
  await wait(2500)
  await shot('08-stripe-checkout')
} catch {
  // Stripe might use checkout.link.com or similar
  await wait(3000)
  await shot('08-stripe-checkout')
}

console.log('✅ Flow complete!')

await context.close()
await browser.close()

console.log(`\n📁 Screenshots + video saved to: ${SCREENSHOTS_DIR}`)
