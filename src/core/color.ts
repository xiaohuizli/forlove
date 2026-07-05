export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '').trim()
  const value = /^[0-9a-fA-F]{6}$/.test(normalized) ? normalized : 'ffffff'
  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  ]
}

export function writeColor(colors: Float32Array, index: number, hex: string): void {
  const [r, g, b] = hexToRgb(hex)
  const offset = index * 3
  colors[offset] = r
  colors[offset + 1] = g
  colors[offset + 2] = b
}
