<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetch } from '../functions.js'
import {
  newController,
  doneController,
  cancelAllInFlight,
  getFileExtension,
} from '@/utilityFunctions.js'
import FileViewer from '@/components/common/page/details/FileViewer.vue'
import supported from '../../common/page/details/supported.json'

const { locale } = useI18n()
const inFlight = new Set()

const state = ref([])
onMounted(async () => {
  const ctrl = newController(inFlight)
  try {
    const res = (await fetch('public_faq_details', ctrl.signal))[0]
    if (!res) return
    const groupsById = {}
    res.forEach((row) => {
      const id = row.idType
      if (!groupsById[id])
        groupsById[id] = {
          expand: false,
          idType: row.idType,
          type_en: row.type_en,
          type_fr: row.type_fr,
          order: row.order,
          items: [],
        }
      groupsById[id].items.push({ ...row, expand: false })
    })
    state.value = Object.values(groupsById).sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('onmounted failed in Faq.vue', error)
    return
  } finally {
    doneController(ctrl, inFlight)
  }
})
onUnmounted(() => {
  // clean-up code after component has unmounted
  cancelAllInFlight(inFlight)
})
</script>

<template>
  <div class="page">
    <section v-for="cat in state" :key="cat.idType">
      <header :class="[cat.expand ? 'border' : '']" @click="cat.expand = !cat.expand">
        <q-badge :label="cat.items.length" />
        <q-icon v-if="!cat.expand" name="folder" size="3rem">
          <Tooltip :tt_text="$t('comps.public_site.faq.cat.folder_tt')" :wrap="false"></Tooltip>
        </q-icon>
        <q-icon v-if="cat.expand" name="folder_open" size="3rem"></q-icon>
        <h2>{{ cat[`type_${locale}`] }}</h2>
      </header>
      <article v-for="(faq, idx) in cat.items" v-if="cat.expand" :key="faq.idFaq">
        <ul>
          <li class="question">
            <q-icon
              name="keyboard_arrow_down"
              size="3rem"
              :style="`transform: rotate(${faq.expand ? '-180deg' : '0deg'});transition: 0.6s ease;`"
              @click="faq.expand = !faq.expand"
            >
            </q-icon>
            {{ faq[`question_${locale}`] }}
          </li>
          <li :class="['answer', faq.expand ? 'visible' : 'hidden']">
            {{ faq[`answer_${locale}`] }}
          </li>
        </ul>
        <FileViewer
          v-if="faq.idFile && faq.expand"
          :file="{ url: faq.url, ext: getFileExtension(faq.fileName) }"
          :fileYes="['msoffice', 'image', 'pdf']"
          :supported="supported"
          size="large"
        >
        </FileViewer>
        <hr v-if="idx !== cat.items.length - 1" />
      </article>
    </section>
  </div>
</template>

<style scoped>
div.page {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  align-items: top;
  gap: 20px;
}
section {
  font-size: 2rem;
  border: solid 2px var(--blue);
  border-radius: 5px;
  margin: 20px;
  width: 100%;
  max-width: 500px;
  background-color: var(--beige);
  height: fit-content;
  max-height: 70vh;
  overflow-y: auto;
}
header {
  position: sticky;
  top: 0;
  display: flex;
  flex-wrap: nowrap;
  justify-content: left;
  align-items: center;
  gap: 10px;
  color: var(--blue);
  opacity: 0.8;
  cursor: pointer;
  background-color: rgb(226, 226, 67);
  opacity: 1;
}
header.border {
  border-bottom: solid 1px;
}
.q-badge {
  position: absolute;
  right: 25px;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  font-size: 15px;
  font-weight: bolder;
  color: var(--white);
  background-color: var(--blue);
}
.q-icon {
  padding-left: 15px;
  cursor: pointer;
}
h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  line-break: auto;
  line-height: 2.5rem;
  color: var(--blue);
  margin: 0;
  padding: 10px 15px 10px 0;
  opacity: 0.8;
}
ul {
  list-style-type: none;
  padding: 0 15px;
}
ul .q-icon {
  padding-left: 0;
}
li {
  display: flex;
  white-space: normal; /* default: allows wrapping */
  overflow-wrap: break-word;
  word-break: break-word;
  font-weight: bolder;
}
li.question {
  color: var(--red-opaque8);
}
li.answer.visible {
  color: var(--green);
  padding-top: 10px;
  padding-left: 30px;
}
li.answer.hidden {
  display: none;
}
div.file-viewer {
  display: flex;
  justify-content: center;
}

@media screen and (min-width: 1000px) {
  section {
    width: 50%;
  }
}
@media screen and (min-width: 1500px) {
  section {
    width: 30%;
  }
}
@media screen and (min-width: 2000px) {
  section {
    width: 25%;
  }
}
</style>
