<script setup>
  import {ref, computed, onMounted} from 'vue'
  import _ from 'lodash'
  import CheckBox from '../../fields/CheckBox.vue'
  import Label3 from './labels/Label3.vue'
  import ActionMenu from './actions/ActionMenu.vue'
  import UserActions from './actions/user/UserActions.vue'
  import UserInfos from './actions/user/UserInfos.vue'
  import ExpoActions from './actions/expo/ExpoActions.vue'

  const props=defineProps({
    entity:{type:Object},
    master:{type:Array},
    data:{type:Array},
    newRecId:{type:Number},
    infos:{type:Array},
  })

  const emit=defineEmits(['openDetails','userAction','expoAction','oeuvreAction'])
  const selected=ref({})
  props.data.map((item) => {  //selected.value initialization
    selected.value[item[`id${props.entity.model}`]]=false
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
  const dataGroupBy=computed(() => {
    if(props.entity.listType[0]!=='groupby') return null
    const ids=[],groups=[]
    let obj=null
    props.data.map((item) => {
      if(!ids.includes(item[props.entity.listType[1]])){
        obj={}
        ids.push(item[props.entity.listType[1]])
        obj[props.entity.listType[1]]=item[props.entity.listType[1]]
        obj[props.entity.listType[2]]=item[props.entity.listType[2]]
        obj[props.entity.listType[3]]=item[props.entity.listType[3]] 
        obj.items=[item]       
        groups.push(obj)
      }
      else obj.items.push(item)
    })
    return groups
  })
    
</script>

<template>
  <div v-if="entity.listType[0]==='simple'" v-for="(item,idx) in data">      
    <div :key="idx" class="list-item">
      <CheckBox>  
        <template #checkbox>  <!--named scoped slot -->
          <input
            :id="idx"
            type="checkbox"
            :checked="selected[item[`id${entity.model}`]]"
            @change="(e) => {
              handleSelectionChange(e.target.checked,item[`id${entity.model}`])
            }"
          />
        </template>
        <template #label>  <!--named scoped slot -->
          <Label3
            :id="idx" 
            :item="item" 
            :master="master"
          />
        </template>
      </CheckBox>
      <ActionMenu
        v-if="selected[item[`id${entity.model}`]]"
      > 
        <template #infos> <!--named scoped slot -->
          <UserInfos
            v-if="entity.model==='User'"
            :role="{idRole:item.idRole,role_fr:item.role_fr,role_en:item.role_en}"
            :data="_.filter(infos,(info) => {
              return info.idUser===item.idUser
            })"
          >
          </UserInfos>
          <ExpoInfos
            v-if="entity.model==='Expo'"
            :data="_.filter(infos,(info) => {
              return info.idExpo===item.idExpo
            })"
          >
          </ExpoInfos>
        </template>
        <template #actions> <!--named scoped slot -->
          <UserActions
            v-if="entity.model==='User'"
            :data="item"
            @user-action="(cs) => {
              emit('userAction',cs)
            }"
          ></UserActions>
          <ExpoActions
            v-if="entity.model==='Expo'"
            :data="item"
            @expo-action="(cs) => {
              emit('expoAction',cs)
            }"
          ></ExpoActions>
        </template>
      </ActionMenu>
    </div>
  </div>
  <div v-if="dataGroupBy">   
    <div v-for="(group,idx) in dataGroupBy" class="group">
      <div :key="idx" class="list-item">
        <Label3
          :id="idx" 
          :item="group" 
          :master="master"
          :rows="[1]"
        >
        </Label3>        
        <CheckBox v-for="(item,i) in group.items">  
          <template #checkbox>  <!--named scoped slot -->
            <input
              :id="i"
              type="checkbox"
              :checked="selected[item[`id${entity.model}`]]"
              @change="(e) => {
                handleSelectionChange(e.target.checked,item[`id${entity.model}`])
              }"
            />
          </template>
          <template #label>  <!--named scoped slot -->
            <Label3
              :id="i" 
              :item="item" 
              :master="master"
              :rows="[2]"
            />
          </template>
        </CheckBox>
      </div>
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