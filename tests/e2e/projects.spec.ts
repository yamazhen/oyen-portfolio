import { expect, test } from '@playwright/test'
import { site } from '../../src/data/site'
import { listUnder } from './helpers'

test('opening a project from the home page shows its page', async ({
  page,
}) => {
  await page.goto('/')
  const project = listUnder(page, 'selected work').getByRole('link').nth(1)
  const title = await project.locator('b').textContent()

  await project.click()

  await expect(page).toHaveURL(/\/projects\/sdcj\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title!)
})

test('a project page leads back home', async ({ page }) => {
  await page.goto('/projects/sdcj/')

  await page.getByRole('link', { name: `← ${site.name}` }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(site.name)
})

test('moves between projects in order', async ({ page }) => {
  await page.goto('/projects/sdcj/')

  await page.getByRole('link', { name: /next/ }).click()
  await expect(page).toHaveURL(/\/projects\/soma\/$/)

  await page.getByRole('link', { name: /previous/ }).click()
  await expect(page).toHaveURL(/\/projects\/sdcj\/$/)
})

test('the first and last projects only offer the way that exists', async ({
  page,
}) => {
  await page.goto('/projects/oid4vc/')
  await expect(page.getByRole('link', { name: /previous/ })).toHaveCount(0)

  await page.goto('/projects/breeze/')
  await expect(page.getByRole('link', { name: /next/ })).toHaveCount(0)
})
