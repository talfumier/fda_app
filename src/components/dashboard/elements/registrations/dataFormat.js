export function registrationData(STATUS_COLORS, rows, locale) {
  const FALLBACK_COLOR = '#9CA3AF'
  const STATUS_ORDER = [7, 8, 10, 27, 9] // draft → candidate → accepted → paid → rejected
  const expoTitle = (r) => r[`short_${locale}`] ?? `Expo ${r.idExpo}`
  const statusTitle = (r) => r[`title_${locale}`] ?? `Status ${r.idStatus}`
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.idExpo)) map.set(r.idExpo, [])
    map.get(r.idExpo).push(r)
  }
  const groupedByExpo = Array.from(map.entries())
    .map(([idExpo, items]) => ({ idExpo, items }))
    .sort((a, b) => new Date(b.items[0].startDate) - new Date(a.items[0].startDate))
  const pies = groupedByExpo.map(({ idExpo, items }) => {
    const byStatus = new Map(items.map((r) => [Number(r.idStatus), r]))
    const ordered = STATUS_ORDER.filter((id) => byStatus.has(id)).map((id) => byStatus.get(id))
    const expoTotal = ordered.reduce((sum, r) => sum + Number(r.nb_reg || 0), 0)
    return {
      id: `expo_${idExpo}`,
      title: expoTitle(items[0]),
      badge: { color: 'positive', label: expoTotal }, // per-expo total
      chartData: {
        labels: ordered.map(statusTitle),
        datasets: [
          {
            data: ordered.map((r) => Number(r.nb_reg || 0)),
            backgroundColor: ordered.map(
              (r) => STATUS_COLORS[Number(r.idStatus)] ?? FALLBACK_COLOR,
            ),
            borderWidth: 1,
          },
        ],
      },
    }
  })
  return pies
}
export function oeuvresShowRoomScreenData(rows, locale, t, barThickness) {
  const STATUS_ORDER = [14, 15, 17, 16]
  const STATUSES = [
    { id: 14, statusTitle: t('comps.list_items.actions_menu.booking.draft'), color: '#3B82F6' },
    { id: 15, statusTitle: t('comps.list_items.actions_menu.booking.candidate'), color: '#f28e2b' },
    { id: 17, statusTitle: t('comps.list_items.actions_menu.booking.accepted'), color: '#22C55E' },
    { id: 16, statusTitle: t('comps.list_items.actions_menu.booking.rejected'), color: '#EF4444' },
  ]
  const STATUS_COLORS = Object.fromEntries(STATUSES.map((s) => [s.id, s.color]))
  const FALLBACK_COLOR = '#9CA3AF'
  const expoTitle = (r) => r[`short_${locale}`] ?? r.short_en ?? r.short_fr ?? `Expo ${r.idExpo}`
  const domainTitle = (r) => r[`domain_${locale}`] ?? `Domain ${r.idDomain}`
  const statusTitle = (r) => r[`title_${locale}`] ?? `Status ${r.idStatus}`
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.idExpo)) map.set(r.idExpo, [])
    map.get(r.idExpo).push(r)
  }
  const groupedByExpo = Array.from(map.entries())
    .map(([idExpo, items]) => ({ idExpo, items }))
    .sort((a, b) => new Date(b.items[0].startDate) - new Date(a.items[0].startDate))
  function buildChartData(items, metricKey /* nb_showRoom | nb_screen */) {
    const domains = Array.from(
      new Map(items.map((r) => [Number(r.idDomain), domainTitle(r)])).entries(),
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
      barThickness: barThickness,
      maxBarThickness: barThickness,
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
  const expos = groupedByExpo.map(({ idExpo, items }) => {
    const totalShow = items.reduce((s, r) => s + Number(r.nb_showRoom || 0), 0)
    const totalScreen = items.reduce((s, r) => s + Number(r.nb_screen || 0), 0)
    // Legend ALWAYS all statuses (even if unused)
    const legendItems = STATUSES.map((s) => ({
      id: s.id,
      label: s.statusTitle,
      color: s.color,
    }))

    return {
      id: `expo_${idExpo}`,
      title: expoTitle(items[0]),
      totals: { show: totalShow, screen: totalScreen },
      showChart: buildChartData(items, 'nb_showRoom'),
      screenChart: buildChartData(items, 'nb_screen'),
      legendItems,
    }
  })
  return expos
}
export function paymentData(PAYMENT_COLORS, rows, t, locale) {
  const FALLBACK_COLOR = '#9CA3AF'
  const expoTitle = (r) => r[`short_${locale}`] ?? `Expo ${r.idExpo}`
  const labelDue = t('comps.dashboard.payments.payment_due')
  const labelReceived = t('comps.dashboard.payments.payment_received')
  const pies = rows
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .map((r) => {
      const payment_due = Number(r.payment_due)
      const payment_received = Number(r.payment_received)
      const expoTotal = payment_due + payment_received
      return {
        id: `expo_${r.idExpo}`,
        title: expoTitle(r),
        badge: { color: 'positive', label: `${expoTotal} €` },
        chartData: {
          labels: [labelDue, labelReceived],
          datasets: [
            {
              data: [payment_due, payment_received],
              backgroundColor: [
                PAYMENT_COLORS.due ?? FALLBACK_COLOR,
                PAYMENT_COLORS.received ?? FALLBACK_COLOR,
              ],
              borderWidth: 1,
            },
          ],
        },
      }
    })
  return pies
}
