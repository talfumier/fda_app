<script setup>
  import { computed } from "vue"
  import _ from "lodash"
  import PiePanel from "../common/PiePanel.vue"
  import { usePieOptions } from "../common/usePieOptions"
  import { useStableColorMap } from "../common/useStableColorMap"

  const props = defineProps({
    data: { type: Array, default: () => [] },
    locale: { type: String, default: "en" },
    t:{ type: Function}
  })

  const rows = computed(() => props.data)
  const { options } = usePieOptions()
  const { colorMap: domainColorMap } = useStableColorMap(rows, (r) => r.idDomain)
  // 0 = classic, 1 = modern
  const typeKey = (v) => (Number(v) === 0 ? "classic" : "modern")
  const typeLabel = (k) =>
    k === "classic"? props.t('comps.dashboard.oeuvres.classic'): props.t('comps.dashboard.oeuvres.modern')
  const domainLabel = (r) => r[`domain_${props.locale}`] ?? `Domain ${r.idDomain}`

  const total = computed(() =>
    rows.value.reduce((s, r) => s + (Number(r.nb_oeuvres) || 0), 0)
  )
  const totalsByType = computed(() => {
    const t = { classic: 0, modern: 0 }
    for (const r of rows.value) t[typeKey(r.classic_modern)] += Number(r.nb_oeuvres) || 0
    return t
  })
  const totalsByDomain = computed(() => {
    const acc = new Map()
    for (const r of rows.value) {
      const id = Number(r.idDomain)
      const count = Number(r.nb_oeuvres) || 0
      if (!acc.has(id)) acc.set(id, { idDomain: id, label: domainLabel(r), total: 0 })
      acc.get(id).total += count
    }
    return Array.from(acc.values()).sort((a, b) => a.idDomain - b.idDomain)
  })

  const TYPE_COLORS = {
    classic: "#374151",
    modern: "#9CA3AF",
  }
  const legendItems = computed(() => [
    {
      id: "classic",
      label: _.capitalize(typeLabel("classic")),
      color: TYPE_COLORS.classic,
    },
    {
      id: "modern",
      label: _.capitalize(typeLabel("modern")),
      color: TYPE_COLORS.modern,
    },
    ...totalsByDomain.value.map((d) => ({
      id: d.idDomain,
      label: _.capitalize(d.label),
      color: domainColorMap.value[d.idDomain],
    })),
  ])
  const typeChartData = computed(() => ({
    labels: [typeLabel("classic"), typeLabel("modern")],
    datasets: [
      {
        data: [totalsByType.value.classic, totalsByType.value.modern],
        backgroundColor: [TYPE_COLORS.classic,TYPE_COLORS.modern],
        borderWidth: 1,
      },
    ],
  }))
  const domainChartData = computed(() => ({
    labels: totalsByDomain.value.map((d) => d.label),
    datasets: [
      {
        data: totalsByDomain.value.map((d) => d.total),
        backgroundColor: totalsByDomain.value.map((d) => domainColorMap.value[d.idDomain]),
        borderWidth: 1,
      },
    ],
  }))
  const pies = computed(() => [
    {
      id: "type",
      title: props.t('comps.dashboard.oeuvres.classic_modern'),
      chartData: typeChartData.value,
    },
    {
      id: "domain",
      title: props.t('comps.dashboard.oeuvres.domain_title'),
      chartData: domainChartData.value,
    },
  ])
</script>

<template>
  <PiePanel
    :title="$t('comps.dashboard.oeuvres.title')"
    :total="total"
    :pies="pies"
    :legend-items="legendItems"
    :options="options"
    :pie-size="250"
  />
</template>
