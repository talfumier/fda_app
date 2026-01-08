<script setup>
  import { ref, onBeforeUnmount } from 'vue'
  import FileViewer from './FileViewer.vue'
  import supported from './supported.json'

  defineProps({
    file:{type:Object}
  })

  const emit=defineEmits(['closeModal'])  

  const position = ref({ x: 500, y: 500 })
  const isDragging = ref(false)
  let start = { x: 0, y: 0 }

  function startDrag(e) {
    isDragging.value = true
    start = {
      x: e.clientX - position.value.x,
      y: e.clientY - position.value.y
    }
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
  }

  function onDrag(e) {
    if (!isDragging.value) return
    position.value = {
      x: e.clientX - start.x,
      y: e.clientY - start.y
    }
  }

  function stopDrag() {
    isDragging.value = false
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
  }

  onBeforeUnmount(stopDrag)

</script>

<template>
  <q-card 
    class="modal" 
    :style="{
      top: position.y + 'px',
      left: position.x + 'px',
      cursor: isDragging ? 'grabbing' : 'grab'
    }"
    @click.self="emit('closeModal')"
    @mousedown.stop="startDrag"
  >  
    <q-card-section >           
      <q-icon name="cancel" size="3rem" color='blue-grey-9'
        @click="emit('closeModal')"
      >
      </q-icon>
    </q-card-section> 
    <q-card-section>
      <FileViewer
        :file="file"
        :fileYes="['msoffice', 'image', 'pdf']"
        :supported="supported"
        size='large'
      ></FileViewer>
    </q-card-section>
  </q-card>

</template>

<style scoped>
  .modal {
    position:fixed;    
    z-index: 10000;
    border:1px solid lightgray;
  }
  div.q-card__section {
    padding-top:10px
  }
  .q-icon {
    position:absolute;
    top:3px;
    right:10px;
    cursor: pointer;

  }

</style>