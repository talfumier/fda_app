<script setup>
import { useRouter } from 'vue-router'
import VuePdfEmbed from 'vue-pdf-embed'

const props = defineProps({
  file: { type: Object },
  fileYes: { type: Array },
  supported: { type: Object },
  size: { type: String },
  height: { type: String, default: null },
})

async function openPdf() {
  const res = await fetch(props.file.url)
  const buffer = await res.arrayBuffer()
  const blob = new Blob([buffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
</script>

<template>
  <div class="file-viewer">
    <div
      v-if="file.url && fileYes.includes('image') && supported.image.includes(file.ext)"
      class="image"
      :class="[height ? 'full' : '', size]"
    >
      <img :src="file.url" :alt="file.name" />
    </div>
    <div
      v-if="file.url && fileYes.includes('msoffice') && supported.msoffice.includes(file.ext)"
      :class="[height ? 'full' : '']"
    >
      <iframe
        :src="`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`"
      ></iframe>
    </div>
    <div
      v-if="file.url && fileYes.includes('pdf') && file.ext === '.pdf'"
      :class="['pdf', height ? 'full' : '']"
      @click="
        async () => {
          await openPdf()
        }
      "
    >
      <Tooltip :tt_text="$t('comps.public_site.faq.viewer_tt')" :wrap="true"> </Tooltip>
      <vue-pdf-embed :source="file.url" />
    </div>
  </div>
</template>

<style scoped>
div.file-viewer {
  overflow-y: auto;
}
img {
  object-fit: cover;
  padding: 5px;
  border: 1px solid lightgrey;
  margin-left: 0;
}
div.large img {
  height: 265px;
}
div.medium img {
  height: 223px;
}
div.small img {
  height: 190px;
}
div.pdf {
  cursor: pointer;
}
div.vue-pdf-embed {
  padding: 5px;
  border: 1px solid lightgrey;
  margin-left: 0;
  height: 270px;
  overflow-y: auto;
}
iframe {
  padding: 5px;
  border: 1px solid lightgrey;
  margin-left: 0;
  height: 270px;
  overflow-y: auto;
}
div.full {
  overflow-x: hidden;
}
div.full div.vue-pdf-embed {
  overflow-x: hidden;
  height: 100%;
}
</style>
