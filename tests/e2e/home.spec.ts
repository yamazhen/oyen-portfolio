import { expect, test } from '@playwright/test'
import { site } from '../../src/data/site'
import { bubble, listUnder, waitForGreeting } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('shows who bowen is and every section', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(site.name)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'experience',
    'selected work',
    'education and awards',
    'skills',
    'about',
  ])
})

test('links to bowen elsewhere', async ({ page }) => {
  for (const { label, url } of site.links) {
    await expect(
      page.getByRole('link', { name: label, exact: true })
    ).toHaveAttribute('href', url)
  }
})

test('lists the selected projects in order, each linking to its page', async ({
  page,
}) => {
  const projects = listUnder(page, 'selected work').getByRole('link')

  await expect(projects).toContainText([
    'OID4VC for EDC',
    'SDCJ Extension',
    'Soma',
    'Breeze',
    'oyen.nvim',
  ])
  for (const [i, id] of [
    'oid4vc',
    'sdcj',
    'soma',
    'breeze',
    'oyen-nvim',
  ].entries()) {
    await expect(projects.nth(i)).toHaveAttribute('href', `/projects/${id}/`)
  }
})

test('oyen greets visitors and then goes quiet', async ({ page }) => {
  await waitForGreeting(page)
  await expect(bubble(page)).toHaveClass(/show/)
  await expect(bubble(page)).not.toHaveClass(/show/)
})

test('oyen comments on an experience row while it is hovered', async ({
  page,
}) => {
  await waitForGreeting(page)
  const row = listUnder(page, 'experience').getByRole('listitem').first()

  await row.hover()
  await expect(bubble(page)).toHaveText((await row.getAttribute('data-say'))!)
  await expect(bubble(page)).toHaveClass(/show/)

  await page.getByRole('heading', { level: 1 }).hover()
  await expect(bubble(page)).not.toHaveClass(/show/)
})

test('oyen comments on a project while it is hovered', async ({ page }) => {
  await waitForGreeting(page)
  const project = listUnder(page, 'selected work').getByRole('link').first()

  await project.hover()
  await expect(bubble(page)).toHaveText(
    (await project.getAttribute('data-say'))!
  )
  await expect(bubble(page)).toHaveClass(/show/)
})

test.describe('when the visitor prefers reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('oyen still greets and comments', async ({ page }) => {
    await waitForGreeting(page)
    const project = listUnder(page, 'selected work').getByRole('link').first()

    await project.hover()
    await expect(bubble(page)).toHaveText(
      (await project.getAttribute('data-say'))!
    )
  })
})
