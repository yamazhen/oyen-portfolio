import * as THREE from 'three'

export const COLORS = {
  page: 0xeef3f6,
  ink: 0x14202b,
  fur: 0x9a9ea3,
  faceMark: 0x7c7f85,
  cream: 0xf8f3e8,
  sage: 0x9cc59a,
  hood: 0xff7a1a,
  eye: 0x0b1118,
  glint: 0xffffff,
  skyLight: 0xffffff,
  groundLight: 0x9fb4c4,
  sunLight: 0xffffff,
  floe: 0xffffff,
  sea: 0x6fa9cc,
  iceberg: 0xf2f8fc,
  sunDisc: 0xffa550,
}

export const CORNER_LAYER = 1
export const FOV = 32
export const HALF_FOV = THREE.MathUtils.degToRad(FOV / 2)

const MATTE_ROUGHNESS = 0.95

export const matte = (color: number, flatShading = false) =>
  new THREE.MeshStandardMaterial({
    color,
    flatShading,
    roughness: MATTE_ROUGHNESS,
  })
