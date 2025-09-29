<script setup async>
  import { ref,computed,onMounted,onUnmounted,inject} from 'vue'
  import { onBeforeRouteLeave } from 'vue-router'
  import { useQuasar } from 'quasar'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import { getEntitiesBySql,postEntity,patchEntity,deleteEntity, getEntityFields } from '@/services/httpEntities.js'
  import { deleteInCloud } from '@/services/httpCloudinary.js'
  import { forgotPassword } from '@/services/httpUsers.js'
  import ListItems from './list/ListItems.vue'
  import FormDetails from './details/FormDetails.vue'
  import Toolbar from '../toolbar/Toolbar.vue'
  import Tooltip from '../Tooltip.vue'
  import clearables from "../page/details/clearables.json"
  import { confirm } from '../dialog/dialog.js'
  import { translate } from '@/services/httpGoogleServices.js'

  const props=defineProps({
    entity:{type:Object},
    fieldsets:{type:Array},
  })

  const {locale,t}=useI18n()  
  const {token,decoded}=inject('userCookie')
  const $q=useQuasar()
  //field_master definition, formValid initialization
  const field_master=ref([])
  let fltr=null
  const obj={}
  props.fieldsets.map((fldset) => {
    if(!fldset.fields) return
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
  
  const state=ref([])
  const selectedId = ref(null)
  const newRecId=ref(0)

  const initialValues=[]
  const actualChanges=ref([])

  function getIndex(){
    return state.value[0].findIndex((item) => {
      return item[`id${props.entity.model}`]===selectedId.value
    }) 
  }  
  function resetActualChanges(){
    const idModel=`id${props.entity.model}`
    let obj={}
    // initialize actualChanges >>> all fields set to false, idModel changed to id
    actualChanges.value=[]
    initialValues.map((init) => {  
      obj=Object.keys(init).reduce((acc, key) => 
          (acc[key!==idModel?key:'id'] = key!==idModel?false:init[idModel], acc), {})
      actualChanges.value.push({...obj})
    })
  }
  function handleOpenDetails(id){
    selectedId.value=id  
  }
  function isEqual(val1,val2,name){
    if(name.includes('file') || name==='url' || name==='idImage') return true
    if((val1==='' || val1===null) && (val2==='' || val2===null)) return true
    return val1==val2
  }
  function handleChange(id,name,valid,val){ 
    const idx=getIndex()
    actualChanges.value[idx][name]=!isEqual(initialValues[idx][name],val,name)
    state.value[0][idx][name]=val
    formValid.value[name]=valid
  }
  async function handleTranslate(id,params){
    const idx=getIndex()  
    const {from,to,rootName}=params  
    const translated = (
      await translate({
        text:state.value[0][idx][`${rootName}_${from}`],
        to,
        from,
      })
    ).data
    handleChange(id,`${rootName}_${to}`,true,translated)
    initFlag.value+=.01
  }
  // DATA LOADING
  const ctrls={} // AbortController's object' used in http request operation
  let alive = true // guard against updates after unmount
  async function fetch(i=0) {
    if (!alive) return                // component gone? don't touch state 
    if (ctrls[0]) ctrls[0].abort()
    ctrls[0] = new AbortController()
    let res=null,sqlparams=null,paramsValues=null
    if (props.entity.sql) {
      switch(props.entity.model){
        case 'User':        //returned users have their idRole < signed-in user
          sqlparams=!props.entity.noList?":idRole":":idUser"
          paramsValues=`${!props.entity.noList?decoded.value.idRole:decoded.value.idUser}`
          break
        case 'Expo':
          if(i===1) { //status type
            sqlparams=':type'
            paramsValues='expo'
          } 
          break
        case 'Oeuvre':
          if(props.entity.idx===3){   //My art works >>> roles [1, 7]
            sqlparams=':idUser'
            paramsValues=decoded.value.idUser
          }
          break
        case 'Booking':
          if(props.entity.idx===5){   //My bookings >>> roles [1, 7]
            sqlparams=':idUser'
            paramsValues=decoded.value.idUser
          }
          break
      }
      res=(await getEntitiesBySql(
          props.entity.sql[i],
          token.value,
          ctrls[0].signal,
          sqlparams, 
          paramsValues
        )).data      
    }
    return res.data    
  }  
  function initInitialValues(id=null){
    _.cloneDeep(state.value[0]).map((item,idx) => {  //initialize initialValues, cloneDeep necessary
      if(!id || item[`id${props.entity.model}`]===id) initialValues.push(item)
    })
  }
  onMounted(async () => {  
    state.value = await fetch(0) 
    initInitialValues()
    resetActualChanges()
    if(props.entity.noList) {
      let id=null
      switch(props.entity.model){
        case 'User':                  // WARNING !!!!! >>> MODEL SPECIFIC HERE
          id=decoded.value.idUser
          break
      }
      handleOpenDetails(id)
    }
    window.addEventListener('beforeunload', beforeUnload)
  })
  onUnmounted(() => { // clean-up code after component has unmounted    
    alive = false;
    Object.keys(ctrls).map((key) => {
       ctrls[key]?.abort() 
    })
    window.removeEventListener('beforeunload', beforeUnload) 
  })    
  // DETECTING ROUTE CHANGES INSIDE SPA, PAGE REFRESH/CLOSE  
  async function beforeUnload(e){  //no custom confirm dialog for browser originated refresh
    if(!JSON.stringify(actualChanges.value).includes(true)) return
    e.preventDefault()
    e.returnValue = '' // required for some browsers
  }
  onBeforeRouteLeave(async() => {    
    if(!JSON.stringify(actualChanges.value).includes(true)) return true
    if (!(await confirm($q,t('common.unsaved'),'cancel'))) return false    
  })
  // FOLDING MENU
  const isRotated = ref(false)
  function rotateIcon() {
    isRotated.value=!isRotated.value
  }
  // ACTIONS - MODEL INDEPENDANT
  async function handleDelete(idx){  //applicable to tuser, toeuvre >>> idImage as a field in table, tbooking >>> no idImage        
    const idImage=state.value[0][idx].idImage 
    if(selectedId.value>0) {
      const res=await deleteEntity(props.entity.model,selectedId.value,token.value, ctrls[1].signal)  //delete record in tuser, toeuvre, tbooking ...  
      if(res.data.statusCode!==200) return                                            //deletion of corresponding records in tstatus_tracking done by cascade delete
    }     
    state.value[0].splice(idx,1)  //update state  
    if(idImage) {
      const {data:res}= await deleteEntity('Image',idImage,token.value, ctrls[1].signal)  //delete record in timage
      if(res.statusCode===200) 
        try {
          await deleteInCloud(idImage,token.value,ctrls[1].signal) //delete asset on Cloudinary.com                  
        } catch (error) {}  //asset no longer present
    } 
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
          cond.push(JSON.stringify(item).toLowerCase().includes(listItemsFilter.value.search.toLowerCase()))
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
      handleAction = async(cs)=>{    
        if (!alive) return                // component gone? don't touch state 
        if (ctrls[1]) ctrls[1].abort()
        ctrls[1] = new AbortController()
        let res=null,status=2
        const idx=getIndex()
        switch(cs){      
          case "deactivation":
            status=3
          case "validation":
            //database update
            res=await postEntity('StatusTracking', {idStatus:status,idUser:selectedId.value}, token.value, ctrls[1].signal)
            // state update
            if(res.data.statusCode!==200) return
            state.value[1].unshift({idUser:selectedId.value,idStatus:status,createdAt:new Date(Date.now())})
            state.value[0][idx].idStatus=status
        }
      }
      break
    case "Expo":
      listItemsFilter=ref({search:'',expo_status:''})  
      filteredList=computed(() => {  
        return _.filter(state.value[0],(item) => {
          let cond=[],result=true
          cond.push(JSON.stringify(item).toLowerCase().includes(listItemsFilter.value.search.toLowerCase()))
          cond.push(listItemsFilter.value.expo_status?item.idStatus===11 || item.idStatus===11:
            (listItemsFilter.value.expo_status===false?item.idStatus===13:item.idStatus>=11)) 
          cond.map((cnd) => {
            result=result && cnd
          })
          return result
        })
      })
      toggleOn = ref({status:false})
      getToggleLabel = (toggle)=>{
        switch(listItemsFilter.value[`expo_${toggle}`]){
          case true:
            toggleOn.value[toggle]=true
            return t(`comps.list_items.actions_menu.expo.${toggle}.${toggle==='status'?'active':'archived'}`) 
          case false:
            toggleOn.value[toggle]=false
            return t(`comps.list_items.actions_menu.expo.${toggle}.${toggle==='status'?'archived':'active'}`)
          default:
            return t(`comps.list_items.actions_menu.expo.${toggle}.indeterminate`)
        }
      }
      handleAction = async(cs)=>{    
        if (!alive) return                // component gone? don't touch state 
        if (ctrls[1]) ctrls[1].abort()
        ctrls[1] = new AbortController()
        let res=null,status=11
        const idx=getIndex()
        switch(cs){      
          case "archiving":
            status=13
          case "activation":
            //database update
            res=await postEntity('StatusTracking', {idStatus:status,idExpo:selectedId.value}, token.value, ctrls[1].signal)
            // state update
            if(res.data.statusCode!==200) return
            state.value[1].unshift({idExpo:selectedId.value,idStatus:status,createdAt:new Date(Date.now())})
            state.value[0][idx].idStatus=status
            break;
          case "deletion":
            const {data:images}=(await getEntitiesBySql(
              'list_images_expo',
              token.value,
              ctrls[1].signal,
              ':idExpo', 
              selectedId.value
            )).data
            if(selectedId.value>0) {  //delete record in texpo >>> record(s) in texpo_image deleted by cascade delete from tExpo
              res=await deleteEntity('Expo',selectedId.value,token.value, ctrls[1].signal) 
              if(res.data.statusCode!==200) return 
            } 
            //delete images in timage and delete asset on Cloudinary.com
            images[0].map(async(image) => {
              //delete record in timage
              res=await deleteEntity('Image',image.idImage,token.value, ctrls[1].signal)  
              if(res.data.statusCode===200) { 
                try {   //delete asset on Cloudinary.com
                  await deleteInCloud(image.idImage,token.value,ctrls[1].signal)                   
                } catch (error) {}  //asset no longer present
              }
            })      
            state.value[0].splice(idx,1)  //update state
        }
      }
      break
    case 'Oeuvre':
      listItemsFilter=ref({search:'',oeuvre_status:''})  
      filteredList=computed(() => {  
        return _.filter(state.value[0],(item) => {
          let cond=[],result=true
          cond.push(JSON.stringify(item).toLowerCase().includes(listItemsFilter.value.search.toLowerCase()))
          // cond.push(listItemsFilter.value.expo_status?item.idStatus===10 || item.idStatus===11:
          //   (listItemsFilter.value.expo_status===false?item.idStatus===12:item.idStatus>=10)) 
          cond.map((cnd) => {
            result=result && cnd
          })
          return result
        })
      })      
      handleAction = async(cs)=>{    
        if (!alive) return                // component gone? don't touch state 
        if (ctrls[1]) ctrls[1].abort()
        ctrls[1] = new AbortController()
        const idx=getIndex()
        switch(cs){     
          case "deletion":
            handleDelete(idx)
        }
      }
      break
      
    case 'Booking':
      listItemsFilter=ref({search:'',booking_status:''})  
      filteredList=computed(() => {  
        return _.filter(state.value[0],(item) => {
          let cond=[],result=true
          cond.push(JSON.stringify(item).toLowerCase().includes(listItemsFilter.value.search.toLowerCase()))
          // cond.push(listItemsFilter.value.expo_status?item.idStatus===10 || item.idStatus===11:
          //   (listItemsFilter.value.expo_status===false?item.idStatus===12:item.idStatus>=10)) 
          cond.map((cnd) => {
            result=result && cnd
          })
          return result
        })
      })      
      handleAction = async(cs)=>{    
        if (!alive) return                // component gone? don't touch state 
        if (ctrls[1]) ctrls[1].abort()
        ctrls[1] = new AbortController()
        const idx=getIndex()
        switch(cs){     
          case "deletion":
            handleDelete(idx)
            initFlag.value+=.01    //forces computed filteredDetails update >>> key property in FormDetails component in below template
        }
      }
      break
  }
  const initFlag=ref(0)
  const filteredDetails = computed(() => {
    if(state.value.length===0) return
    return _.filter(state.value[0],(item) => {
        return (item[`id${props.entity.model}`]===selectedId.value)
      })[0]
  })
  function filteredDetailsTrigger(){  //trigger filteredDetails computed update, see FormDetails component key in the template
    return parseInt(selectedId.value)+initFlag.value
  }

function initNewrec(){
  const obj={}
  props.fieldsets.map((fieldset) => {
    fieldset.fields?.map((field) => {
      obj[field.name]=null
    })
  })
  newRecId.value+=-1
  obj[`id${props.entity.model}`]=newRecId.value
  switch(props.entity.model){
    case 'Oeuvre':
      obj.idUser=decoded.value.idUser
      obj.classic_modern=0
      obj.idDomain=null
      obj.idTech=null
      obj.idMedia=null
      obj.idImage=null
      obj.reserved=0
      break
    case 'Booking':
      obj.idUser=decoded.value.idUser
      obj.vernissage=0
      obj.lunch=0

  }
  return obj
}
async function bodyCleanUp(body,signal){  //remove fields not belonging to the model and idModel
  const {data:res}=await getEntityFields(props.entity.model,token.value,signal)
  if(res.statusCode!==200) return body
  const obj={}
  res.data.map((field) => {
    obj[field]=body[field]
  })
  return obj
}
function handleNewRecord(){
    state.value[0]=[...state.value[0],initNewrec()]  
    initInitialValues(newRecId.value) 
    resetActualChanges()
    handleOpenDetails(newRecId.value)
  }
  // TOOLBAR ACTIONS
  async function handleToolbarActions(cs){ 
    let index=null
    switch(cs){
      case "save":
        if (!alive) return                // component gone? don't touch state 
        if (ctrls[2]) ctrls[2].abort()
        ctrls[2] = new AbortController()
        let keys=[],obj=null,res=null 
        actualChanges.value.map(async(item,idx) => {
          obj={}
          keys=Object.keys(item)
          keys.map((key) => {
            if(key!=='id') {
              if(item[key]) obj[key]=state.value[0][idx][key]
            }
            else obj[key]=item[key]
          })  
          let body=null
          const{id,...rest}=obj
          if(id<0) {
            delete state.value[0][idx][`id${props.entity.model}`]
            body=state.value[0][idx]
            body=await bodyCleanUp(body,ctrls[2].signal)
            // delete body.fileName
            // delete body.fileSize
            // delete body.fileLastModified
            // delete body.url
          }
          else body=rest
          if(Object.keys(body).length>=1){
            res=await(id<0?postEntity(props.entity.model,body,token.value, ctrls[2].signal):
              patchEntity(props.entity.model,id,body,token.value, ctrls[2].signal))
            if(res.data.statusCode!==200) return
            keys.map((key) => { 
              if(key!=='id' && item[key]){
                initialValues[idx][key]=state.value[0][idx][key] //update initial values with saved data 
                item[key]=false  //reset actualChanges item to false
              }
            })
            if(id<0) { //new record creation
              state.value[0][idx][`id${props.entity.model}`]=res.data.data[`id${props.entity.model}`] //update id[model]     
              if(props.entity.status_at_creation){
                state.value[0][idx].idStatus=props.entity.status_at_creation.idStatus //update current status data
                state.value[0][idx].status_en=props.entity.status_at_creation.status_en                
                state.value[0][idx].status_fr=props.entity.status_at_creation.status_fr
                state.value[0][idx].type=props.entity.status_at_creation.type
                state.value[1]=(await fetch(1))[0] //retrieve updated status tracking data
              }
              newRecId.value=res.data.data[`id${props.entity.model}`]
              handleOpenDetails(newRecId.value)
            }
          }
        }) 
        break
      case "clear":
        index=getIndex()
        clearables[`${props.entity.model}`].map((prop) => {
          if(state.value[0][index][prop[0]])
            state.value[0][index][prop[0]]=prop.length===1?null:prop[1]  //actualChanges updated by state reativity mechanism
        })
        break
      case "undo":
        index=getIndex()
        state.value[0][index]=_.cloneDeep(initialValues[index])  //cloneDeep necessary
        resetActualChanges()
        break
      case "deletion":
        handleAction('deletion')

    }
    initFlag.value+=.01    //forces computed filteredDetails update >>> key property in FormDetails component in below template
  }
  const changeStatus=computed(() => {
    let n=0
    actualChanges.value.map((item) => {
      if(JSON.stringify(item).includes(true)) n+=1
    })
    return n
  })
  // BUTTON ACTIONS - MODEL SPECIFIC 
  async function handleButtonActions(name) {
    switch(props.entity.model){
      case 'User':
        switch(name){
          case 'change_password':
            await forgotPassword(decoded.value.email, locale.value)
            break
          case 'delete_account':
            if (!(await confirm($q,t('comps.list_items.actions_menu.user.confirm.deletion'),'cancel'))) return false 
            handleAction('deletion')
        }
        break    
    }
  }
  //SELECT OPTION DATA HANDLING
  function handleSelectOption(option) {
    if(!option) return
    const idx=getIndex(selectedId.value)
    if(option.data){
      const obj={}
      Object.keys(state.value[0][idx]).map((key) => {
        if(option.data[key]) obj[key]=option.data[key]
      })
      state.value[0][idx]={...state.value[0][idx],...obj}
      initFlag.value+=.01    //forces computed filteredDetails update >>> key property in FormDetails component in below template
    }
  }

</script>

<template>
  <section v-if="state.length!==0" :class="['master-container',entity.noList?'no-list':'',isRotated?'folded':'']">
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
        <span v-if="!isRotated">{{ `${filteredList.length}/${state[0].length}` }}</span>
        <div class="toggle"> 
          <q-toggle
            v-if="entity.model==='User' || entity.model==='Expo'"
            v-model="listItemsFilter[`${entity.model.toLowerCase()}_status`]"
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
      </div>  
      <div class="btn-add-fold">     
        <div v-if="entity.newRecord">    
          <q-btn 
            class="glossy" 
            round push color="primary" 
            icon="add" size="md" 
            @click="handleNewRecord"
          />        
          <Tooltip :tt_text="$t('comps.master.add_btn')"></Tooltip>   
        </div>     
        <q-icon 
          class="btn-fold"
          name="keyboard_double_arrow_left" 
          size="md"
          @click="rotateIcon"
        >
        </q-icon>
      </div>  
    </aside>
    <aside v-if="!entity.noList" :class="['list-container',isRotated?'folded':'']">
      <ListItems  
        :key="newRecId"     
        :entity="entity"
        :master="field_master"
        :data="filteredList"
        :newRecId="newRecId"
        :infos="state.length>1?state[1]:null"
        @open-details="handleOpenDetails"
        @user-action="handleAction"
        @expo-action="handleAction"
        @oeuvre-action="handleAction"
      >
      </ListItems>
    </aside>
    <form class="details-container">
      <FormDetails 
        v-if="selectedId && filteredDetails" 
        :key="filteredDetailsTrigger()"
        :entity="entity" 
        :fieldsets="fieldsets" 
        :record="filteredDetails"
        @change="handleChange"
        @translate="handleTranslate"
        @button-action="handleButtonActions"
        @select-object="(option) => {
          handleSelectOption(option)
        }"
        >
        <template #toolbar> <!--named scoped slot -->
          <Toolbar class="toolbar"
            :actualChange="changeStatus"
            :model="entity.model"
            @toolbar-actions="handleToolbarActions"
          >
          </Toolbar>
        </template> 
      </FormDetails>
    </form>
    <div v-if="fieldsets[fieldsets.length-1].type==='button-bottom' && filteredDetails" :class="['bottom-container',entity.model]">
      <FieldsetButton          
        key="bottom"
        :buttons="fieldsets[fieldsets.length-1].buttons"  
        @button-action="handleButtonActions"      
      >
      </FieldsetButton>
    </div>
  </section>
</template>

<style scoped>
  .master-container {
    display: grid;
    grid-template-rows:100px auto auto;
    grid-template-columns: auto auto;
    justify-content: left;
    height:100%;   
    position:relative;
  }  
  .master-container.no-list {
    grid-template-columns: 80%;
  }
  .master-container.folded {
    grid-template-columns: 40px auto;
  }
  .top-container {    
    grid-area: 1/1;
    display:flex;
    justify-content:right;
    align-items:flex-start;
  }
  .top-container .q-input {
    margin: 0 ;
  }
  .btn-add-fold {
    display:flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height:100%;
  }
  .btn-add-fold .q-btn {
    width:40px;
    height:30px;
  }
  
  .q-icon.btn-fold {
    width:40px;
    height:30px;    
    border-radius: 5px;    
    color:var(--orange);
    background-color: red;
    cursor: pointer;
    margin:5px 0;
  }
  .filter {
    display:flex;
    flex-direction: column;
    justify-content:top;
    align-items: left;    
    border-right: 1px solid lightgrey;
    height:100%;
  }
  .filter span {
    font-size:1.3rem;
    text-wrap: nowrap;
    text-align: center;
  }
  .toggle {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    padding-right: 10px;      
    border-top: 1px solid lightgrey;
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
    height:100%;
    overflow-y: auto;
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
    border-left: 1px solid lightgrey;
    display:flex;
    flex-direction: column;
    justify-content: top;
    width:100%; 
    padding-right:50px;
    margin-bottom: 28px;
    overflow-y: auto;
  }
  .no-list .details-container {    
    grid-column: 1;
  }
  .bottom-container {
    display:flex;
    justify-content: center;
    align-items: center;
    padding-bottom:20px;
    padding-right: 50px;
    
    grid-row: 3;
    align-self: center;
  }
  .bottom-container.User {
    grid-column: 1;
  }
  .bottom-container.Booking {
    grid-column: 2;
  }
  fieldset.button-bottom {
    border-width: 0;
    margin:0;
  }
  .toolbar {
    position:absolute;
    top:10px;
    right:20px;
    z-index: 5000;
  }
  div.folded .details-container {
    border-width: 0;
  }

</style>