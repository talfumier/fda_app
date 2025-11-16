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
  const emit=defineEmits(['faqAction'])

  async function handleActions(cs){
    if (!(await confirm($q,t(`comps.list_items.actions_menu.faq.confirm.${cs}`),'cancel'))) return
    emit('faqAction',cs,props.data.idFaq)

  }

</script>

<template>
  <q-btn class="bg-blue-grey-2" push  >
    <div class="menu">
      <div class="publication" > 
        <q-btn round flat icon="done_all" size="1.6rem" :disable="data.idStatus===26" @click="handleActions('publication')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.faq.publication')"></Tooltip>
      </div>
      <div class="drafting">
        <q-btn round flat icon="done_all" size="1.6rem" :disable="data.idStatus===25" @click="handleActions('drafting')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.faq.drafting')"></Tooltip>
      </div>
      <div class="delete">        
        <q-btn round flat icon="delete" size="1.6rem" @click="handleActions('deletion')" />
        <Tooltip :tt_text="$t('comps.list_items.actions_menu.faq.delete')"></Tooltip>
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
  .drafting, .delete {    
    color:var(--red-opaque8);
  }
  .q-btn {
    padding: 0 15px;
  }
</style>