<script setup>
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import Tooltip from '../Tooltip.vue';
  import { confirm } from '../dialog/dialog.js';

  const props=defineProps({
    actualChange:{type:Number},
    model:{type:String}
  })  
  
  const $q=useQuasar()
  const {t}=useI18n()
 
  const emit=defineEmits(['toolbarActions'])

  async function handleActions(cs){    
    if (cs==='deletion' && !(await confirm($q,t(`common.confirm.${cs}`),'cancel'))) return
    emit('toolbarActions',cs)
  }

</script>

<template>
  <q-btn class="bg-blue-grey-2" push  >
    <div class="menu">
      <div class="save">
        <q-btn round flat icon="save" 
          :size="`${actualChange===0?'1.6rem':'1.8rem'}`" 
          :class="`${actualChange==0?'':'pulse'}`" 
          :disable="actualChange===0" 
          @click="handleActions('save')">
        </q-btn>
        <q-badge v-if="actualChange>=1" color="orange" text-color="black" :label="actualChange" />
        <Tooltip :tt_text="$t('common.save')"></Tooltip>
      </div>
      <div class="clear" > 
        <q-btn round flat icon="clear_all" size="1.6rem" @click="handleActions('clear')" />
        <Tooltip :tt_text="$t('common.clearAll')"></Tooltip>
      </div>
      <div class="undo">        
        <q-btn round flat icon="undo" size="1.6rem" @click="handleActions('undo')" />
        <Tooltip :tt_text="$t('common.undo')"></Tooltip>
      </div>
      <div v-if="model==='Oeuvre' "class="delete">        
        <q-btn round flat icon="delete" size="1.6rem" @click="handleActions('deletion')" />
        <Tooltip :tt_text="$t('common.delete')"></Tooltip>
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
    position:relative;
    color:var(--green);
  }
  .delete {    
    color:var(--red-opaque8);
  }
  .q-badge {
    position:absolute;
    top:5px;
    right:0;
  }
  .clear, .undo {    
    color:var(--blue);
  }
  .q-btn {
    padding: 0 5px;
  }
  @keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(0,0,0,.0) }
  40%  { box-shadow: 0 0 0 8px rgba(25,118,210,.25) } /* adjust color */
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,.0) }
  }
  .pulse { animation: pulse 1.2s ease-out infinite }
</style>