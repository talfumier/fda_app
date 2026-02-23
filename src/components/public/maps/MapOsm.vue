<script setup>
  import { ref, onMounted, shallowRef, nextTick } from 'vue' 

  const props = defineProps({
    lat: { type: Number, default: 48.8566 },
    lng: { type: Number, default: 2.3522 },
    zoom: { type: Number, default: 20 },
    markers: {type: Array,default: []}
  })

  const LMap = shallowRef(null)
  const LTileLayer = shallowRef(null)
  const LMarker = shallowRef(null)
  const LPopup = shallowRef(null)
  const leafletReady = ref(false)
  const isFullscreen = ref(false)

  onMounted(async () => {
    await import('leaflet/dist/leaflet.css')
    const L = (await import('leaflet')).default
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
      iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
      shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
    })
    const leaflet = await import('@vue-leaflet/vue-leaflet')
    LMap.value = leaflet.LMap
    LTileLayer.value = leaflet.LTileLayer
    LMarker.value = leaflet.LMarker
    LPopup.value = leaflet.LPopup

    leafletReady.value = true
  })  
  const toggle = async () => {
    isFullscreen.value = !isFullscreen.value
    await nextTick()
    window.dispatchEvent(new Event('resize'))
  }
  // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
  // https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png
  // https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
</script>

<template>
  <div :class="isFullscreen ? 'fullscreen' : 'normal'">
    <component
      v-if="leafletReady"
      :is="LMap"
      :zoom="zoom"
      :center="[lat, lng]"
      style="height: 100%;"
    >
      <component :is="LTileLayer"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <component
        v-for="marker in markers"
        :key="marker.id"
        :is="LMarker"
        :lat-lng="[marker.lat, marker.lng]"
      >
        <component :is="LPopup">{{ marker.label }}</component>
      </component>
    </component>
    <button class="fullscreen-btn" @click="toggle">
      {{ isFullscreen ? '✕' : '⛶' }}
    </button>
  </div>
</template>

<style scoped>
div.normal {
  position: relative;
  width: 350px;
  height:250px;
}
div.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
}
button.fullscreen-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1001;
  width: 34px;
  height: 34px;
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
button.fullscreen-btn:hover {
  background: #f4f4f4;
}
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
:deep(.leaflet-popup-content) {
  font-size: 12px;
  line-height: 1.4;
  height:20px;
  width:130px;
}
/* :deep(.leaflet-popup-tip-container) {
  height: 10px;
} */

</style>