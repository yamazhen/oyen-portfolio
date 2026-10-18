const VISIBLE_MS = 2800

export function createBubble(el: HTMLElement) {
  let hideTimer: ReturnType<typeof setTimeout> | undefined

  const hide = () => el.classList.remove('show')

  function say(text: string, hold = false) {
    el.textContent = text
    el.classList.add('show')
    clearTimeout(hideTimer)
    if (!hold) hideTimer = setTimeout(hide, VISIBLE_MS)
  }

  function dock(corner: boolean) {
    hide()
    el.classList.toggle('corner', corner)
    el.style.left = el.style.top = ''
  }

  function pinTo({ x, y }: { x: number; y: number }) {
    el.style.left = `${x}px`
    el.style.top = `${y}px`
  }

  return { say, hide, dock, pinTo }
}
