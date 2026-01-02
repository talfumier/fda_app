<script setup>
  import { computed } from "vue"
  import { Bar } from "vue-chartjs"
  import PieSingle from "../../common/PieSingle.vue"
  import { usePieOptions } from "../../common/usePieOptions"
  import { useBarOptions } from "../../common/useBarOptions"
  import { registrationData,oeuvresShowRoomScreenData } from "./dataFormat"

  const props = defineProps({
    data: { type: Array, default: () => [] },
    locale: { type: String, default: "en" },
    t:{ type: Function},
    barThickness: { type: Number, default: 30 },
  })
  const { options:pieOptions } = usePieOptions()
  const STATUS_COLORS = {
    7: "#3B82F6",  // draft
    8: "#f28e2b",  // candidate
    9: "#EF4444",  // rejected
    10: "#22C55E", // accepted
    27: "#15803D", // payment received
  }
  const pies=computed(() => {
    return registrationData(STATUS_COLORS,props.data[0], props.locale)
  })
  // Shared legend (static, matches color semantics)
  const legendItems = computed(() => [
    { id: 7,  label: props.t("comps.list_items.actions_menu.booking.draft"),color: STATUS_COLORS[7] },
    { id: 8,  label:props.t("comps.list_items.actions_menu.booking.candidate"),color: STATUS_COLORS[8] },
    { id: 10, label:props.t("comps.list_items.actions_menu.booking.accepted"),color: STATUS_COLORS[10] },
    { id: 27, label:props.t("comps.list_items.actions_menu.booking.payment"),color: STATUS_COLORS[27] },
    { id: 9,  label:props.t("comps.list_items.actions_menu.booking.rejected"),color: STATUS_COLORS[9] },
  ])

  const {options:barOptions}=useBarOptions()
  const expos=computed(() => {
    return oeuvresShowRoomScreenData(props.data[1], props.locale, props.t,props.barThickness)
  })
  
</script>

<template>
  <div class="outer oeuvres-expo">
    <div v-for="(expo,idx) in expos" :key="expo.id" class="expo-block">
      <!-- Title = short_en / short_fr -->
      <div class="expo-title-card">
        <h2 class="expo-main-title">{{ expo.title }}</h2>
      </div>
      <!-- Two charts + vertical separator -->
      <div class="charts-container">
        <div class="chart-block">
          <div class="pie-header">
            <h3>{{ $t('comps.dashboard.registrations.title') }}</h3>
            <q-badge v-if="pies[idx].badge"
              class="total-status" color="dark-blue" :label="pies[idx].badge.label"
            />
          </div>
          <PieSingle
            :data="pies[idx].chartData"
            :size="250"
            :options="pieOptions"
          >
          </PieSingle>
        </div>
        <div class="v-sep"></div>
        <div class="chart-block">
          <!-- “Vertical header” row (no top/bottom padding) -->
          <div class="chart-head">
            <div class="chart-subtitle">{{ $t("comps.form_details.booking_oeuvre.showRoom") }}</div>
            <q-badge color="dark-blue" :label="expo.totals.show" />
          </div>
          <div class="chart-wrap">
            <Bar :data="expo.showChart" :options="barOptions" />
          </div>
        </div>
        <div class="v-sep"></div>
        <div class="chart-block">
          <div class="chart-head">
            <div class="chart-subtitle">{{ $t("comps.form_details.booking_oeuvre.screen") }}</div>
            <q-badge color="dark-blue" :label="expo.totals.screen" />
          </div>
          <div class="chart-wrap">
            <Bar :data="expo.screenChart" :options="barOptions" />
          </div>
        </div>
      </div>
      <!-- Legend per expo (always all statuses) -->
      <div class="expo-legend">
        <div class="legend-items">
          <div v-for="it in legendItems" :key="it.id" class="legend-item">
            <span class="swatch" :style="{ backgroundColor: it.color }"></span>
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
  .charts-container {
    display: grid;
    grid-template-columns: 0.5fr 1px 1fr 1px 1fr;
    /* gap: 10px; */
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
    margin:auto;
    padding:10px;
  }
  .pie-header {
    display:grid;
    grid-template-columns: max-content 25px;
    grid-template-rows: 25px;
    justify-content: center;
    align-items: center;
    column-gap: 10px;
    margin-bottom: 5px;
  }
  h3 {
    margin:0;
    font-size: 1.8rem;
    font-style: italic;
    font-weight: 500;
  }
  .q-badge {
    justify-content: center;
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
    padding: 5px;
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
    .charts-container {
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
