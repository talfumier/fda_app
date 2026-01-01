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
    barThickness: { type: Number, default: 30 },
  })

  const STATUS_ORDER = [14, 15, 17, 16]
  const STATUSES = [
    { id: 14, en: "Draft",     fr: "Brouillon", color: "#3B82F6" },
    { id: 15, en: "Candidate", fr: "Candidat",  color: "#f28e2b" },
    { id: 17, en: "Accepted",  fr: "Accepté",   color: "#22C55E" },
    { id: 16, en: "Rejected",  fr: "Rejeté",    color: "#EF4444" },
  ]
  const STATUS_COLORS = Object.fromEntries(STATUSES.map((s) => [s.id, s.color]))
  const FALLBACK_COLOR = "#9CA3AF"

  const expoTitle = (r) =>
    (r[`short_${props.locale}`]) ??
    (r.short_en ?? r.short_fr) ??
    `Expo ${r.idExpo}`

  const domainTitle = (r) =>
    (r[`domain_${props.locale}`]) ?? `Domain ${r.idDomain}`

  const statusTitle = (r) =>
    (r[`title_${props.locale}`]) ?? `Status ${r.idStatus}`
  /**
   * Group rows by expo
   */
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
  /**
   * Chart options:
   */
  const baseOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = Number(ctx.raw ?? 0)
            if (!v) return null
            return `${ctx.dataset.label}: ${v}`
          },
        },
      },
      datalabels: {
        anchor: "center",
        align: "center",
        clamp: true,
        color: "#FFFFFF",
        font: { weight: "700", size: 11 },
        formatter: (value) => {
          const v = Number(value ?? 0)
          return v > 0 ? String(v) : ""
        },
      },
    },
    scales: {
      x: { stacked: true, ticks: { maxRotation: 0, autoSkip: false } },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { precision: 0 },
        title: { display: false }, // <-- remove Y-axis header
      },
    },
  }))
  function buildChartData(items, metricKey /* nb_showRoom | nb_screen */) {
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

    const datasets = presentStatuses.map((idStatus) => ({
      label: statusLabelById.get(idStatus),
      backgroundColor: STATUS_COLORS[idStatus] ?? FALLBACK_COLOR,
      borderWidth: 1,
      barThickness: props.barThickness,
      maxBarThickness: props.barThickness,
      data: Array(labels.length).fill(0),
      _statusId: idStatus,
    }))

    const dsByStatus = new Map(datasets.map((ds) => [ds._statusId, ds]))

    for (const r of items) {
      const idx = domainIndex.get(Number(r.idDomain))
      if (idx === undefined) continue
      const ds = dsByStatus.get(Number(r.idStatus))
      if (!ds) continue
      ds.data[idx] += Number(r[metricKey] || 0)
    }

    return { labels, datasets }
  }

  const expos = computed(() =>
    groupedByExpo.value.map(({ idExpo, items }) => {
      const totalShow = items.reduce((s, r) => s + Number(r.nb_showRoom || 0), 0)
      const totalScreen = items.reduce((s, r) => s + Number(r.nb_screen || 0), 0)
      // Legend ALWAYS all statuses (even if unused)
      const legendItems = STATUSES.map((s) => ({
        id: s.id,
        label: s[`${props.locale}`],
        color: s.color,
      }))

      return {
        id: `expo_${idExpo}`,
        title: expoTitle(items[0]),
        totals: { show: totalShow, screen: totalScreen },
        showChart: buildChartData(items, "nb_showRoom"),
        screenChart: buildChartData(items, "nb_screen"),
        legendItems,
      }
    })
  )
</script>

<template>
  <div class="outer oeuvres-expo">
    <div v-for="expo in expos" :key="expo.id" class="expo-block">
      <!-- Title = short_en / short_fr -->
      <div class="expo-title-card">
        <h2 class="expo-main-title">{{ expo.title }}</h2>
      </div>
      <!-- Two charts + vertical separator -->
      <div class="two-charts">
        <div class="chart-block">
          <!-- “Vertical header” row (no top/bottom padding) -->
          <div class="chart-head">
            <div class="chart-subtitle">{{ $t("comps.form_details.booking_oeuvre.showRoom") }}</div>
            <q-badge color="info" :label="expo.totals.show" />
          </div>
          <div class="chart-wrap">
            <Bar :data="expo.showChart" :options="baseOptions" />
          </div>
        </div>
        <div class="v-sep"></div>
        <div class="chart-block">
          <div class="chart-head">
            <div class="chart-subtitle">{{ $t("comps.form_details.booking_oeuvre.screen") }}</div>
            <q-badge color="info" :label="expo.totals.screen" />
          </div>
          <div class="chart-wrap">
            <Bar :data="expo.screenChart" :options="baseOptions" />
          </div>
        </div>
      </div>
      <!-- Legend per expo (always all statuses) -->
      <div class="expo-legend">
        <div class="legend-items">
          <div v-for="it in expo.legendItems" :key="it.id" class="legend-item">
            <span class="swatch" :style="{ backgroundColor: it.color }" />
            <span class="label">{{ it.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .outer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
    margin: 6px;
  }
  .expo-block {
    border: 1px solid var(--blue);
    border-radius: 10px;
    overflow: hidden;
  }
  /* Title header */
  .expo-title-card {
    border-bottom: 1px solid var(--blue);
  }
  .expo-main-title {
    margin: 0;
    font-size: 2.2rem;
    font-weight: 650;
    color: var(--blue);
    font-style: italic;
    text-align: center;
  }
  /* Two charts area */
  .two-charts {
    display: grid;
    grid-template-columns: 1fr 12px 1fr;
    gap: 10px;
    /* padding: 10px; */
    align-items: stretch;
  }
  .v-sep {
    width: 1px;
    justify-self: center;
    background: var(--blue);
    opacity: 0.35;
  }
  .chart-block {
    padding:10px;
  }
  /* Chart header row: remove upper/bottom padding */
  .chart-head {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 8px;
    padding: 0;           
    margin: 0 0 6px 0;    
  }
  .chart-subtitle {
    margin: 0;           
    padding: 0;           
    font-weight: 500;
    color: #111827;
    font-style: italic;
  }
  .chart-wrap {
    height: 360px;
  }
  /* Legend */
  .expo-legend {
    padding: 10px;
    border-top: 1px solid var(--blue);
  }
  .legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .swatch {
    width: 16px;
    height: 12px;
    border-radius: 2px;
  }
  .label {
    font-size: 15px;
  }

  @media (max-width: 900px) {
    .two-charts {
      grid-template-columns: 1fr;
    }
    .v-sep {
      display: none;
    }
    .chart-wrap {
      height: 340px;
    }
  }
</style>
