import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { getCollection } from 'astro:content'
import { Window, type Document } from 'happy-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import Home from '../../src/pages/index.astro'

type Ordered = { data: { order: number } }
const inOrder = <T extends Ordered>(entries: T[]) =>
  [...entries].sort((a, b) => a.data.order - b.data.order)

let page: Document

beforeAll(async () => {
  const container = await AstroContainer.create({
    astroConfig: { site: 'https://yamazhen.dev' },
  })
  const html = await container.renderToString(Home)
  const window = new Window()
  page = new window.DOMParser().parseFromString(html, 'text/html')
})

const itemsUnder = (heading: string) => {
  const title = [...page.querySelectorAll('h2')].find(
    (h2) => h2.textContent === heading
  )
  return [...(title?.nextElementSibling?.querySelectorAll('li') ?? [])]
}

const titlesUnder = (heading: string) =>
  itemsUnder(heading).map((li) => li.querySelector('b')?.textContent)

describe('home page', () => {
  it('lists experience in the order it is given', async () => {
    const experience = inOrder(await getCollection('experience'))

    expect(titlesUnder('experience')).toEqual(
      experience.map(({ data }) => data.role)
    )
  })

  it('lists awards in the order they are given', async () => {
    const achievements = inOrder(await getCollection('achievements'))

    expect(titlesUnder('education and awards')).toEqual(
      achievements.map(({ data }) => data.title)
    )
  })

  it('links every project to its own page, in order', async () => {
    const projects = inOrder(await getCollection('projects'))
    const links = itemsUnder('selected work').map((li) => li.querySelector('a'))

    expect(links.map((a) => a?.getAttribute('href'))).toEqual(
      projects.map(({ id }) => `/projects/${id}/`)
    )
    expect(titlesUnder('selected work')).toEqual(
      projects.map(({ data }) => data.title)
    )
  })

  it('marks award-winning projects', async () => {
    const projects = inOrder(await getCollection('projects'))
    const marked = itemsUnder('selected work').map(
      (li) => !!li.querySelector('.win')
    )

    expect(marked).toEqual(projects.map(({ data }) => data.highlight))
  })

  it('gives oyen a line only for entries that have one', async () => {
    const achievements = inOrder(await getCollection('achievements'))
    const lines = itemsUnder('education and awards').map((li) =>
      li.getAttribute('data-say')
    )

    expect(lines).toEqual(achievements.map(({ data }) => data.say ?? null))
  })
})
