import * as THREE from 'three'
import type { Penguin } from './penguin'

const REACTION_SECONDS = {
  wave: 1.6,
  tilt: 1.6,
  look: 1.8,
  flap: 1.0,
  sway: 1.4,
  curious: 2.0,
}

type Act = keyof typeof REACTION_SECONDS
type Oscillation = { speed: number; amount: number }

const REACTIONS: (Act | 'hop')[] = [
  'hop',
  'wave',
  'tilt',
  'look',
  'flap',
  'sway',
]

const CENTRE_TO_FEET = 1.1
const FOLLOW = { head: 0.12, body: 0.06, lean: 0.1 }
const ENVELOPE = { rise: 0.25, fall: 0.35 }

const CURIOSITY = {
  firstDelay: 4,
  firstJitter: 4,
  delay: 5,
  jitter: 6,
  quietWindow: 2,
  quietAfterReaction: 3,
  maxWalk: 0.05,
}

const HOP = {
  crouchSeconds: 0.12,
  launchSpeed: 5.2,
  gravity: 16,
  landSeconds: 0.22,
  squash: 0.08,
  bulge: 0.5,
}

const IDLE = {
  headRoll: { speed: 0.8, amount: 0.06 },
  bob: { speed: 2.2, amount: 0.025 },
  rock: { speed: 1.6, amount: 0.035 },
}

const LOOK = {
  yaw: 1.5,
  pitch: 0.8,
  bodyTurn: 0.5,
  nearYaw: -0.95,
  nearPitch: -0.28,
}

const TILT = { roll: 0.4, yaw: 0.18, chinUp: 0.12 }
const SWAY = { cycles: 2, roll: 0.12, headLag: 0.6 }
const LOOK_AROUND = { cycles: 1, yaw: 0.75 }

const WAVE = {
  headRoll: 0.15,
  bodyLean: 0.05,
  raise: 0.6,
  beat: { speed: 9, amount: 0.22 },
}

const FLAP = { raise: 0.35, beat: { speed: 11, amount: 0.3 }, bob: 0.035 }

const WINGS = {
  rest: 0.95,
  jumpSpread: 0.6,
  spreadPerHeight: 2.2,
  flutter: { speed: 30, amount: 0.15 },
}

const WALK = {
  stepSpeed: 7,
  lingerSeconds: 0.18,
  easeIn: 0.25,
  easeOut: 0.08,
  footLift: 0.16,
  stride: 0.07,
  bounce: 0.05,
  rock: 0.13,
}

const LEAN = { perPixel: 0.006, max: 0.2 }
const SHADOW = { shrinkPerHeight: 0.35, maxShrink: 0.5 }

const BLINK = {
  firstAt: 2,
  seconds: 0.12,
  interval: 2.5,
  jitter: 3,
  closed: 0.1,
}

const { lerp, clamp } = THREE.MathUtils
const smooth = (x: number) => THREE.MathUtils.smoothstep(x, 0, 1)
const oscillate = (t: number, { speed, amount }: Oscillation) =>
  Math.sin(t * speed) * amount
const cycle = (progress: number, cycles: number) =>
  Math.sin(progress * Math.PI * 2 * cycles)
const later = (base: number, jitter: number) => base + Math.random() * jitter
const randomSide = () => (Math.random() < 0.5 ? -1 : 1)

export type MotionInput = {
  look: { x: number; y: number }
  near: boolean
  scrollDelta: number
  baseYaw: number
}

export function createMotion(
  { root, head, eyes, wings, feet }: Penguin,
  shadow: THREE.Object3D,
  reduce: boolean
) {
  const footRest = feet.map(({ part }) => part.position.clone())

  let now = 0
  let act: Act | null = null
  let actStart = 0
  let actSide = 1
  let reaction = 0
  let nextCurious = later(CURIOSITY.firstDelay, CURIOSITY.firstJitter)
  let height = 0
  let velocity = 0
  let crouchUntil = 0
  let landedAt = -Infinity
  let walk = 0
  let phase = 0
  let walkUntil = 0
  let nextBlink = BLINK.firstAt
  let blinkEnd = 0

  function hop() {
    if (height > 0 || velocity > 0 || crouchUntil) return
    crouchUntil = now + HOP.crouchSeconds
  }

  function perform(name: Act | 'hop') {
    if (reduce) return
    if (name === 'hop') return hop()
    act = name
    actStart = now
    actSide = randomSide()
  }

  const react = () => perform(REACTIONS[reaction++ % REACTIONS.length])

  function reactionProgress(t: number) {
    if (!act && height === 0 && walk < CURIOSITY.maxWalk && t > nextCurious) {
      perform('curious')
    }
    if (act && act !== 'curious' && t > nextCurious - CURIOSITY.quietWindow) {
      nextCurious = t + CURIOSITY.quietAfterReaction
    }
    if (!act) return 0
    const progress = (t - actStart) / REACTION_SECONDS[act]
    if (progress < 1) return progress
    if (act === 'curious') {
      nextCurious = t + later(CURIOSITY.delay, CURIOSITY.jitter)
    }
    act = null
    return 0
  }

  function updateHop(t: number, dt: number) {
    if (crouchUntil && t >= crouchUntil) {
      crouchUntil = 0
      velocity = HOP.launchSpeed
    }
    if (height > 0 || velocity > 0) {
      velocity -= HOP.gravity * dt
      height = Math.max(0, height + velocity * dt)
      if (height === 0) {
        velocity = 0
        landedAt = t
      }
    }
    const crouch = crouchUntil
      ? smooth(1 - (crouchUntil - t) / HOP.crouchSeconds)
      : 0
    const sinceLanding = t - landedAt
    const land =
      sinceLanding < HOP.landSeconds
        ? Math.sin((Math.PI * sinceLanding) / HOP.landSeconds)
        : 0
    return 1 - HOP.squash * Math.max(crouch, land)
  }

  function updateWalk(t: number, dt: number, scrollDelta: number) {
    if (scrollDelta !== 0) walkUntil = t + WALK.lingerSeconds
    const moving = t < walkUntil && !reduce
    if (moving) phase += dt * WALK.stepSpeed
    walk = lerp(walk, moving ? 1 : 0, moving ? WALK.easeIn : WALK.easeOut)
    const step = Math.sin(phase)
    feet.forEach(({ part, side }, i) => {
      const lift = Math.max(0, side * step)
      part.position.y = footRest[i].y + lift * WALK.footLift * walk
      part.position.z =
        footRest[i].z - side * Math.cos(phase) * WALK.stride * walk
    })
    return step
  }

  function updateBlink(t: number) {
    if (t > nextBlink) {
      blinkEnd = t + BLINK.seconds
      nextBlink = t + later(BLINK.interval, BLINK.jitter)
    }
    eyes.forEach((eye) => {
      eye.scale.y = t < blinkEnd ? BLINK.closed : 1
    })
  }

  function update(
    t: number,
    dt: number,
    { look, near, scrollDelta, baseYaw }: MotionInput
  ) {
    now = t
    const progress = reactionProgress(t)
    const env = act
      ? smooth(progress / ENVELOPE.rise) *
        smooth((1 - progress) / ENVELOPE.fall)
      : 0
    const amount = (...names: Act[]) => (act && names.includes(act) ? env : 0)
    const idle = (o: Oscillation) => (reduce ? 0 : oscillate(t, o))

    const squash = updateHop(t, dt)
    const step = updateWalk(t, dt, scrollDelta)
    const tilting = amount('tilt', 'curious')
    const waving = amount('wave')
    const flapping = amount('flap')
    const sway = cycle(progress, SWAY.cycles) * SWAY.roll * amount('sway')
    const lookAround =
      cycle(progress, LOOK_AROUND.cycles) * LOOK_AROUND.yaw * amount('look')

    const headYaw =
      (near ? LOOK.nearYaw : look.x * LOOK.yaw) +
      lookAround +
      actSide * tilting * TILT.yaw
    const headPitch =
      (near ? LOOK.nearPitch : Math.min(0, look.y * LOOK.pitch)) -
      tilting * TILT.chinUp
    head.rotation.y = lerp(head.rotation.y, headYaw, FOLLOW.head)
    head.rotation.x = lerp(head.rotation.x, headPitch, FOLLOW.head)
    head.rotation.z =
      idle(IDLE.headRoll) +
      actSide * (tilting * TILT.roll + waving * WAVE.headRoll) -
      sway * SWAY.headLag

    root.rotation.y = lerp(
      root.rotation.y,
      baseYaw + look.x * LOOK.bodyTurn,
      FOLLOW.body
    )
    root.rotation.z =
      idle(IDLE.rock) * (1 - walk) +
      step * WALK.rock * walk +
      sway -
      actSide * waving * WAVE.bodyLean
    root.rotation.x = lerp(
      root.rotation.x,
      clamp(scrollDelta * LEAN.perPixel, -LEAN.max, LEAN.max),
      FOLLOW.lean
    )

    const bulge = 1 + (1 - squash) * HOP.bulge
    root.scale.set(bulge, squash, bulge)
    root.position.set(
      -CENTRE_TO_FEET * Math.sin(root.rotation.z),
      height +
        idle(IDLE.bob) * (1 - walk) +
        Math.abs(Math.cos(phase)) * WALK.bounce * walk +
        Math.abs(Math.sin(t * FLAP.beat.speed)) * FLAP.bob * flapping -
        CENTRE_TO_FEET * (1 - squash),
      CENTRE_TO_FEET * Math.sin(root.rotation.x)
    )

    const spread = Math.min(1, height * WINGS.spreadPerHeight)
    const flutter = height > 0 ? oscillate(t, WINGS.flutter) : 0
    wings.forEach(({ part, side }) => {
      const extra =
        waving && side === actSide
          ? (WAVE.raise + oscillate(t - actStart, WAVE.beat)) * waving
          : (FLAP.raise + oscillate(t, FLAP.beat)) * flapping
      part.rotation.z =
        side * (WINGS.rest + spread * WINGS.jumpSpread + flutter + extra)
    })

    shadow.scale.setScalar(
      1 - Math.min(SHADOW.maxShrink, height * SHADOW.shrinkPerHeight)
    )
    updateBlink(t)
  }

  return { react, update }
}
