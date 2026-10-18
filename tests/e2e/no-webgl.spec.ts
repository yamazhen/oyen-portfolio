import { expect, test } from '@playwright/test'
import { site } from '../../src/data/site'
import { listUnder } from './helpers'

test.use({
  launchOptions: { args: ['--disable-webgl', '--disable-3d-apis'] },
})

test('the page still works when the browser has no webgl', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#scene')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(site.name)
  await expect(listUnder(page, 'selected work').getByRole('link')).toHaveCount(
    4
  )
})
