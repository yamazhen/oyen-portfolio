import { expect, test } from '@playwright/test'

for (const path of ['/favicon.svg', '/favicon.ico', '/sitemap-index.xml']) {
  test(`serves ${path}`, async ({ request }) => {
    expect((await request.get(path)).ok()).toBe(true)
  })
}

test('the link preview image exists and is described', async ({
  page,
  request,
}) => {
  await page.goto('/')
  const image = page.locator('meta[property="og:image"]')
  const alt = page.locator('meta[property="og:image:alt"]')

  const { pathname } = new URL((await image.getAttribute('content'))!)
  expect((await request.get(pathname)).ok()).toBe(true)
  await expect(alt).toHaveAttribute('content', /\S/)
})
