<script setup>
  import { defineEmits } from 'vue';
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import Tooltip from '@/components/common/Tooltip.vue';
  import { confirm } from '@/components/common/dialog/dialog.js';

  const props=defineProps({
    data:{type:Object}
  })  
  const $q=useQuasar()
  const {t}=useI18n()
  const emit=defineEmits(['userAction'])

  async function handleActions(cs){
    if (!(await confirm($q,t(`comps.list_items.actions_menu.user.confirm.${cs}`),'cancel'))) return
    emit('userAction',cs,props.data.idUser)

  }

</script>

<template>
  <q-btn class="bg-blue-grey-2" unelevated rounded >
    <div class="menu">
      <div class="validation">
        <q-btn round flat dense icon="done_all" :disable="data.idStatus===2" @click="handleActions('validation')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.user.validation')"></Tooltip>
      </div>
      <div class="deactivation" > 
        <q-btn round flat dense icon="no_accounts" :disable="data.idStatus===3" @click="" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.user.deactivation')"></Tooltip>
      </div>
      <div class="delete">        
        <q-btn round flat dense icon="delete" @click="" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.user.delete')"></Tooltip>
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
    justify-content:center !important;
  }
  .menu div {    
    cursor: pointer;
  }
  .validation {    
    color:var(--green);
  }
  .deactivation, .delete {    
    color:var(--red-opaque8);
  }
  .deactivation {
    border-left: solid 1px;
    border-right:solid 1px;
    border-color: grey;
  }
  .q-btn {
    padding:0 15px;
  }
</style>