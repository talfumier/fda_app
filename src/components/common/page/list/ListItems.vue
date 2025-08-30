<script setup>
  import {ref,defineEmits} from 'vue'
  import _ from 'lodash'
  import CheckBox from '../../fields/CheckBox.vue';
  import Label3 from './labels/Label3.vue';
  import ActionMenu from './actions/ActionMenu.vue';
  import UserActions from './actions/UserActions.vue';
  import UserInfos from './actions/UserInfos.vue';

  const props=defineProps({
    model:{type:String},
    master:{type:Array},
    data:{type:Array},
    infos:{type:Array},
  })
  const emit=defineEmits(['openDetails','userAction'])

  const selected=ref({})
  props.data.map((item) => {
    selected.value={...selected.value,[item[`id${props.model}`]]:false}
  })
  function handleSelectionChange(val,id){
    const keys=Object.keys(selected.value)
    keys.map((key) => {
      selected.value[key]=(key==id?val:false)
    })
    emit('openDetails',val?id:null)  //if id not null populate FormDetails, if id null empty FormDetails
  }
  
</script>

<template>
  <div v-for="(item,idx) in data">      
    <div :key="idx" class="list-item">
      <CheckBox
        :id="idx"
        :checked="selected[item[`id${model}`]]"
        @selection-change="(val) => {
          handleSelectionChange(val,item[`id${model}`])
        }"
      >      
        <template #label>  <!--named scoped slot -->
          <Label3 :item="item" :master="master" :id="idx" />
        </template>
      </CheckBox>
      <ActionMenu
        v-if="selected[item[`id${model}`]]"
      > 
        <template #infos> <!--named scoped slot -->
          <UserInfos
            v-if="model==='User'"
            :role="{idRole:item.idRole,role_fr:item.role_fr,role_en:item.role_en}"
            :data="_.filter(infos,(info) => {
              return info.idUser===item.idUser
            })"
          ></UserInfos>
        </template>
        <template #actions> <!--named scoped slot -->
          <UserActions
            v-if="model==='User'"
            :data="item"
            @user-action="(cs,id) => {
              emit('userAction',cs,id)
            }"
          ></UserActions>
        </template>
      </ActionMenu>
    </div>
  </div>
</template>

<style scoped>  
  .list-item {
    display:flex;
    flex-direction: column;
    font-size: 1.6rem;
    font-weight: bolder;
    margin: 0 10px;
  }

</style>