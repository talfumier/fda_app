import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

let registered = false
export function usePieOptions() {
  if (!registered) {
    ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)
    registered = true
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true, labelSpacing: 8, boxPadding: 4, caretPadding: 8 },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 12 },
        formatter: (v) => v,
        anchor: 'center',
        align: 'center',
        clamp: true,
      },
    },
  }
  return { options }
}
