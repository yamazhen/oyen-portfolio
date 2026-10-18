import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { createMotion, type MotionInput } from '../../src/scripts/oyen/motion'
import { createPenguin } from '../../src/scripts/oyen/penguin'

const FRAME = 1 / 60

const still: MotionInput = {
  look: { x: 0, y: 0 },
  near: false,
  scrollDelta: 0,
  baseYaw: 0,
}

function setup(reduce = false) {
  const penguin = createPenguin()
  const shadow = new THREE.Object3D()
  const motion = createMotion(penguin, shadow, reduce)
  let t = 0

  const play = (
    seconds: number,
    input: Partial<MotionInput> = {},
    watch: () => void = () => {}
  ) => {
    const end = t + seconds
    while (t < end) {
      t += FRAME
      motion.update(t, FRAME, { ...still, ...input })
      watch()
    }
  }

  return { penguin, shadow, motion, play }
}

describe('oyen motion', () => {
  it('hops off the ground and lands again when he reacts', () => {
    const { penguin, shadow, motion, play } = setup()
    let peak = 0
    let smallestShadow = 1

    motion.react()
    play(1.5, {}, () => {
      peak = Math.max(peak, penguin.root.position.y)
      smallestShadow = Math.min(smallestShadow, shadow.scale.x)
    })

    expect(peak).toBeGreaterThan(0.5)
    expect(smallestShadow).toBeLessThan(1)
    expect(penguin.root.position.y).toBeLessThan(0.1)
  })

  it('does not react when the visitor prefers reduced motion', () => {
    const { penguin, motion, play } = setup(true)

    motion.react()
    play(1.5, {}, () => {
      expect(penguin.root.position.y).toBe(0)
      expect(penguin.head.rotation.z).toBe(0)
    })
  })

  it('waddles while the page scrolls and stands still when it stops', () => {
    const { penguin, play } = setup()
    const rest = penguin.feet.map(({ part }) => part.position.y)
    const highestLift = () =>
      Math.max(...penguin.feet.map(({ part }, i) => part.position.y - rest[i]))
    let lift = 0

    play(1, { scrollDelta: 4 }, () => {
      lift = Math.max(lift, highestLift())
    })
    expect(lift).toBeGreaterThan(0.05)

    play(2)
    expect(highestLift()).toBeLessThan(0.01)
  })

  it('does not waddle on scroll when the visitor prefers reduced motion', () => {
    const { penguin, play } = setup(true)
    const rest = penguin.feet.map(({ part }) => part.position.y)

    play(1, { scrollDelta: 4 }, () => {
      penguin.feet.forEach(({ part }, i) => {
        expect(part.position.y).toBe(rest[i])
      })
    })
  })

  it('turns his head toward the cursor', () => {
    const right = setup()
    right.play(1, { look: { x: 1, y: 0 } })

    const left = setup()
    left.play(1, { look: { x: -1, y: 0 } })

    expect(right.penguin.head.rotation.y).toBeGreaterThan(1)
    expect(left.penguin.head.rotation.y).toBeLessThan(-1)
  })

  it('never looks down, even when the cursor is below him', () => {
    const { penguin, play } = setup()

    play(1, { look: { x: 0, y: 1 } })

    expect(penguin.head.rotation.x).toBeLessThanOrEqual(0)
  })

  it('blinks after a couple of seconds and opens his eyes again', () => {
    const { penguin, play } = setup()
    const eyeOpenness = () => penguin.eyes[0].scale.y

    play(1.9)
    expect(eyeOpenness()).toBe(1)

    play(0.15)
    expect(eyeOpenness()).toBeLessThan(1)

    play(0.3)
    expect(eyeOpenness()).toBe(1)
  })
})
