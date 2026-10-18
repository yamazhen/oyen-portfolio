import * as THREE from 'three'
import { createBubble } from './bubble'
import { createMotion } from './motion'
import { createPenguin } from './penguin'
import { createCornerView, createMainView } from './views'
import { createWorld } from './world'

const GREETING = { text: "hi. i'm oyen.", delayMs: 900 }
const QUIPS = ['noot!', 'my name is oyen', 'hehe', 'hmm?']
const MAX_FRAME_SECONDS = 0.05
const SPEECH_ANCHOR = { x: -0.85, aboveCentre: 1.75, z: 0.5 }

const sceneEl = document.getElementById('scene')
const bubbleEl = document.getElementById('bubble')!
const miniEl = document.getElementById('mini') as HTMLCanvasElement
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

function start() {
  const world = createWorld()
  const penguin = createPenguin()
  world.spot.add(penguin.root)

  const main =
    sceneEl && createMainView(sceneEl, world, penguin.head.position.y)
  if (sceneEl && !main) {
    sceneEl.remove()
    return
  }

  const corner = createCornerView(miniEl, world.scene)
  const bubble = createBubble(bubbleEl)
  const motion = createMotion(penguin, world.shadow, reduce)
  const timer = new THREE.Timer()
  const look = { x: 0, y: 0 }
  let inCorner = false
  let lastScroll = scrollY
  let quip = 0

  const activeView = () => (inCorner || !main ? corner : main)

  const resize = () => {
    main?.resize()
    corner.resize()
  }

  const sayQuip = () => {
    bubble.say(QUIPS[quip++ % QUIPS.length])
    motion.react()
  }

  addEventListener('resize', resize)

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    const head = activeView().headPoint()
    look.x = THREE.MathUtils.clamp((e.clientX - head.x) / innerWidth, -1, 1)
    look.y = THREE.MathUtils.clamp((e.clientY - head.y) / innerHeight, -1, 1)
  })

  document.querySelectorAll<HTMLElement>('[data-say]').forEach((el) => {
    const show = () => {
      bubble.say(el.dataset.say!, true)
      motion.react()
    }
    el.addEventListener('mouseenter', show)
    el.addEventListener('focus', show)
    el.addEventListener('mouseleave', bubble.hide)
    el.addEventListener('blur', bubble.hide)
  })

  sceneEl?.addEventListener('click', (e) => {
    if (main?.hits(e.clientX, e.clientY)) sayQuip()
  })
  miniEl.addEventListener('click', sayQuip)

  if (main) setTimeout(() => bubble.say(GREETING.text), GREETING.delayMs)

  function frame() {
    requestAnimationFrame(frame)
    timer.update()
    const dt = Math.min(timer.getDelta(), MAX_FRAME_SECONDS)
    const t = timer.getElapsed()
    const scrollDelta = scrollY - lastScroll
    lastScroll = scrollY

    motion.update(t, dt, {
      look,
      scrollDelta,
      baseYaw: main?.layout.baseYaw ?? 0,
    })

    const showCorner = (!main || main.scrolledAway()) && corner.available()
    if (showCorner !== inCorner) {
      inCorner = showCorner
      corner.show(inCorner)
      bubble.dock(inCorner)
    }
    if (inCorner) {
      corner.render()
      return
    }
    if (!main) return

    if (!reduce) world.swell(t)
    bubble.pinTo(
      main.toScreen(
        SPEECH_ANCHOR.x,
        penguin.root.position.y + SPEECH_ANCHOR.aboveCentre,
        SPEECH_ANCHOR.z
      )
    )
    main.render()
  }

  resize()
  frame()
}

start()
