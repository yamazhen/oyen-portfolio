import { expect, type Page } from '@playwright/test'

export const GREETING = "hi. i'm oyen."

export const listUnder = (page: Page, heading: string) =>
  page.locator(`h2:text-is("${heading}") + ul`)

export const bubble = (page: Page) => page.locator('#bubble')

export async function waitForGreeting(page: Page) {
  await expect(bubble(page)).toHaveText(GREETING)
}
