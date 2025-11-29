<script setup>
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import Tooltip from '@/components/common/Tooltip.vue';
  import { confirm } from '@/components/common/dialog/dialog.js';

  const props=defineProps({
    data:{type:Object}
  })  

  console.log(props.data)
  const $q=useQuasar()
  const {t}=useI18n()
  const emit=defineEmits(['expoAction'])

  async function handleActions(cs){
    if (!(await confirm($q,t(`comps.form_details.expos.tables.selection.actions.${cs}.confirm`),'cancel'))) return
    emit('expoAction',cs,props.data.idUser)

  }

</script>

<template>
  <q-toolbar 
    class="bg-blue-grey-2 q-pa-none"
    >
    <q-btn 
      flat round dense
      icon="done_all"
      color="green"
      size="1.4rem"
      @click="handleActions('accept')"
    >
      <Tooltip :tt_text="$t('comps.form_details.expos.tables.selection.actions.accept.tt')"></Tooltip>
    </q-btn>
    <q-btn 
      flat round dense
      icon="euro_symbol"
      color="green"
      size="1.3rem"
      @click="handleActions('payment')"
    >
      <Tooltip :tt_text="$t('comps.form_details.expos.tables.selection.actions.payment.tt')"></Tooltip>
    </q-btn>
    <q-btn 
      flat round dense
      icon="no_accounts"
      color="red"
      size="1.4rem"
      @click="handleActions('reject')"
    >
      <Tooltip :tt_text="$t('comps.form_details.expos.tables.selection.actions.reject.tt')"></Tooltip>
    </q-btn>
  </q-toolbar>
</template>

<style scoped>
  .q-toolbar {
    display:flex;
    flex-wrap: nowrap;
    justify-content: space-around;
    height: 30px;
    min-height: 30px;
    width:50%;
    border: solid 1px grey;
    border-radius: 5px;
    margin: 5px 0;
  }
  .q-btn {
    height: 25px; 
    width: 25px;
  }
</style>