import * as THREE from 'three'
import { COLORS, CORNER_LAYER, matte } from './common'

type Sided<T> = { part: T; side: number }

export type Penguin = {
  root: THREE.Group
  head: THREE.Group
  eyes: THREE.Group[]
  wings: Sided<THREE.Group>[]
  feet: Sided<THREE.Mesh>[]
}

const SIDES = [-1, 1]
const CROWN_TUFTS = [-1, 0, 1]
const BEVEL_SEGMENTS = 3

const DETAIL = {
  blob: [40, 28],
  face: [48, 32],
  eye: [14, 10],
  glint: [8, 6],
  rim: [16, 56],
  tuft: [16, 10],
} as const

const BODY = { scale: [0.85, 0.8, 0.78], position: [0, -0.3, 0] }
const BELLY = { scale: [0.62, 0.6, 0.42], position: [0, -0.36, 0.44] }
const HEAD = { position: [0, 1.0, 0.1] }
const HOOD = { scale: [0.94, 0.86, 0.88] }

const HOOD_RIM = {
  radius: 0.68,
  tube: 0.11,
  scale: [1.02, 0.92, 1],
  position: [0, -0.04, 0.52],
}

const FACE = { scale: [0.72, 0.64, 0.5], position: [0, -0.04, 0.46] }

const FACE_MARK = {
  bottom: -0.02,
  height: 0.8,
  baseHalfWidth: 0.07,
  widening: 0.45,
  edgeSoftness: 0.012,
}

const BEAK = {
  halfWidth: 0.2,
  length: 0.28,
  thickness: 0.035,
  bevelThickness: 0.015,
  bevelSize: 0.02,
  droop: 0.45,
  position: [0, -0.06, 0.9],
}

const EYE = { radius: 0.085, x: 0.385, y: -0.02, z: 0.87 }
const GLINT = { radius: 0.028, offset: [0.03, 0.035, 0.072] }

const CROWN = {
  radius: 0.09,
  middleHeight: 0.34,
  sideHeight: 0.28,
  curl: 0.13,
  spacing: 0.14,
  middleY: 1.02,
  sideY: 0.96,
  z: 0.05,
  splay: 0.3,
}

const WING = {
  x: 0.55,
  y: 0.3,
  scale: [0.13, 0.42, 0.3],
  hang: 0.38,
  underScale: [0.12, 0.39, 0.27],
  underInset: 0.035,
}

const FOOT = {
  heelHalfWidth: 0.12,
  heelRound: 0.1,
  toes: [
    [0.26, 0.36],
    [0.12, 0.28],
    [0, 0.46],
    [-0.12, 0.28],
    [-0.26, 0.36],
  ],
  thickness: 0.04,
  bevelThickness: 0.02,
  bevelSize: 0.03,
  footprint: 0.75,
  x: 0.28,
  y: -1.0,
  z: 0.18,
  pitch: 0.3,
  turnOut: 0.25,
}

type SlabSize = { thickness: number; bevelThickness: number; bevelSize: number }

const blob = (
  material: THREE.Material,
  scale: number[],
  position: number[] = [0, 0, 0],
  detail: readonly [number, number] = DETAIL.blob
) => {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, ...detail), material)
  mesh.scale.fromArray(scale)
  mesh.position.fromArray(position)
  return mesh
}

const slab = (
  shape: THREE.Shape,
  { thickness, bevelThickness, bevelSize }: SlabSize
) => {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments: BEVEL_SEGMENTS,
  })
  geometry.rotateX(Math.PI / 2)
  geometry.translate(0, thickness / 2, 0)
  return geometry
}

const tuft = (height: number, curl: number) => {
  const geometry = new THREE.ConeGeometry(CROWN.radius, height, ...DETAIL.tuft)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    const along = position.getY(i) / height + 0.5
    position.setX(i, position.getX(i) + curl * along * along)
  }
  geometry.computeVertexNormals()
  return geometry
}

function createFaceMaterial() {
  const material = matte(COLORS.cream)
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      uMarkColor: { value: new THREE.Color(COLORS.faceMark) },
      uMarkBottom: { value: FACE_MARK.bottom },
      uMarkHeight: { value: FACE_MARK.height },
      uMarkBase: { value: FACE_MARK.baseHalfWidth },
      uMarkWidening: { value: FACE_MARK.widening },
      uMarkSoftness: { value: FACE_MARK.edgeSoftness },
    })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vFacePos;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvFacePos = position;'
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vFacePos;
        uniform vec3 uMarkColor;
        uniform float uMarkBottom, uMarkHeight, uMarkBase, uMarkWidening, uMarkSoftness;`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float up = (vFacePos.y - uMarkBottom) / uMarkHeight;
        float edge = uMarkBase + uMarkWidening * up - abs(vFacePos.x);
        float mark = smoothstep(-uMarkSoftness, uMarkSoftness, edge) * step(0.0, vFacePos.z) * step(0.0, up);
        diffuseColor.rgb = mix(diffuseColor.rgb, uMarkColor, mark);`
      )
  }
  return material
}

function createHead(
  cream: THREE.Material,
  sage: THREE.Material,
  hood: THREE.Material
) {
  const head = new THREE.Group()
  head.position.fromArray(HEAD.position)

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(HOOD_RIM.radius, HOOD_RIM.tube, ...DETAIL.rim),
    hood
  )
  rim.scale.fromArray(HOOD_RIM.scale)
  rim.position.fromArray(HOOD_RIM.position)

  const face = blob(
    createFaceMaterial(),
    FACE.scale,
    FACE.position,
    DETAIL.face
  )

  const beakShape = new THREE.Shape([
    new THREE.Vector2(-BEAK.halfWidth, 0),
    new THREE.Vector2(BEAK.halfWidth, 0),
    new THREE.Vector2(0, BEAK.length),
  ])
  const beak = new THREE.Mesh(slab(beakShape, BEAK), sage)
  beak.rotation.x = BEAK.droop
  beak.position.fromArray(BEAK.position)

  const eyeGeometry = new THREE.SphereGeometry(EYE.radius, ...DETAIL.eye)
  const glintGeometry = new THREE.SphereGeometry(GLINT.radius, ...DETAIL.glint)
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: COLORS.eye })
  const glintMaterial = new THREE.MeshBasicMaterial({ color: COLORS.glint })
  const eyes = SIDES.map((side) => {
    const eye = new THREE.Group()
    eye.position.set(side * EYE.x, EYE.y, EYE.z)
    const glint = new THREE.Mesh(glintGeometry, glintMaterial)
    glint.position.fromArray(GLINT.offset)
    eye.add(new THREE.Mesh(eyeGeometry, eyeMaterial), glint)
    return eye
  })

  const crown = CROWN_TUFTS.map((i) => {
    const middle = i === 0
    const tip = new THREE.Mesh(
      tuft(middle ? CROWN.middleHeight : CROWN.sideHeight, i * CROWN.curl),
      sage
    )
    tip.position.set(
      i * CROWN.spacing,
      middle ? CROWN.middleY : CROWN.sideY,
      CROWN.z
    )
    tip.rotation.z = -i * CROWN.splay
    return tip
  })

  head.add(blob(hood, HOOD.scale), rim, face, beak, ...eyes, ...crown)
  return { head, eyes }
}

function createFootGeometry() {
  const web = new THREE.Shape()
  web.moveTo(-FOOT.heelHalfWidth, 0)
  web.quadraticCurveTo(0, -FOOT.heelRound, FOOT.heelHalfWidth, 0)
  FOOT.toes.forEach(([x, y]) => web.lineTo(x, y))
  web.closePath()
  const geometry = slab(web, FOOT)
  geometry.scale(FOOT.footprint, 1, FOOT.footprint)
  return geometry
}

export function createPenguin(): Penguin {
  const fur = matte(COLORS.fur)
  const cream = matte(COLORS.cream)
  const sage = matte(COLORS.sage)
  const hood = matte(COLORS.hood)

  const { head, eyes } = createHead(cream, sage, hood)

  const wings = SIDES.map((side) => {
    const part = new THREE.Group()
    part.position.set(side * WING.x, WING.y, 0)
    part.add(
      blob(fur, WING.scale, [0, -WING.hang, 0]),
      blob(cream, WING.underScale, [-side * WING.underInset, -WING.hang, 0])
    )
    return { part, side }
  })

  const footGeometry = createFootGeometry()
  const feet = SIDES.map((side) => {
    const part = new THREE.Mesh(footGeometry, sage)
    part.position.set(side * FOOT.x, FOOT.y, FOOT.z)
    part.rotation.set(FOOT.pitch, side * FOOT.turnOut, 0)
    return { part, side }
  })

  const root = new THREE.Group()
  root.add(
    blob(fur, BODY.scale, BODY.position),
    blob(cream, BELLY.scale, BELLY.position),
    head,
    ...wings.map(({ part }) => part),
    ...feet.map(({ part }) => part)
  )
  root.traverse((part) => part.layers.enable(CORNER_LAYER))

  return { root, head, eyes, wings, feet }
}
