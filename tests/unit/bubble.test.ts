import { Window } from 'happy-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBubble } from '../../src/scripts/oyen/bubble'

describe('speech bubble', () => {
  let el: HTMLElement

  beforeEach(() => {
    vi.useFakeTimers()
    el = new Window().document.createElement('div') as unknown as HTMLElement
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const isShown = () => el.classList.contains('show')

  it('shows what oyen says', () => {
    createBubble(el).say('noot.')

    expect(el.textContent).toBe('noot.')
    expect(isShown()).toBe(true)
  })

  it('hides by itself after a while', () => {
    createBubble(el).say('noot.')
    vi.runAllTimers()

    expect(isShown()).toBe(false)
  })

  it('stays up while held', () => {
    createBubble(el).say('noot.', true)
    vi.runAllTimers()

    expect(isShown()).toBe(true)
  })

  it('a held line is not hidden by an earlier timed line', () => {
    const bubble = createBubble(el)
    bubble.say('noot.')
    bubble.say('be nice.', true)
    vi.runAllTimers()

    expect(el.textContent).toBe('be nice.')
    expect(isShown()).toBe(true)
  })

  it('follows a point on screen', () => {
    createBubble(el).pinTo({ x: 120, y: 48 })

    expect(el.style.left).toBe('120px')
    expect(el.style.top).toBe('48px')
  })

  it('moves to the corner, hides, and forgets the point it followed', () => {
    const bubble = createBubble(el)
    bubble.pinTo({ x: 120, y: 48 })
    bubble.say('noot.', true)
    bubble.dock(true)

    expect(el.classList.contains('corner')).toBe(true)
    expect(isShown()).toBe(false)
    expect(el.style.left).toBe('')
    expect(el.style.top).toBe('')
  })

  it('leaves the corner when undocked', () => {
    const bubble = createBubble(el)
    bubble.dock(true)
    bubble.dock(false)

    expect(el.classList.contains('corner')).toBe(false)
  })
})
