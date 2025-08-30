<script setup>
  import { defineEmits } from 'vue';
  import Tooltip from '../Tooltip.vue';

  const props=defineProps({
    actualChange:{type:Boolean}
  })  
 
  const emit=defineEmits(['toolbarActions'])

  function handleActions(cs){
    emit('toolbarActions',cs)
  }

</script>

<template>
  <q-btn class="bg-blue-grey-2" push  >
    <div class="menu">
      <div class="save">
        <q-btn round flat icon="save" :size="`${!actualChange?'1.6rem':'1.8rem'}`" :disable="!actualChange" @click="handleActions('save')"></q-btn>
        <Tooltip :tt_text="$t('common.save')"></Tooltip>
      </div>
      <div class="clear" > 
        <q-btn round flat icon="clear_all" size="1.6rem" @click="handleActions('clear')" />
        <Tooltip :tt_text="$t('common.clear')"></Tooltip>
      </div>
      <div class="undo">        
        <q-btn round flat icon="undo" size="1.6rem" :disable="!actualChange" @click="handleActions('undo')" />
        <Tooltip :tt_text="$t('common.undo')"></Tooltip>
      </div>
    </div>
  </q-btn>
</template>

<style scoped>
  .q-btn.bg-blue-grey-2 {    
    border: solid 1px grey;
  }
  .menu {
    display: flex;
    justify-content:center;
  }
  .menu div {    
    cursor: pointer;
  }
  .save {    
    color:var(--green);
  }
  .clear, .undo {    
    color:var(--blue);
  }
  .q-btn {
    padding: 0 5px;
  }
</style>