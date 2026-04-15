<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

  const props=defineProps({
    data:{type:Object},
    options: {type: Array},
    placeholder: {type: String}
  })

  const model=defineModel({default:{idExpoLoc:null,idLoc:null}})

  const rootEl=ref(null)
  const isOpen=ref(false)
  const search=ref('')
  const highlightedIndex=ref(0)

  const filteredOptions=computed(() => {
    const needle=search.value.trim().toLowerCase()
    if (!needle) return props.options
    return props.options.filter(option =>
      String(option.idLoc).toLowerCase().startsWith(needle)
    )
  })

  const displayValue=computed(() => {
    return model.value?.idExpoLoc == null ? '' : String(model.value.idLoc)
  })
  const emit=defineEmits(['changeLocation'])
  function selectOption (option) {
    model.value=option?{idExpoLoc:option.idExpoLoc,idLoc:option.idLoc}:null
    emit('changeLocation',option)
    search.value=''
    closeDropdown()
  }

  function openDropdown () {
    isOpen.value=true
  }
  function closeDropdown () {
    isOpen.value=false
    highlightedIndex.value=0
  }
  function onInput () {
    isOpen.value=true
    highlightedIndex.value=0
  }
  function onKeydown (event) {
    if (!isOpen.value && ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
      isOpen.value=true
      return
    }
    switch(event.key){
      case 'ArrowDown':
        event.preventDefault()
        if (highlightedIndex.value < filteredOptions.value.length - 1) 
          highlightedIndex.value++
        break
      case 'ArrowUp':
        event.preventDefault()
        if (highlightedIndex.value > 0) 
          highlightedIndex.value--
        break
      case 'Enter':
        event.preventDefault()
        const option=filteredOptions.value[highlightedIndex.value]
        if (option !== undefined) 
          selectOption(option)
        break
      case 'Escape':
        closeDropdown()
      }
  }
  function clearSelection () {
    model.value=null
    search.value=''
    selectOption(null)
    closeDropdown()
  }
  function handleClickOutside (event) {
    if (rootEl.value && !rootEl.value.contains(event.target)) {
      closeDropdown()
    }
  }

  onMounted(() => {
    if(props.data) model.value=props.data
    document.addEventListener('click', handleClickOutside)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>

<template>
  <div ref="rootEl" class="searchable-select">
    <div class="input-wrapper">
      <input
        v-model="search"
        :placeholder="model?.idExpoLoc == null ? placeholder : displayValue"
        class="search-input"
        type="text"
        @focus="openDropdown"
        @input="onInput"
        @keydown="onKeydown"
      >
      <q-icon v-if="model?.idExpoLoc != null || search" name="cancel" 
        @click="clearSelection" class="cursor-pointer" size="2.3rem" 
      />
    </div>
    <div v-if="isOpen" class="dropdown">
      <div
        v-if="filteredOptions.length === 0"
        class="dropdown-item empty"
      >
        {{ $t('comps.form_details.expos.tables.selection.location.no_position') }}
      </div>
      <div
        v-for="(option, index) in filteredOptions"
        :key="option"
        class="dropdown-item"
        :class="{ highlighted: index === highlightedIndex }"
        @mousedown.prevent="selectOption(option)"
      >
        {{ option.idLoc }}
      </div>
    </div>
  </div>
</template>

<style scoped>
  .searchable-select {
    position: relative;
    width: 180px;
    margin:5px auto;
  }
  .input-wrapper {
    position: relative;
  }
  .search-input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 30px 8px 10px;
    border: 1px solid #ccc;
    border-radius: 10px;
    outline: none;
    height:30px;
  }
  .search-input:focus {
    border-color: #999;
  }
  .cursor-pointer {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.7;
    z-index:10000;
  }
  .dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 180px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: white;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    z-index: 1000;
  }
  .dropdown-item {
    padding: 6px 10px;
    cursor: pointer;
    line-height: 1.2;
  }
  .dropdown-item:hover,
  .dropdown-item.highlighted {
    background: #f3f3f3;
  }
  .dropdown-item.empty {
    color: #777;
    cursor: default;
  }
</style>