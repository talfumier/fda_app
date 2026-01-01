<script setup>
import { computed } from "vue"
import { Bar } from "vue-chartjs"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels)

const props = defineProps({
  data: { type: Array, default: () => [] },
  locale: { type: String, default: "en" },
  title: { type: String, default: "" },
  barThickness: { type: Number, default: 16 },
})

const STATUS_COLORS = {
  14: "#3B82F6", // draft
  15: "#f28e2b", // candidate
  16: "#EF4444", // rejected
  17: "#22C55E", // accepted
}
const STATUS_ORDER = [14, 15, 17, 16]
const FALLBACK_COLOR = "#9CA3AF"

const showLabel = computed(() => (props.locale === "fr" ? "Showroom" : "ShowRoom"))
const screenLabel = computed(() => (props.locale === "fr" ? "Écran" : "Screen"))

const expoTitle = (r) =>
  (props.locale === "fr" ? r.short_fr : r.short_en) ?? `Expo ${r.idExpo}`

const domainTitle = (r) =>
  (props.locale === "fr" ? r.domain_fr : r.domain_en) ?? `Domain ${r.idDomain}`

const statusTitle = (r) =>
  (props.locale === "fr" ? r.title_fr : r.title_en) ?? `Status ${r.idStatus}`

const groupedByExpo = computed(() => {
  const map = new Map()
  for (const r of props.data) {
    if (!map.has(r.idExpo)) map.set(r.idExpo, [])
    map.get(r.idExpo).push(r)
  }
  return Array.from(map.entries())
    .map(([idExpo, items]) => ({ idExpo, items }))
    .sort((a, b) => new Date(b.items[0].startDate) - new Date(a.items[0].startDate))
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        // show statuses once (avoid duplicates from showRoom/screen datasets)
        filter: (legendItem, data) => data.datasets[legendItem.datasetIndex]?._stackKey === "showRoom",
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const ds = ctx.dataset
          const stackLabel = ds?._stackKey === "showRoom" ? showLabel.value : screenLabel.value
          return `${ds.label} (${stackLabel}): ${ctx.raw}`
        },
      },
    },
    datalabels: {
      // INSIDE the stack
      anchor: "center",
      align: "center",
      clamp: true,

      // readable on colored segments
      color: "#FFFFFF",
      font: { weight: "700", size: 11 },

      formatter: (value, ctx) => {
        // Only print once per stack per domain, and only if stack has something
        if (!value) return ""

        const chart = ctx.chart
        const dataIndex = ctx.dataIndex
        const thisDs = ctx.dataset
        const stackKey = thisDs?._stackKey
        if (!stackKey) return ""

        // Find the top-most dataset in the SAME stack with nonzero value at this domain
        const dsets = chart.data.datasets
        let topIndex = -1
        for (let i = 0; i < dsets.length; i++) {
          const ds = dsets[i]
          if (ds._stackKey !== stackKey) continue
          const v = Number(ds.data?.[dataIndex] ?? 0)
          if (v > 0) topIndex = i
        }

        if (topIndex === ctx.datasetIndex) {
          return stackKey === "showRoom" ? showLabel.value : screenLabel.value
        }
        return ""
      },
    },
  },
  scales: {
    x: { stacked: true, ticks: { maxRotation: 0, autoSkip: false } },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: { precision: 0 },
      title: { display: true, text: props.locale === "fr" ? "Nb œuvres" : "Nb œuvres" },
    },
  },
}))

function buildChartData(items) {
  const domains = Array.from(
    new Map(items.map((r) => [Number(r.idDomain), domainTitle(r)])).entries()
  )
    .map(([idDomain, label]) => ({ idDomain, label }))
    .sort((a, b) => a.idDomain - b.idDomain)

  const labels = domains.map((d) => d.label)
  const domainIndex = new Map(domains.map((d, i) => [d.idDomain, i]))

  const statusLabelById = new Map()
  for (const r of items) statusLabelById.set(Number(r.idStatus), statusTitle(r))
  const presentStatuses = STATUS_ORDER.filter((id) => statusLabelById.has(id))

  const datasets = []
  for (const idStatus of presentStatuses) {
    const base = {
      label: statusLabelById.get(idStatus),
      backgroundColor: STATUS_COLORS[idStatus] ?? FALLBACK_COLOR,
      borderWidth: 1,
      barThickness: props.barThickness,
      maxBarThickness: props.barThickness,
    }

    datasets.push({
      ...base,
      stack: "showRoom",
      _stackKey: "showRoom",
      _statusId: idStatus,
      data: Array(labels.length).fill(0),
    })

    datasets.push({
      ...base,
      stack: "screen",
      _stackKey: "screen",
      _statusId: idStatus,
      data: Array(labels.length).fill(0),
    })
  }

  const dsMap = new Map()
  for (const ds of datasets) dsMap.set(`${ds._statusId}:${ds._stackKey}`, ds)

  for (const r of items) {
    const idx = domainIndex.get(Number(r.idDomain))
    if (idx === undefined) continue

    const idStatus = Number(r.idStatus)
    dsMap.get(`${idStatus}:showRoom`)?.data.splice(
      idx,
      1,
      Number(dsMap.get(`${idStatus}:showRoom`)?.data[idx] ?? 0) + Number(r.nb_showRoom || 0)
    )
    dsMap.get(`${idStatus}:screen`)?.data.splice(
      idx,
      1,
      Number(dsMap.get(`${idStatus}:screen`)?.data[idx] ?? 0) + Number(r.nb_screen || 0)
    )
  }

  return { labels, datasets }
}

const charts = computed(() =>
  groupedByExpo.value.map(({ idExpo, items }) => {
    const totalShow = items.reduce((s, r) => s + Number(r.nb_showRoom || 0), 0)
    const totalScreen = items.reduce((s, r) => s + Number(r.nb_screen || 0), 0)

    return {
      id: `expo_${idExpo}`,
      title: expoTitle(items[0]),
      totals: { show: totalShow, screen: totalScreen },
      chartData: buildChartData(items),
    }
  })
)
</script>

<template>
  <div class="outer">
    <div class="layout">
      <div class="card title-card">
        <h2 class="main-title">
          {{ title || (locale === "fr" ? "Œuvres sélectionnées" : "Selected works") }}
        </h2>
      </div>

      <div v-for="c in charts" :key="c.id" class="card chart-card">
        <div class="chart-header">
          <h3 class="expo-title">{{ c.title }}</h3>
          <div class="badges">
            <q-badge color="primary" :label="`${showLabel}: ${c.totals.show}`" />
            <q-badge color="secondary" :label="`${screenLabel}: ${c.totals.screen}`" />
          </div>
        </div>

        <div class="chart-wrap">
          <Bar :data="c.chartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.outer {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  margin: 5px;
}

.layout {
  display: grid;
  grid-template-columns: repeat(1, minmax(270px, 1fr));
  border: 1px solid var(--blue);
  border-radius: 10px;
  /* width: 100%; */
}

.card {
  padding: 10px;
}

.title-card {
  grid-column: 1 / -1;
  text-align: center;
  border-bottom: 1px solid var(--blue);
}

.main-title {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 600;
  color: var(--blue);
  font-style: italic;
}

.chart-card {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.expo-title {
  margin: 0;
  font-size: 1.6rem;
  color: var(--blue);
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.chart-wrap {
  height: 460px;
  margin-top: 10px;
}

@media (min-width: 1000px) {
  .layout {
    grid-template-columns: repeat(2, minmax(380px, 1fr));
  }
  .title-card {
    grid-column: 1 / -1;
  }
}
</style>
