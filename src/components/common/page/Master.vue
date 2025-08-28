<script setup async>
  import { ref,computed,onMounted,onUnmounted,inject  } from 'vue';
  import { useI18n } from 'vue-i18n';
  import _ from 'lodash'
  import { getEntitiesBySql,postEntity,patchEntity } from '@/services/httpEntities.js';
  import ListItems from './list/ListItems.vue';
  import FormDetails from './details/FormDetails.vue';

  const {entity,fieldsets}=defineProps({
    entity:{type:Object},
    fieldsets:{type:Array},
  })
  const {t}=useI18n()  
  const {token,decoded}=inject('userCookie')
  //field_master definition, formValid initialization
  const field_master=ref([])
  let fltr=null
  const obj={}
  fieldsets.map((fldset) => {
    fltr=null
    fltr=_.filter(fldset.fields, (fld) => {
      return fld.listMaster !== undefined
    })    
    if(fltr.length>0) field_master.value=[...field_master.value,...fltr]
    fldset.fields.map((fld) => {
      obj[fld.name]=false
    })
  })
  const formValid=ref({...obj})
  const disabled=computed(() => {
    return JSON.stringify(formValid).indexOf(false) !== -1;
  })
  
  const state=ref(null)
  const selectedId = ref(null)
  const filtered = computed(() => {
    const arr = state.value[0] || []
    const id = selectedId.value
    if (id === null) return null
    return arr.find(item => item[`id${entity.model}`] === id)
  })

  function handleOpenDetails(id){
    selectedId.value=id
  }
  function handleChange(id,name,valid,val){
    const idx=state.value[0].findIndex(record => record[`id${entity.model}`] === id)
    state.value[0][idx][name]=val
    formValid.value[name]=valid
  }
  // DATA LOADING
  const ctrls={} // AbortController's object' used in http request operation
  let alive = true // guard against updates after unmount
  async function fetch() {
    if (ctrls[0]) ctrls[0].abort()
    let sqlparams=null,paramsValues=null
    if (entity.sql && entity.model==="User") //returned users have their idRole < signed-in user but includes the signed-in user record
      sqlparams=":idRole,:idUser"
      paramsValues=`${decoded.value.idRole},${decoded.value.idUser}`
    ctrls[0] = new AbortController()
    let res=null
    if(entity.sql) res=(await getEntitiesBySql(
        entity.sql,
        sqlparams, 
        paramsValues,
        token.value,
        ctrls[0].signal
      )).data
    if (!alive) return                // component gone? don't touch state 
    return res.data
  }  
  onMounted(async () => {  
    state.value = await fetch() 
    state.value[0]=_.filter(state.value[0],(item) => {
      return item.idUser!==decoded.value.idUser  // do not return signed-in user
    })
  })
  onUnmounted(() => { // clean-up code after component has unmounted
    alive = false;
    Object.keys(ctrls).map((key) => {
       ctrls[key]?.abort() 
    })   
  })    
  //fold button
  const isRotated = ref(false)
  function rotateIcon() {
    isRotated.value=!isRotated.value
  }
  //DATA FILTERING
  const stateFilter=ref({search:'',user_status:'',user_role:''})
  const filteredState=computed(() => {
    return _.filter(state.value[0],(item) => {
      let cond=[],result=true
      cond.push(JSON.stringify(item).includes(stateFilter.value.search))
      cond.push(stateFilter.value.user_status?item.idStatus===2 || item.idStatus===3:
        (stateFilter.value.user_status===false?item.idStatus===1:item.idStatus>=1))        
      cond.push(stateFilter.value.user_role?item.idRole>=5:
        (stateFilter.value.user_role===false?item.idRole===1:item.idRole>=1))
      cond.map((cnd) => {
        result=result && cnd
      })
      return result
    })
  })
  const toggleOn = ref({status:false,role:false})
  function getToggleLabel(toggle){
    switch(stateFilter.value[`user_${toggle}`]){
      case true:
        toggleOn.value[toggle]=true
        return t(`comps.list_items.actions_menu.user.${toggle}.${toggle==='status'?'validated':'org'}`) 
      case false:
        toggleOn.value[toggle]=false
        return t(`comps.list_items.actions_menu.user.${toggle}.${toggle==='status'?'pending':'artist'}`)
      default:
        return t(`comps.list_items.actions_menu.user.${toggle}.indeterminate`)
    }
  }
  //MODEL SPECIFIC
  async function handleUserAction(cs,id){    
    if (!alive) return                // component gone? don't touch state 
    if (ctrls[1]) ctrls[1].abort()
    ctrls[1] = new AbortController()
    let status=2
    switch(cs){      
      case "deactivation":
        status=3
      case "validation":
        //database update
        await postEntity('StatusTracking', {idStatus:status,idUser:id}, token.value, ctrls[1].signal)
        // state update
        state.value[1].unshift({idUser:id,idStatus:2,createdAt:new Date(Date.now())})
        const idx=state.value[0].findIndex((item) => {
          return item.idUser===id
        })
        state.value[0][idx].idStatus=2
        break;
      case "deletion":
    }
  }

</script>

<template>
  <section v-if="state" :class="['master-container',isRotated?'folded':'']">
    <aside class="top-container" >
      <div class="filter">   
        <q-input
          dense
          filled
          debounce="300"
          v-model="stateFilter.search"
          :placeholder="$t('common.search')"
          hide-bottom-space
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon name="cancel" @click="stateFilter.search=''" class="cursor-pointer" />
          </template>
        </q-input> 
        <div class="toggle"> 
          <q-toggle
            v-if="entity.model==='User'"
            v-model="stateFilter.user_status"
            toggle-indeterminate
            :label="getToggleLabel('status')"            
            :color="toggleOn.status?'positive':'deep-orange-9'"s
            keep-color
            checked-icon="check"
            unchecked-icon="clear"
            size="md"
          />   
          <q-toggle
            v-if="entity.model==='User'"
            v-model="stateFilter.user_role"
            toggle-indeterminate
            :label="getToggleLabel('role')"
            :color="toggleOn.role?'deep-orange-9':'positive'"
            keep-color
            checked-icon="check"
            unchecked-icon="check"
            size="md"
          />
        </div> 
        <span v-if="!isRotated">{{ `${filteredState.length}/${state[0].length}` }}</span>
      </div>
      <q-icon 
        class="btn-fold"
        name="keyboard_double_arrow_left" 
        size="md"
        @click="rotateIcon"
      >
      </q-icon>
    </aside>
    <aside :class="['list-container',isRotated?'folded':'']">
      <ListItems 
        :model="entity.model"
        :master="field_master"
        :data="filteredState"
        :infos="state.length>1?state[1]:null"
        @open-details="handleOpenDetails"
        @user-action="handleUserAction"
      >
      </ListItems>
    </aside>
    <form class="details-container">
      <FormDetails 
        v-if="selectedId" 
        :key="selectedId"
        :entity="entity" 
        :fieldsets="fieldsets" 
        :record="filtered"
        @change="handleChange"
        >
      </FormDetails>
    </form>
  </section>
</template>

<style scoped>

  .master-container {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows:80px auto;
    justify-content: left;
    height:100%;   
  }  
  .master-container.folded {
    grid-template-columns: 40px auto;
  }
  .top-container {    
    grid-area: 1/1;
    align-self: self-end;   
    display:flex;
    justify-content:right;
    align-items:flex-end;
  }
  .top-container .q-input {
    margin: 0 ;
  }
  .q-icon.btn-fold {
    width:40px;
    height:30px;    
    border-radius: 5px;    
    color:var(--orange);
    background-color: red;
    cursor: pointer;
  }
  .filter {
    position:relative;
    display:flex;
    flex-direction: column;
    align-items: left;    
    border-right: 1px solid lightgrey;
  }
  .filter span {
    position:absolute;
    top: 10px;
    right:-40px;
    font-size:1.3rem;
    text-wrap: nowrap;
  }
  .toggle {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    padding-right: 10px;
  }
  .toggle-role .q-toggle__track { background: #cbd5e1; }                 /* OFF track */
  .toggle-role .q-toggle__thumb { background: var(--green); }                 /* OFF thumb */
  .toggle-role .q-toggle--checked .q-toggle__track { background: #cbd5e1; } /* ON track */
  .toggle-role .q-toggle--checked .q-toggle__thumb { background: var(--orange); }    /* ON thumb */

  .master-container .btn-fold { 
    margin: 0 10px 5px;
    transform: rotate(0deg);
    transition: rotate 0.6s ease;
  }
  .master-container.folded .btn-fold {
    margin: 10px 0;
    transform: rotate(-180deg);
  }
  .list-container {
    grid-area: 2/1;      
    border-top: 1px solid lightgrey;
    visibility:visible;  
    opacity:1;              
    transition: opacity 0.6s ease, visibility 0.6s ease;
  }
  .list-container.folded {
    opacity:0;
    visibility:hidden;
  }
  .details-container {
    grid-row: 1/span 2;
    grid-column: 2;
    border: 1px solid lightgrey;
  }
  div.folded .details-container {
    border-width: 0;
  }

</style>