import * as THREE from 'three'
import { CORNER_LAYER, FOV, HALF_FOV } from './common'
import type { World } from './world'

const MAX_PIXEL_RATIO = 2
const CAMERA = { near: 0.1, far: 300, height: 1.3, targetY: 0.7 }
const DISTANCE = { wide: 15.6, narrow: 9.6 }
const WIDE_QUERY = '(min-width: 1101px)'
const WIDE_LAYOUT = { standAcross: 0.5, turn: -0.2 }

const SUN_PLACEMENT = {
  distance: 70,
  height: 9.5,
  wideAcross: 0.72,
  narrowAcross: 0.5,
}

const SCROLLED_AWAY_PX = 60
const NEAR_RADIUS = 1.2
const BODY_HIT = { belowHead: 0.9, radius: 1.9 }

const CORNER_CAMERA = { far: 50, height: 0.9, distance: 9.6, targetY: 0.7 }
const CORNER_FALLBACK_SIZE = { width: 120, height: 146 }
const CORNER_HEAD_HEIGHT = 0.36
const CORNER_NEAR_RADIUS = 0.3

const halfHeightAt = (distance: number) => Math.tan(HALF_FOV) * distance

function makeRenderer(canvas?: HTMLCanvasElement) {
  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_PIXEL_RATIO))
    return renderer
  } catch {
    return null
  }
}

export function createMainView(
  el: HTMLElement,
  { scene, spot, sunDisc }: World,
  headY: number
) {
  const renderer = makeRenderer()
  if (!renderer) return null
  el.appendChild(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(FOV, 1, CAMERA.near, CAMERA.far)
  const layout = { wide: false, ppu: 0, baseYaw: 0 }
  const probe = new THREE.Vector3()

  const resize = () => {
    const width = el.clientWidth
    const height = el.clientHeight
    layout.wide = matchMedia(WIDE_QUERY).matches
    const distance = layout.wide ? DISTANCE.wide : DISTANCE.narrow

    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.position.set(0, CAMERA.height, distance)
    camera.lookAt(0, CAMERA.targetY, 0)
    camera.updateProjectionMatrix()

    const halfWidthAt = (d: number) => halfHeightAt(d) * camera.aspect
    spot.position.x = layout.wide
      ? halfWidthAt(distance) * WIDE_LAYOUT.standAcross
      : 0
    layout.baseYaw = layout.wide ? WIDE_LAYOUT.turn : 0
    layout.ppu = height / (2 * halfHeightAt(distance))
    sunDisc.position.set(
      halfWidthAt(distance + SUN_PLACEMENT.distance) *
        (layout.wide ? SUN_PLACEMENT.wideAcross : SUN_PLACEMENT.narrowAcross),
      SUN_PLACEMENT.height,
      -SUN_PLACEMENT.distance
    )
  }

  function toScreen(x: number, y: number, z: number) {
    probe.set(spot.position.x + x, y, z).project(camera)
    return {
      x: ((probe.x + 1) / 2) * el.clientWidth,
      y: ((1 - probe.y) / 2) * el.clientHeight,
    }
  }

  function headPoint() {
    const box = el.getBoundingClientRect()
    const head = toScreen(0, headY, 0)
    return { x: box.left + head.x, y: box.top + head.y }
  }

  function hits(clientX: number, clientY: number) {
    const head = headPoint()
    const dy = clientY - head.y - layout.ppu * BODY_HIT.belowHead
    return Math.hypot(clientX - head.x, dy) <= layout.ppu * BODY_HIT.radius
  }

  return {
    layout,
    resize,
    toScreen,
    headPoint,
    hits,
    nearRadius: () => layout.ppu * NEAR_RADIUS,
    scrolledAway: () =>
      !layout.wide && el.getBoundingClientRect().bottom < SCROLLED_AWAY_PX,
    render: () => renderer.render(scene, camera),
  }
}

export function createCornerView(
  canvas: HTMLCanvasElement,
  scene: THREE.Scene
) {
  const camera = new THREE.PerspectiveCamera(
    FOV,
    1,
    CAMERA.near,
    CORNER_CAMERA.far
  )
  camera.layers.set(CORNER_LAYER)
  camera.position.set(0, CORNER_CAMERA.height, CORNER_CAMERA.distance)
  camera.lookAt(0, CORNER_CAMERA.targetY, 0)
  let renderer: THREE.WebGLRenderer | null | undefined

  function resize() {
    if (!renderer) return
    const width = canvas.clientWidth || CORNER_FALLBACK_SIZE.width
    const height = canvas.clientHeight || CORNER_FALLBACK_SIZE.height
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  function available() {
    if (renderer === undefined) {
      renderer = makeRenderer(canvas)
      resize()
    }
    return !!renderer
  }

  function headPoint() {
    const box = canvas.getBoundingClientRect()
    return {
      x: box.left + box.width / 2,
      y: box.top + box.height * CORNER_HEAD_HEIGHT,
    }
  }

  return {
    resize,
    available,
    headPoint,
    nearRadius: () => canvas.clientWidth * CORNER_NEAR_RADIUS,
    show: (visible: boolean) => canvas.classList.toggle('show', visible),
    render: () => renderer?.render(scene, camera),
  }
}
