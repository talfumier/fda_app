<script setup>
  import { computed } from "vue"
  import _ from "lodash"
  import PiePanel from "../common/PiePanel.vue"
  import { usePieOptions } from "../common/usePieOptions"
  import { useStableColorMap } from "../common/useStableColorMap"

  const props = defineProps({
    data: { type: Array, default: () => [] },
    locale: { type: String, default: "en" },
  })

  const rows = computed(() => props.data)
  const { options } = usePieOptions()
  const { colorMap: roleColorMap } = useStableColorMap(rows, (r) => r.idRole)

  const totals = computed(() => {
    let total = 0
    const byStatus = rows.value.reduce((acc, r) => {
      const count = Number(r.nb_users) || 0
      acc[r.idStatus] = (acc[r.idStatus] || 0) + count
      total += count
      return acc
    }, {})
    return { byStatus, total }
  })
  // one shared legend (all roles, stable order)
  const legendItems = computed(() => {
    const map = new Map() // idRole -> label
    for (const r of rows.value) {
      const idRole = Number(r.idRole)
      const label = r[`role_${props.locale}`] ?? `Role ${idRole}`
      map.set(idRole, label)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([idRole, label]) => ({
        id: idRole,
        label: _.capitalize(label),
        color: roleColorMap.value[idRole],
      }))
  })
  const statusTitle = (items, idStatus) =>
    items[0]?.[`title_${props.locale}`] ?? `Status ${idStatus}`

  const statusColor = (idStatus) =>
    idStatus === 1 ? "negative" : idStatus === 3 ? "warning" : "positive"

  const statusTitleStyle = (idStatus) => ({
    color: idStatus === 1 ? "red" : idStatus === 3 ? "orange" : "green",
  })

  const pies = computed(() => {
    const byStatus = new Map()
    for (const r of rows.value) {
      const key = Number(r.idStatus)
      if (!byStatus.has(key)) byStatus.set(key, [])
      byStatus.get(key).push(r)
    }
    return Array.from(byStatus.entries())
      .sort(([a], [b]) => a - b)
      .map(([idStatus, items]) => {
        items.sort((a, b) => Number(a.idRole) - Number(b.idRole))
        const roleIds = items.map((r) => Number(r.idRole))
        const labels = items.map((r) => r[`role_${props.locale}`] ?? `Role ${r.idRole}`)
        const data = items.map((r) => Number(r.nb_users))
        return {
          id: idStatus,
          title: _.capitalize(statusTitle(items, idStatus)),
          titleStyle: statusTitleStyle(idStatus),
          badge: { color: statusColor(idStatus), label: totals.value.byStatus[idStatus] },
          chartData: {
            labels,
            datasets: [
              {
                data,
                backgroundColor: roleIds.map((idRole) => roleColorMap.value[idRole]),
                borderWidth: 1,
              },
            ],
          },
        }
      })
  })
</script>

<template>
  <PiePanel
    :title="$t('comps.dashboard.accounts.title')"
    :total="totals.total"
    :pies="pies"
    :legend-items="legendItems"
    :options="options"
    :pie-size="250"
  />
</template>
