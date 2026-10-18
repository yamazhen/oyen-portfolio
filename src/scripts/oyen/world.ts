import * as THREE from 'three'
import { COLORS, CORNER_LAYER, matte } from './common'

const FOG = { near: 20, far: 95 }
const SKY_INTENSITY = 2
const SUN_LIGHT = { intensity: 2.4, position: [3, 5, 4] }
const SEA_LEVEL = -1.55

const SEA = {
  width: 190,
  depth: 100,
  widthSegments: 96,
  depthSegments: 52,
  distance: 34,
  roughness: 0.55,
}

const SWELL = {
  x: { frequency: 0.22, speed: 0.8, height: 0.09 },
  z: { frequency: 0.3, speed: 1.1, height: 0.07 },
}

const ICEBERGS = [
  { x: -16, z: -24, size: 2.2 },
  { x: 10, z: -34, size: 3.2 },
  { x: 23, z: -20, size: 1.8 },
  { x: 32, z: -48, size: 4.6 },
  { x: -30, z: -46, size: 3.6 },
  { x: 15, z: -62, size: 5.2 },
  { x: -4, z: -15, size: 1 },
]

const ICEBERG = {
  stretch: 1.25,
  aboveWater: 0.35,
  tumble: { x: 0.7, y: 1.9, z: 0.4 },
}

const FLOE = {
  topRadius: 2.3,
  bottomRadius: 2.7,
  thickness: 0.5,
  segments: 48,
  y: -1.39,
  depthScale: 0.8,
}

const SHADOW = { radius: 0.88, segments: 24, opacity: 0.14, y: -1.12 }
const SUN_DISC = { radius: 5.5, segments: 48 }

type Swell = typeof SWELL.x

const wave = (offset: number, { frequency, speed, height }: Swell, t: number) =>
  Math.sin(offset * frequency + t * speed) * height

export type World = ReturnType<typeof createWorld>

export function createWorld() {
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(COLORS.page, FOG.near, FOG.far)

  const sky = new THREE.HemisphereLight(
    COLORS.skyLight,
    COLORS.groundLight,
    SKY_INTENSITY
  )
  const sun = new THREE.DirectionalLight(COLORS.sunLight, SUN_LIGHT.intensity)
  sun.position.fromArray(SUN_LIGHT.position)
  sky.layers.enable(CORNER_LAYER)
  sun.layers.enable(CORNER_LAYER)

  const floe = new THREE.Mesh(
    new THREE.CylinderGeometry(
      FLOE.topRadius,
      FLOE.bottomRadius,
      FLOE.thickness,
      FLOE.segments
    ),
    matte(COLORS.floe)
  )
  floe.position.y = FLOE.y
  floe.scale.z = FLOE.depthScale

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(SHADOW.radius, SHADOW.segments),
    new THREE.MeshBasicMaterial({
      color: COLORS.ink,
      transparent: true,
      opacity: SHADOW.opacity,
      depthWrite: false,
    })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = SHADOW.y

  const spot = new THREE.Group()
  spot.add(floe, shadow)

  const seaGeometry = new THREE.PlaneGeometry(
    SEA.width,
    SEA.depth,
    SEA.widthSegments,
    SEA.depthSegments
  )
  seaGeometry.rotateX(-Math.PI / 2)
  seaGeometry.translate(0, 0, -SEA.distance)
  const sea = new THREE.Mesh(
    seaGeometry,
    new THREE.MeshStandardMaterial({
      color: COLORS.sea,
      roughness: SEA.roughness,
    })
  )
  sea.position.y = SEA_LEVEL

  const icebergGeometry = new THREE.IcosahedronGeometry()
  const icebergMaterial = matte(COLORS.iceberg, true)
  const icebergs = ICEBERGS.map(({ x, z, size }, i) => {
    const berg = new THREE.Mesh(icebergGeometry, icebergMaterial)
    berg.scale.set(size, size * ICEBERG.stretch, size)
    berg.position.set(x, SEA_LEVEL + size * ICEBERG.aboveWater, z)
    berg.rotation.set(
      i * ICEBERG.tumble.x,
      i * ICEBERG.tumble.y,
      i * ICEBERG.tumble.z
    )
    return berg
  })

  const sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(SUN_DISC.radius, SUN_DISC.segments),
    new THREE.MeshBasicMaterial({ color: COLORS.sunDisc, fog: false })
  )

  scene.add(sky, sun, spot, sea, ...icebergs, sunDisc)

  const seaPosition = seaGeometry.attributes.position
  function swell(t: number) {
    for (let i = 0; i < seaPosition.count; i++) {
      seaPosition.setY(
        i,
        wave(seaPosition.getX(i), SWELL.x, t) +
          wave(seaPosition.getZ(i), SWELL.z, t)
      )
    }
    seaPosition.needsUpdate = true
    seaGeometry.computeVertexNormals()
  }

  return { scene, spot, shadow, sunDisc, swell }
}
