<script setup>
  import {ref} from 'vue'
  import _ from 'lodash'
  import CheckBox from '../../fields/CheckBox.vue'
  import Label3 from './labels/Label3.vue'
  import ActionMenu from './actions/ActionMenu.vue'
  import UserActions from './actions/user/UserActions.vue'
  import UserInfos from './actions/user/UserInfos.vue'
  import ExpoActions from './actions/expo/ExpoActions.vue'
  import OeuvreActions from './actions/oeuvre/OeuvreActions.vue'

  const props=defineProps({
    model:{type:String},
    master:{type:Array},
    data:{type:Array},
    newRecId:{type:Number},
    infos:{type:Array},
  })
  
  const emit=defineEmits(['openDetails','userAction','expoAction','oeuvreAction'])
  const selected=ref({})
  props.data.map((item) => {  //selected.value initialization
    selected.value[item[`id${props.model}`]]=false
    if(props.newRecId!==0) selected.value[props.newRecId]=true
  })
  function handleSelectionChange(val,id){
    const keys=Object.keys(selected.value)
    keys.map((key) => {      
      if(key==id) selected.value[key]=val
      else selected.value[key]=false
    })
    emit('openDetails',val?id:null)  //if id not null populate FormDetails, if id null empty FormDetails
  }
  function setCase(){  //1st label case setting
    switch(props.model){
      case "User":
        return true
      default:
        return false
    }
  }
  
</script>

<template>
  <div v-for="(item,idx) in data">      
    <div :key="idx" class="list-item">
      <CheckBox>  
        <template #checkbox>  <!--named scoped slot -->
          <input
            :id="idx"
            type="checkbox"
            :checked="selected[item[`id${model}`]]"
            @change="(e) => {
              handleSelectionChange(e.target.checked,item[`id${model}`])
            }"
          />
        </template>
        <template #label>  <!--named scoped slot -->
          <Label3 
            :id="idx" 
            :item="item" 
            :master="master"
            :ucase="setCase()"
          />
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
          >
          </UserInfos>
          <ExpoInfos
            v-if="model==='Expo'"
            :data="_.filter(infos,(info) => {
              return info.idExpo===item.idExpo
            })"
          >
          </ExpoInfos>
        </template>
        <template #actions> <!--named scoped slot -->
          <UserActions
            v-if="model==='User'"
            :data="item"
            @user-action="(cs) => {
              emit('userAction',cs)
            }"
          ></UserActions>
          <ExpoActions
            v-if="model==='Expo'"
            :data="item"
            @expo-action="(cs) => {
              emit('expoAction',cs)
            }"
          ></ExpoActions>
          <OeuvreActions
            v-if="model==='Oeuvre'"
            :data="item"
            @oeuvre-action="(cs) => {
              emit('oeuvreAction',cs)
            }">
          </OeuvreActions>
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
  
  label {
    color:var(--black-opaque9);
    text-wrap: nowrap;
    cursor: pointer;
  }
  input {
    transform: scale(1.5);
    margin:5px 10px 0px 5px;
    width: fit-content;
    cursor: pointer;
  }

</style>