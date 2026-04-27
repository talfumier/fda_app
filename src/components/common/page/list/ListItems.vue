<script setup>
  import {ref, nextTick, computed} from 'vue'
  import _ from 'lodash'
  import CheckBox from '../../fields/CheckBox.vue'
  import Label3 from './labels/Label3.vue'
  import ActionMenu from './actions/ActionMenu.vue'
  import UserActions from './actions/user/UserActions.vue'
  import UserInfos from './actions/user/UserInfos.vue'
  import ExpoActions from './actions/expo/ExpoActions.vue'
  import ExpoInfos from './actions/expo/ExpoInfos.vue'
  import BookingInfos from './actions/booking/BookingInfos.vue'
  import FaqInfos from './actions/faq/FaqInfos.vue'
  import FaqActions from './actions/faq/FaqActions.vue'
  import ReviewInfos from './actions/review/ReviewInfos.vue'
  import ReviewActions from './actions/review/ReviewActions.vue'

  const props=defineProps({
    entity:{type:Object},
    master:{type:Array},
    selectOption:{type:Object},
    data:{type:Array},
    selectedId:{type:Number},
    infos:{type:Array},
  })
  
  const emit=defineEmits(['openDetails','userAction','expoAction','oeuvreAction','faqAction','commentAction'])
  const selected=ref({})
  props.data.map((item) => {  //selected.value initialization
    selected.value[item[`id${props.entity.model}`]]=false
    if(props.selectedId) selected.value[props.selectedId]=true  //initial value coming from Master.vue (new record)
  })
  const listContainer = ref(null)
  const scrollPosition = ref(0)
  function handleSelectionChange(val,id){
    if (listContainer.value) scrollPosition.value = listContainer.value.scrollTop
    const keys=Object.keys(selected.value)
    keys.map((key) => {      
      if(key==id) selected.value[key]=val
      else selected.value[key]=false
    })
    emit('openDetails',val?id:null)  //if id not null populate FormDetails, if id null empty FormDetails
    // DOM is NOW updated! Restore scroll after parent processes the emit and DOM updates
    nextTick(() => {
      if (listContainer.value) {
        listContainer.value.scrollTop = scrollPosition
      }
    })
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
  function getRowSchema(){
    switch(props.entity.model){
      case 'Oeuvre':
      case 'Partner':
        return ['1.1']
      case 'Expo':
      case 'Doc':
      case 'Faq':
      case 'Booking':
        return ['1.1','2.1']
      default:
        return ['1.1','1.2','2.1']
    }
  }
    
</script>

<template>
  <div 
    ref="listContainer"
    class="scrollable-list"
  >
    <div 
      v-if="entity.listType[0]==='simple'" 
      v-for="(item,idx) in data"
    > 
      <div :key="item" class="list-item">
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
              :key="item"
              :item="item" 
              :master="master"
              :rowSchema="getRowSchema()"
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
            <BookingInfos
              v-if="entity.model==='Booking'"
              :data="_.filter(infos,(info) => {
                return info.idBooking==item.idBooking
              })"
            >
            </BookingInfos>      
            <FaqInfos
              v-if="entity.model==='Faq'"
              :data="_.filter(infos,(info) => {
                return info.idFaq==item.idFaq
              })"
            >
            </FaqInfos>
            <ReviewInfos
              v-if="entity.model==='ExpoComment'"
              :data="_.filter(infos,(info) => {
                return info.idExpoComment==item.idExpoComment
              })"
            >
            </ReviewInfos>
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
            <FaqActions
              v-if="entity.model==='Faq'"
              :data="item"
              @faq-action="(cs) => {
                emit('faqAction',cs)
              }"
            ></FaqActions>
            <ReviewActions
              v-if="entity.model==='ExpoComment'"
              :data="item"
              @comment-action="(cs) => {
                emit('commentAction',cs)
              }"
            ></ReviewActions>
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
            :rowSchema="['1.1','1.2']"
          >
          </Label3>        
          <CheckBox v-for="(item,i) in group.items">  
            <template #checkbox>  <!--named scoped slot -->
              <input
                :id="`${idx}-${i}`"
                type="checkbox"
                :checked="selected[item[`id${entity.model}`]]"
                @change="(e) => {
                  handleSelectionChange(e.target.checked,item[`id${entity.model}`])
                }"
              />
            </template>
            <template #label>  <!--named scoped slot -->
              <Label3
                :id="`${idx}-${i}`" 
                :item="item" 
                :master="master"
                :rowSchema="['2.1']"
              />
            </template>
          </CheckBox>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>  
  .list-item {
    display:flex;
    flex-direction: column;
    justify-content: center;
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