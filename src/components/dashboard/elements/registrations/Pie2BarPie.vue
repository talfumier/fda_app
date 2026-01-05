<script setup>
  import { computed } from "vue"
  import { Bar } from "vue-chartjs"
  import PieSingle from "../../common/PieSingle.vue"
  import { usePieOptions } from "../../common/usePieOptions"
  import { useBarOptions } from "../../common/useBarOptions"
  import { registrationData,oeuvresShowRoomScreenData,paymentData } from "./dataFormat"

  const props = defineProps({
    data: { type: Array, default: () => [] },
    locale: { type: String, default: "en" },
    t:{ type: Function},
    idRole:{type: Number},
    guest:{type: Array},
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
  const pies1=computed(() => {
    return registrationData(STATUS_COLORS,props.data[0], props.locale)
  })
  // Shared legend (static, matches color semantics)
  const legendItems1 = computed(() => [
    // { id: 7,  label: props.t("comps.list_items.actions_menu.booking.draft"),color: STATUS_COLORS[7] },
    { id: 8,  label:props.t("comps.list_items.actions_menu.booking.candidate"),color: STATUS_COLORS[8] },
    { id: 10, label:props.t("comps.list_items.actions_menu.booking.accepted"),color: STATUS_COLORS[10] },
    { id: 27, label:props.t("comps.list_items.actions_menu.booking.payment"),color: STATUS_COLORS[27] },
    { id: 9,  label:props.t("comps.list_items.actions_menu.booking.rejected"),color: STATUS_COLORS[9] },
  ])

  const {options:barOptions}=useBarOptions()
  const expos=computed(() => {
    return oeuvresShowRoomScreenData(props.data[1], props.locale, props.t,props.barThickness)
  })

  const PAYMENT_COLORS = {
    due: "#f28e2b",
    received: "#22C55E",
  }
  const pies2=computed(() => {
    return paymentData(PAYMENT_COLORS,props.data[2], props.t, props.locale,props.guest)
  })
  const legendItems2 = computed(() => [
    { id: 'due',  label:props.t("comps.dashboard.payments.payment_due"),color: PAYMENT_COLORS.due},
    { id: 'received', label:props.t("comps.dashboard.payments.payment_received"),color: PAYMENT_COLORS.received},
  ])
  
</script>

<template>
  <div class="outer">
    <div v-for="(expo,idx) in expos" :key="expo.id" class="expo-block">
      <!-- 1Pie|2Bar|1Pie charts area + vertical separators -->
      <div class="charts-container">
        <!-- Title = short_en / short_fr -->
        <div class="expo-title-card">
          <h2 class="expo-main-title">{{ expo.title }}</h2>
        </div>
        <div class="chart-block pie1">
          <div class="pie-header">
            <h3>{{ idRole>=5?$t('comps.dashboard.registrations.title'):$t('comps.dashboard.registrations.title').replaceAll('s','') }}</h3>
            <q-badge v-if="pies1[idx].badge"
              class="total-status" color="dark-blue" :label="pies1[idx].badge.label"
            />
          </div>
          <PieSingle
            :data="pies1[idx].chartData"
            :size="250"
            :options="pieOptions"
          >
          </PieSingle>
        </div>
        <div class="v-sep"></div>
        <div class="chart-block bar1">
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
        <div class="chart-block bar2">
          <div class="chart-head">
            <div class="chart-subtitle">{{ $t("comps.form_details.booking_oeuvre.screen") }}</div>
            <q-badge color="dark-blue" :label="expo.totals.screen" />
          </div>
          <div class="chart-wrap">
            <Bar :data="expo.screenChart" :options="barOptions" />
          </div>
        </div>  
        <div class="v-sep"></div>      
        <div v-if="pies2[idx] && pies2[idx].chartData.datasets[0].data.length>0" class="chart-block pie2">
          <div>{{ pies2[idx] }}</div>
          <div class="pie-header">
            <h3>{{ idRole>=5?$t('comps.dashboard.payments.title'):$t('comps.dashboard.payments.title').replaceAll('s','') }}</h3>
            <q-badge v-if="pies2[idx].badge"
              class="total-status-eur" color="dark-blue" :label="pies2[idx].badge.label"
            />
          </div>
          <PieSingle
            :data="pies2[idx].chartData"
            :size="250"
            :options="pieOptions"
          >
          </PieSingle>
        </div>
      <!-- Statuses Legend per expo (always all statuses) -->
        <div class="expo-legend1">
          <div class="legend-items">
            <div v-for="it in legendItems1" :key="it.id" class="legend-item">
              <span v-if="it.id!==27" class="swatch" :style="{ backgroundColor: it.color }"></span>
              <span v-if="it.id!==27" class="label">{{ it.label }}</span>
            </div>
          </div>
        </div>
        <div v-if="pies2[idx]" class="v-sep"></div>  
        <div v-if="pies2[idx] && pies2[idx].chartData.datasets[0].data.length>0" class="expo-legend2">
          <div class="legend-items">
            <div v-for="it in legendItems2" :key="it.id" class="legend-item">
              <span class="swatch" :style="{ backgroundColor: it.color }"></span>
              <span class="label">{{ it.label }}</span>
            </div>
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
    grid-row: 1;
    grid-column: 1/-1;
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
  /* 1Pie|2Bar|1Pie charts area */
  .charts-container {
    display: grid;
    grid-template-columns: 1fr;   
    grid-template-rows: repeat(2,auto) 1px auto 1px auto ;
  }
  
  .charts-container:not(:has(.expo-legend2)) .expo-legend1  {
    border-bottom:none;
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
  .q-badge.total-status-eur {
    width:40px;

  }
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
    height: 340px;
  }
  .v-sep{
    border-top: 1px solid var(--blue-opaque35);
    height:1px;
  }
  /* Legend */  
  .expo-legend1 {
    grid-row: 7;
    padding: 5px;
    border-top: 1px solid var(--blue);
    border-bottom: 1px solid var(--blue);
  }
  .expo-legend2 {
    grid-row: 10;
    padding: 5px;
    border-top: 1px solid var(--blue);
    border-right: 1px solid var(--blue-opaque35);
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
  @media (min-width: 1200px){
    .charts-container { 
      grid-template-columns: 0.5fr 1px 1fr 1px 1fr;
      grid-template-rows: auto;
    }
    div.chart-block.pie2 {
      grid-column: 1/-1;
    }
    .expo-legend1 {
      grid-row: 3;
      grid-column: 1/-1;
    }
    .expo-legend2 {
      grid-column: 1/-1;
      grid-row: 6;
    } 
  }
  @media (min-width: 1460px){    
    .charts-container {
      grid-template-columns: 0.5fr 1px 1fr 1px 1fr 1px 0.5fr;
    }
    div.chart-block.pie2 {
      grid-column: 7;
    }
    .expo-legend1 {
      grid-column: 1/span 6;
      grid-row: 3;
      border-bottom:none;
      border-right: 1px solid var(--blue-opaque35);
    }
    .expo-legend2 {
      grid-row: 3;
      grid-column: 7;
    }
    .v-sep {
      height:100%;
      width:1px;
      background-color: var(--blue-opaque35);
    }
    .charts-container:not(:has(.expo-legend2)) {
      grid-template-columns: 0.5fr 1px 1fr 1px 1fr;
    }
    .charts-container:not(:has(.expo-legend2)) .expo-legend1 {
      grid-column: 1/-1;
    }

  }
 
</style>
