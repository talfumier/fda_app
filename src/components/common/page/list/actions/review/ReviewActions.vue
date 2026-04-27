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
  const emit=defineEmits(['commentAction'])

  async function handleActions(cs){
    if (!(await confirm($q,t(`comps.list_items.actions_menu.comment.confirm.${cs}`),'cancel'))) return
    emit('commentAction',cs,props.data.idExpoComment)

  }
</script>

<template>
  <q-btn class="bg-blue-grey-2" push  >
    <div class="menu">
      <div class="publication">
        <q-btn round flat icon="done_all" size="1.6rem" :disable="data.idStatus===29" @click="handleActions('publication')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.comment.publication')"></Tooltip>
      </div>
      <div class="rejection" > 
        <q-btn round flat icon="no_accounts" size="1.6rem" :disable="data.idStatus===30" @click="handleActions('rejection')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.comment.rejection')"></Tooltip>
      </div>
      <div class="delete">        
        <q-btn round flat icon="delete" size="1.6rem" @click="handleActions('deletion')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.comment.delete')"></Tooltip>
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
  .publication {    
    color:var(--green);
  }
  .rejection, .delete {    
    color:var(--red-opaque8);
  }
  .q-btn {
    padding: 0 15px;
  }
</style>