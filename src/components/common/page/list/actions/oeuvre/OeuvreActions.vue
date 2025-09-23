<script setup>
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import Tooltip from '@/components/common/Tooltip.vue';
  import { confirm } from '@/components/common/dialog/dialog.js';

  const props=defineProps({
    data:{type:Object}
  })  
  const $q=useQuasar()
  const {t}=useI18n()
  const emit=defineEmits(['oeuvreAction'])

  async function handleActions(cs){
    if (!(await confirm($q,t(`comps.list_items.actions_menu.oeuvre.confirm.${cs}`),'cancel'))) return
    emit('oeuvreAction',cs,props.data.idUser)

  }

</script>

<template>
  <q-btn class="bg-blue-grey-2" push  >
    <div class="menu">
      <!-- <div class="activation">
        <q-btn round flat icon="done_all" size="1.6rem" :disable="data.idStatus===11" @click="handleActions('activation')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.expo.activation')"></Tooltip>
      </div>
      <div class="archiving" > 
        <q-btn round flat icon="no_accounts" size="1.6rem" :disable="data.idStatus===12" @click="handleActions('archiving')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.expo.archiving')"></Tooltip>
      </div> -->
      <div class="delete">        
        <q-btn round flat icon="delete" size="1.6rem" @click="handleActions('deletion')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.oeuvre.delete')"></Tooltip>
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
  .activation {    
    color:var(--green);
  }
  .archiving, .delete {    
    color:var(--red-opaque8);
  }
  .q-btn {
    padding: 0 15px;
  }
</style>