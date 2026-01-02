// src/common/useBarOptions.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { markRaw } from 'vue'

let registered = false
let cached = null
export function useBarOptions() {
  if (!registered) {
    ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels)
    registered = true
  }
  if (!cached) {
    cached = markRaw({
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
          anchor: 'center',
          align: 'center',
          clamp: true,
          color: '#FFFFFF',
          font: { weight: '700', size: 11 },
          formatter: (value) => {
            const v = Number(value ?? 0)
            return v > 0 ? String(v) : ''
          },
        },
      },
      scales: {
        x: { stacked: true, ticks: { maxRotation: 0, autoSkip: false } },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { precision: 0 },
          title: { display: false },
        },
      },
    })
  }
  return { options: cached }
}
