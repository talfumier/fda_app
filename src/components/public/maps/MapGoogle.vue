<script setup>import { ref, onMounted } from 'vue'
  import { useGoogleMaps } from '@/composable/useGoogleMaps'

  const props = defineProps({
    lat: { type: Number, default: 48.8566 },
    lng: { type: Number, default: 2.3522 },
    zoom: { type: Number, default: 12 },
    markers: {type: Array,
    default: () => []}// [{ lat, lng, title }]
  })

  const mapContainer = ref(null)
  const { importLibrary } = useGoogleMaps()

  onMounted(async () => {
    const { Map } = await importLibrary('maps')
    const { AdvancedMarkerElement } = await importLibrary('marker')

    const map=new Map(mapContainer.value, {
      center: { lat: props.lat, lng: props.lng },
      zoom: props.zoom,
      mapId: 'DEMO_MAP_ID'
    })
    props.markers.forEach(({ lat, lng, title }) => {
      new AdvancedMarkerElement({ map, position: { lat, lng }, title })
    })
  })
</script>

<template>
  <div ref="mapContainer" style="width: 400px; height: 300px;"></div>
</template>

<style scoped>

</style>