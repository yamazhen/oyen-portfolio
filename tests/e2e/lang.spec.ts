import { expect, test } from '@playwright/test'
import { ui } from '../../src/data/ui'

test('the korean site is in korean', async ({ page }) => {
  await page.goto('/ko/')

  await expect(page.locator('html')).toHaveAttribute('lang', 'ko')
  await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText(
    ui.ko.experience
  )
})

test('the language menu switches to the same page', async ({ page }) => {
  await page.goto('/en/projects/sdcj/')

  await page.locator('.lang summary').click()
  await page.getByRole('link', { name: '한국어' }).click()

  await expect(page).toHaveURL(/\/ko\/projects\/sdcj\/$/)
})

test('old project links still work', async ({ page }) => {
  await page.goto('/projects/sdcj/')
  await expect(page).toHaveURL(/\/en\/projects\/sdcj\/$/)
})

for (const [locale, lang] of [
  ['en-US', 'en'],
  ['ko-KR', 'ko'],
]) {
  test.describe(`with a ${locale} browser`, () => {
    test.use({ locale })

    test(`the root goes to /${lang}/`, async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveURL(new RegExp(`/${lang}/$`))
    })
  })
}
