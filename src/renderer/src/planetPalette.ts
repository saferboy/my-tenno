// Star Chart'dagi CSS planeta sferalari uchun rang uchligi (yorug'/o'rta/qorong'i).
// Design handoff maketidan (13 ta) + ilovaning haqiqiy systemName'lari uchun
// qo'shimcha taxminlar; noma'lum tizim uchun neytral kulrang zaxira ishlatiladi.
const PALETTES: Record<string, [hi: string, mid: string, lo: string]> = {
  Ceres: ['#bfd8e8', '#5a7a94', '#1c2c3c'],
  Earth: ['#9fd8ff', '#2e7bd0', '#0a2a1e'],
  Mars: ['#ffb08a', '#c05a30', '#3a1408'],
  Venus: ['#ffe0a8', '#d09a40', '#4a3008'],
  Mercury: ['#d8d0c8', '#8a7e70', '#2a2420'],
  Jupiter: ['#e8c8a0', '#a07850', '#382410'],
  Saturn: ['#f0dcb0', '#b09860', '#3a2c14'],
  Uranus: ['#b8ecf0', '#50a8b8', '#10343c'],
  Neptune: ['#a8c8ff', '#4060c8', '#101c48'],
  Pluto: ['#d0c8d8', '#786e88', '#241f2e'],
  Eris: ['#c8d4dc', '#70828e', '#1e262c'],
  Sedna: ['#e0a8b8', '#a05068', '#301018'],
  Void: ['#e8e0ff', '#9080c8', '#241c40'],
  Deimos: ['#d8b0c0', '#8a4868', '#2c1420'],
  'Dark Refractory, Deimos': ['#c09098', '#704058', '#20101a'],
  Duviri: ['#ffd8a0', '#d08850', '#3c2010'],
  Europa: ['#d0f0ff', '#78c0d8', '#183038'],
  Höllvania: ['#d8d8d0', '#888078', '#282420'],
  'Kuva Fortress': ['#e8a8a0', '#a04838', '#301410'],
  Lua: ['#e8e8f0', '#a0a0b8', '#282838']
}

const FALLBACK: [string, string, string] = ['#c8d4dc', '#70828e', '#1e262c']

export function getPlanetPalette(systemName: string): [hi: string, mid: string, lo: string] {
  return PALETTES[systemName] ?? FALLBACK
}
