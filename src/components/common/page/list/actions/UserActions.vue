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
  <q-btn class="bg-blue-grey-2" push  >
    <div class="menu">
      <div class="validation">
        <q-btn round flat icon="done_all" size="1.6rem" :disable="data.idStatus===2" @click="handleActions('validation')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.user.validation')"></Tooltip>
      </div>
      <div class="deactivation" > 
        <q-btn round flat icon="no_accounts" size="1.6rem" :disable="data.idStatus===3" @click="handleActions('deactivation')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.user.deactivation')"></Tooltip>
      </div>
      <div class="delete">        
        <q-btn round flat icon="delete" size="1.6rem" @click="handleActions('deletion')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.user.delete')"></Tooltip>
      </div>
    </div>
  </q-btn>
</template>

<style scoped>
  .q-btn.bg-blue-grey-2 {    
    border: solid 1px grey;
    margin-top:5px;
  }
  .menu {
    display: flex;
    justify-content:center;
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
  .q-btn {
    padding: 0 15px;
  }
</style>