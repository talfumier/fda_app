<script setup async>
  import { ref,computed,onMounted,onUnmounted,inject  } from 'vue';
  import { useI18n } from 'vue-i18n';
  import _ from 'lodash'
  import { getEntitiesBySql,postEntity,patchEntity } from '@/services/httpEntities.js';
  import ListItems from './list/ListItems.vue';
  import FormDetails from './details/FormDetails.vue';
  import Toolbar from '../toolbar/Toolbar.vue';

  const props=defineProps({
    entity:{type:Object},
    fieldsets:{type:Array},
  })
  
  const {t}=useI18n()  
  const {token,decoded}=inject('userCookie')
  //field_master definition, formValid initialization
  const field_master=ref([])
  let fltr=null
  const obj={}
  props.fieldsets.map((fldset) => {
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
    return JSON.stringify(formValid).includes(false);
  })
  
  const state=ref(null)
  const selectedId = ref(null)

  const initialValues=[]
  const actualChanges=ref([])

  function getIndex(id){
    return state.value[0].findIndex((item) => {
          return item[`id${props.entity.model}`]===selectedId.value
        }) 
  }  
  function handleOpenDetails(id){
    selectedId.value=id
  }
  function handleChange(id,name,valid,val){
    const idx=getIndex(id)      
    actualChanges.value[idx][name]=initialValues[idx][name]!==val
    state.value[0][idx][name]=val
    formValid.value[name]=valid
  }
  // DATA LOADING
  const ctrls={} // AbortController's object' used in http request operation
  let alive = true // guard against updates after unmount
  async function fetch() {
    if (ctrls[0]) ctrls[0].abort()
    ctrls[0] = new AbortController()
    let res=null,sqlparams=null,paramsValues=null
    if (props.entity.sql) {
      switch(props.entity.model){
        case 'User':        //returned users have their idRole < signed-in user
          sqlparams=!props.entity.noList?":idRole":":idUser"
          paramsValues=`${!props.entity.noList?decoded.value.idRole:decoded.value.idUser}`
          break
      }
      res=(await getEntitiesBySql(
          props.entity.sql,
          sqlparams, 
          paramsValues,
          token.value,
          ctrls[0].signal
        )).data      
    }
    if (!alive) return                // component gone? don't touch state 
      return res.data    
  }  
  onMounted(async () => {  
    state.value = await fetch() 
    _.cloneDeep(state.value[0]).map((init) => {  //initialize initialValues, cloneDeep necessary
      initialValues.push(init)
    })
    initialValues.map((init) => {  //initialize actualChanges >>> all fields set to false
      actualChanges.value.push(
        Object.keys(init).reduce((acc, key) => (acc[key] = false, acc), {})
      )
    })
    if(props.entity.noList) {
      let id=null
      switch(props.entity.model){
        case 'User':                  // WARNING !!!!! >>> MODEL SPECIFIC HERE
          id=decoded.value.idUser
          break
      }
      handleOpenDetails(id)
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted    
    alive = false;
    Object.keys(ctrls).map((key) => {
       ctrls[key]?.abort() 
    }) 
  })    
  // FOLDING MENU
  const isRotated = ref(false)
  function rotateIcon() {
    isRotated.value=!isRotated.value
  }
  // LISTITEMS DATA FILTERING AND ACTIONS - MODEL SPECIFIC
  let listItemsFilter=null,filteredList=null,toggleOn = null  //filter 3 position switches
  let getToggleLabel=null, handleAction=null
  switch(props.entity.model){
    case 'User':      
      listItemsFilter=ref({search:'',user_status:'',user_role:''})  
      filteredList=computed(() => {  
        return _.filter(state.value[0],(item) => {
          let cond=[],result=true
          cond.push(JSON.stringify(item).includes(listItemsFilter.value.search))
          cond.push(listItemsFilter.value.user_status?item.idStatus===2 || item.idStatus===3:
            (listItemsFilter.value.user_status===false?item.idStatus===1:item.idStatus>=1))        
          cond.push(listItemsFilter.value.user_role?item.idRole>=5:
            (listItemsFilter.value.user_role===false?item.idRole===1:item.idRole>=1))
          cond.map((cnd) => {
            result=result && cnd
          })
          return result
        })
      })
      toggleOn = ref({status:false,role:false})
      getToggleLabel = (toggle)=>{
        switch(listItemsFilter.value[`user_${toggle}`]){
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
      handleAction = async(cs,id)=>{    
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
      break
  }
  const initFlag=ref(0)
  const filteredDetails = computed(() => {
    return _.filter(state.value[0],(item) => {
        return (item[`id${props.entity.model}`]===selectedId.value)
      })[0]
  })
  function filteredDetailsTrigger(){  //trigger filteredDetails computed update, see FormDetails component key in the template
    return parseInt(selectedId.value)+initFlag.value
  }
  // TOOLBAR ACTIONS
  function handleToolbarActions(cs){
    switch(cs){
      case "save":
      case "clear":
        break
      case "undo":
        const idx=getIndex(selectedId.value)
        state.value[0][idx]=_.cloneDeep(initialValues[idx])  //cloneDeep necessary
        initFlag.value+=.01    //forces computed filteredDetails update >>> key property in FormDetails component in below template
    }
  }

</script>

<template>
  <section v-if="state" :class="['master-container',isRotated?'folded':'']">
    <aside v-if="!entity.noList" class="top-container" >
      <div class="filter">   
        <q-input
          dense
          filled
          debounce="300"
          v-model="listItemsFilter.search"
          :placeholder="$t('common.search')"
          hide-bottom-space
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon name="cancel" @click="listItemsFilter.search=''" class="cursor-pointer" />
          </template>
        </q-input> 
        <div class="toggle"> 
          <q-toggle
            v-if="entity.model==='User'"
            v-model="listItemsFilter.user_status"
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
            v-model="listItemsFilter.user_role"
            toggle-indeterminate
            :label="getToggleLabel('role')"
            :color="toggleOn.role?'deep-orange-9':'positive'"
            keep-color
            checked-icon="check"
            unchecked-icon="check"
            size="md"
          />
        </div> 
        <span v-if="!isRotated">{{ `${filteredList.length}/${state[0].length}` }}</span>
      </div>
      <q-icon 
        class="btn-fold"
        name="keyboard_double_arrow_left" 
        size="md"
        @click="rotateIcon"
      >
      </q-icon>
    </aside>
    <aside v-if="!entity.noList" :class="['list-container',isRotated?'folded':'']">
      <ListItems         
        :model="entity.model"
        :master="field_master"
        :data="filteredList"
        :infos="state.length>1?state[1]:null"
        @open-details="handleOpenDetails"
        @user-action="handleAction"
      >
      </ListItems>
    </aside>
    <form class="details-container">
      <FormDetails 
        v-if="selectedId" 
        :key="filteredDetailsTrigger()"
        :entity="entity" 
        :fieldsets="fieldsets" 
        :record="filteredDetails"
        @change="handleChange"
        >
        <template #toolbar> <!--named scoped slot -->
          <Toolbar class="toolbar"
            :actualChange="JSON.stringify(actualChanges).includes(true)"
            @toolbar-actions="handleToolbarActions"
          >
        </Toolbar>
        </template> 
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
    position:relative;
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
  .toolbar {
    position:absolute;
    top:10px;
    right:20px;
  }
  div.folded .details-container {
    border-width: 0;
  }

</style>