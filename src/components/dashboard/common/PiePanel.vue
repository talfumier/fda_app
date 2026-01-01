<script setup>
  import { Pie } from "vue-chartjs"

  const props = defineProps({
    title: { type: String, required: true },
    total: { type: [Number, String], default: null },
    pies: { type: Array },
    legendItems: { type: Array },
    options: { type: Object, required: true },
    pieSize: { type: Number, default: 250 },
  })
</script>

<template>
  <div class="outer">
    <div class="layout" :style="{ gridTemplateColumns: `repeat(1, ${pieSize}px)` }">
      <!-- Title -->
      <div class="card title-card">
        <h2 class="main-title">{{ title }}</h2>
        <q-badge v-if="total !== null" 
          class="total" color="positive" :label="total" />
      </div>
      <!-- Pies -->
      <div v-for="p in pies" :key="p.id" class="card pie-card">
        <div class="pie-header">
          <h3 :style="p.titleStyle || null">{{ p.title }}</h3>
          <q-badge v-if="p.badge"
            class="total-status" :color="p.badge.color" :label="p.badge.label"
          />
        </div>
        <div class="pie-wrapper" :style="{ width: `${pieSize}px`, height: `${pieSize}px` }">
          <Pie :data="p.chartData" :options="options" :width="pieSize" :height="pieSize" />
        </div>
      </div>
      <!-- Legend -->
      <div v-if="legendItems.length" class="card legend-card">
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
    margin: 5px;
  }
  .layout {
    display: grid;
    grid-template-columns: repeat(1, 270px);
    border: 1px solid var(--blue);
    border-radius: 10px;
  }
  .title-card {
    grid-column: 1 / -1;
    text-align: center;
    border-bottom: 1px solid var(--blue);
    position: relative;
  }
  .q-badge.total { 
    position: absolute; 
    top: 10px; 
    right: 10px; 
  }
  .main-title {
    margin: 0;
    font-size: 2.2rem;
    font-weight: 600;
    color: var(--blue);
    font-style: italic;
  }
  .pie-card {
    margin:0 auto;
  }
  .pie-wrapper {
    display:flex;
    justify-content: center;
    padding-bottom: 10px;
  }
  .pie-header {
    display:grid;
    grid-template-columns: max-content 25px;
    grid-template-rows: 25px;
    justify-content: center;
    column-gap: 10px;
    margin-bottom: 5px;
  }
  .pie-header:not(:has(.q-badge)) {
    grid-template-columns: max-content;
  }
  h3 { 
    font-size: 2rem; margin: 0; 
  }
  .q-badge.total-status { 
    justify-content: center;
    margin-top: 5px;
  }
  .legend-card {
    grid-column: 1 / -1;
    border-top: 1px solid var(--blue);
    height: 110px;
  }
  .legend-items {
    display: flex;
    flex-wrap: wrap;
    justify-content: left;
    gap: 10px;
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

  @media (min-width: 1000px) {
    .layout {
      grid-template-columns: repeat(2, minmax(200px, 300px)) !important;
    }
    .legend-card { 
      height: fit-content; 
    }
    .legend-items { 
      justify-content: center; 
    }
  }
</style>
