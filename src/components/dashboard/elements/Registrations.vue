<script setup>
  import { computed } from "vue"
  import PiePanel from "../common/PiePanel.vue"
  import { usePieOptions } from "../common/usePieOptions"

  const props = defineProps({
    data: { type: Array, default: () => [] },
    locale: { type: String, default: "en" },
    t:{ type: Function}
  })

  const rows = computed(() => props.data)
  const { options } = usePieOptions()
  // Status colors
  const STATUS_COLORS = {
    7: "#3B82F6",  // draft
    8: "#f28e2b",  // candidate
    9: "#EF4444",  // rejected
    10: "#22C55E", // accepted
    27: "#15803D", // payment received
  }
  const FALLBACK_COLOR = "#9CA3AF"
  const STATUS_ORDER = [7, 8, 10, 27, 9] // draft → candidate → accepted → paid → rejected

  const expoTitle = (r) => (r[`short_${props.locale}`]) ?? `Expo ${r.idExpo}`
  const statusTitle = (r) => (r[`title_${props.locale}`]) ?? `Status ${r.idStatus}`

  const groupedByExpo = computed(() => {
    const map = new Map()
    for (const r of rows.value) {
      if (!map.has(r.idExpo)) map.set(r.idExpo, [])
      map.get(r.idExpo).push(r)
    }
    // Sort expos by startDate DESC (as requested in SQL ORDER BY)
    return Array.from(map.entries())
      .map(([idExpo, items]) => ({ idExpo, items }))
      .sort((a, b) => new Date(b.items[0].startDate) - new Date(a.items[0].startDate))
  })
  const pies = computed(() =>
    groupedByExpo.value.map(({ idExpo, items }) => {
      const byStatus = new Map(items.map((r) => [Number(r.idStatus), r]))
      const ordered = STATUS_ORDER.filter((id) => byStatus.has(id)).map((id) => byStatus.get(id))
      const expoTotal = ordered.reduce((sum, r) => sum + Number(r.nb_reg || 0), 0)
      return {
        id: `expo_${idExpo}`,
        title: expoTitle(items[0]),
        badge: { color: "positive", label: expoTotal }, // per-expo total
        chartData: {
          labels: ordered.map(statusTitle),
          datasets: [
            {
              data: ordered.map((r) => Number(r.nb_reg || 0)),
              backgroundColor: ordered.map((r) => STATUS_COLORS[Number(r.idStatus)] ?? FALLBACK_COLOR),
              borderWidth: 1,
            },
          ],
        },
      }
    })
  )
  // Shared legend (static, matches color semantics)
  const legendItems = computed(() => [
    { id: 7,  label: props.t("comps.list_items.actions_menu.booking.draft"),color: STATUS_COLORS[7] },
    { id: 8,  label:props.t("comps.list_items.actions_menu.booking.candidate"),color: STATUS_COLORS[8] },
    { id: 10, label:props.t("comps.list_items.actions_menu.booking.accepted"),color: STATUS_COLORS[10] },
    { id: 27, label:props.t("comps.list_items.actions_menu.booking.payment"),color: STATUS_COLORS[27] },
    { id: 9,  label:props.t("comps.list_items.actions_menu.booking.rejected"),color: STATUS_COLORS[9] },
  ])
</script>

<template>
  <PiePanel
    :title="$t('comps.dashboard.registrations.title')"
    :pies="pies"
    :legend-items="legendItems"
    :options="options"
    :pie-size="250"
  />
</template>
