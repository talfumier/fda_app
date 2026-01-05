import { computed } from 'vue'
export const defaultPalette = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc949',
  '#af7aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ab',
]
export function useStableColorMap(rows, getId, palette = defaultPalette) {
  const colorMap = computed(() => {
    const ids = Array.from(new Set(rows.value.map((r) => Number(getId(r))))).sort((a, b) => a - b)
    const map = {}
    ids.forEach((id, idx) => (map[id] = palette[idx % palette.length]))
    return map
  })
  return { colorMap }
}
