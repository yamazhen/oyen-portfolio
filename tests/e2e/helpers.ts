import { expect, type Page } from '@playwright/test'
import { GREETING } from '../../src/scripts/oyen/lines'

export const listUnder = (page: Page, heading: string) =>
  page.locator(`h2:text-is("${heading}") + ul`)

export const bubble = (page: Page) => page.locator('#bubble')

export async function waitForGreeting(page: Page) {
  await expect(bubble(page)).toHaveText(GREETING)
}
