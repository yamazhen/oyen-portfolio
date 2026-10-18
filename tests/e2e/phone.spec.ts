import { expect, test } from '@playwright/test'
import { QUIPS } from '../../src/scripts/oyen/lines'
import { bubble } from './helpers'

const scrollTo = (page: import('@playwright/test').Page, y: 'top' | 'bottom') =>
  page.evaluate(
    (end) => window.scrollTo(0, end ? document.body.scrollHeight : 0),
    y === 'bottom'
  )

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('oyen stands at the top, then waits in the corner once scrolled past', async ({
  page,
}) => {
  const corner = page.locator('#mini')

  await expect(page.locator('#scene')).toBeVisible()
  await expect(corner).not.toHaveClass(/show/)

  await scrollTo(page, 'bottom')
  await expect(corner).toHaveClass(/show/)

  await scrollTo(page, 'top')
  await expect(corner).not.toHaveClass(/show/)
})

test('tapping oyen in the corner makes him talk', async ({ page }) => {
  await scrollTo(page, 'bottom')
  const corner = page.locator('#mini')
  await expect(corner).toHaveClass(/show/)

  await corner.tap()
  await expect(bubble(page)).toHaveText(QUIPS[0])
  await expect(bubble(page)).toHaveClass(/corner/)
  await expect(bubble(page)).toHaveClass(/show/)
})
