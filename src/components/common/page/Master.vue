<script setup>
  import { ref,computed,watch,onMounted,onUnmounted,inject} from 'vue'
  import { onBeforeRouteLeave } from 'vue-router'
  import { useQuasar } from 'quasar'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import { parse } from 'date-fns'
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
  import { newController,doneController,cancelAllInFlight,getRandomInt, getFileExtension,bodyCleanUp } from '@/utilityFunctions.js'
  import { orgExcluded, setGlobals, statusText } from '@/globals/globals.js'

  const props=defineProps({
    entity:{type:Object},
    fieldsets:{type:Array},
  })

  const idModel=`id${props.entity.model}`
  const inFlight=new Set()

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
  // const disabled=computed(() => {
  //   return JSON.stringify(formValid).includes(false);
  // })
  
  const state=ref([])
  const selectedId = ref(null)
  const tabUnsaved=ref(false)
  let newRecId=0

  const initialValues=[]
  const actualChanges=ref([])

  function getIndex(){
    return state.value[0].findIndex((item) => {
      return item[idModel]===selectedId.value
    }) 
  }  
  function resetActualChanges(id){  
    let obj={}
    if(!id) actualChanges.value=[]
    initialValues.map((item) => {  
      if(!id || item[idModel]===id){
        obj=Object.keys(item).reduce((acc, key) => 
            (acc[key!==idModel?key:idModel] = key!==idModel?false:item[idModel], acc), {})   // initialize actualChanges for a given item >>> all fields set to false
        actualChanges.value.push(obj)
      }
    })
  }
  function handleOpenDetails(id){
    selectedId.value=id
  }
  function isEqual(val1,val2){
    if((val1==='' || val1===null) && (val2==='' || val2===null)) return true
    return _.isEqual(val1,val2)  //deep comparison
  }
  function handleSelectOption(name,val,idx,option){
    switch(props.entity.model){
      case 'Booking':
        if(name==='idExpo') {
          const obj={}
          Object.keys(state.value[0][idx]).map((key) => {
            if(option.data[key] && key!=='idStatus' && !key.includes('status_'))  //do not change booking idStatus data to expo idStatus data
              obj[key]=option.data[key]
          })
          state.value[0][idx]={...state.value[0][idx],...obj,idExpo:val} 
        }
        break
      case 'Faq':
        if(name==='idType') state.value[0][idx]={...state.value[0][idx],idType:val,type_en:option.text.en,type_fr:option.text.fr}
    }
  }
  function handleChange(name,valid,val,option){
    const idx=getIndex()
    if(name !==idModel){
      actualChanges.value[idx][name]=!isEqual(initialValues[idx][name],val)
      // if(!option) state.value[0][idx][name]=val
      state.value[0][idx][name]=val
      if(option && option.data) handleSelectOption(name,val,idx,option)
      formValid.value[name]=valid
    }
    if(name==='orgExcluded' && orgExcluded!==val) setGlobals('Admin',val)
  }
  async function handleTranslate(params){
    const idx=getIndex()  
    const {from,to,rootName}=params  
    const translated = (
      await translate({
        text:state.value[0][idx][`${rootName}_${from}`],
        to,
        from,
      })
    ).data
    handleChange(`${rootName}_${to}`,true,translated)
    initFlag.value+=.01
  }
  async function handleDeleteRow(model,id){
    const ctrl = newController(inFlight)
      try {
        const {data:res}=await deleteEntity(model,id,token.value,ctrl.signal)  //delete record in tdomain, ttechnique, tmedia  
        if(res.statusCode!==200) return 
        state.value[0][0][model.toLowerCase()]=_.filter(state.value[0][0][model.toLowerCase()],(row) => {
          return row[`id${model}`]!==id
        })
        initialValues[0][model.toLowerCase()]=_.filter(initialValues[0][model.toLowerCase()],(row) => {
          return row[`id${model}`]!==id
        })
        initFlag.value+=.01
      } catch (error) {
        console.error(error)
      }
      finally {
        doneController(ctrl,inFlight)
      } 
  }
  // DATA LOADING
  async function fetch(signal) {
    let res=null,sqlparams=null,paramsValues=null
    if (props.entity.sql) {
      switch(props.entity.model){
        case 'User':        //returned users have their idRole < signed-in user
          sqlparams=!props.entity.noList?":idRole":":idUser"
          paramsValues=`${!props.entity.noList?decoded.value.idRole:decoded.value.idUser}`
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
          props.entity.sql,
          token.value,
          signal,
          sqlparams, 
          paramsValues
        )).data    
    }
    return res.data    
  }  
  async function fetchBookingOeuvre(user,booking,signal){
    const {data:res}=await getEntitiesBySql(
      'booking_oeuvre_selection',
      token.value,
      signal,
      ':idUser,:idBooking',
      `${user},${booking}`
    )
    return res   
  }
  function initInitialValues(id=null){
    _.cloneDeep(state.value[0]).map((item,idx) => {  //initialize initialValues, cloneDeep necessary
      if(!id || item[idModel]===id) initialValues.push(item)
    })
  }
  onMounted(async () => {  
    const ctrl=newController(inFlight)
    try {
      state.value = await fetch(ctrl.signal) 
      let res=null,obj=null  
      switch(props.entity.model) {
        case'Booking':  //load BookingOeuvre data for each idBooking of a given user (connected user) 
          let bookingOeuvre=null
          await Promise.all(
            state.value[0].map(async(item,idx) => {  
              try {
                res=await fetchBookingOeuvre(item.idUser,item.idBooking,ctrl.signal)             
              } catch (error) {
                console.error('onmounted failed in Master.vue >>> Booking load', error)
                return
              }
              if(res.statusCode!==200) return
              bookingOeuvre=[]
              res.data[0].map((bo,i) => {
                obj={}
                if(!bo.idStatus)  obj=statusText[14]
                bookingOeuvre.push({
                  ...bo,
                  idBookingOeuvre:bo.idBookingOeuvre?bo.idBookingOeuvre:-(i+=1),
                  idBooking:item.idBooking,
                  ...obj
                })
              })  
              state.value[0][idx]={...state.value[0][idx],bookingOeuvre}
            })
          )
          break
        case 'Admin':
          const domain=state.value[1],tech=state.value[2],media=state.value[3],prize=state.value[4]
          state.value[0]=[{...state.value[0][0],domain,tech,media,prize}]
      }   
    } catch (error) {
      console.error('onmounted failed in Master.vue', error)
      return
    }
    finally {
      doneController(ctrl,inFlight)
    }
    initInitialValues()
    resetActualChanges()
    if(props.entity.noList) {
      let id=null
      switch(props.entity.model){
        case 'User':                  // WARNING !!!!! >>> MODEL SPECIFIC HERE
          id=decoded.value.idUser
          break
        case 'Admin': 
          id=1
          break
      }
      handleOpenDetails(id)
    }
    window.addEventListener('beforeunload', beforeUnload)
  })
  onUnmounted(() => { // clean-up code after component has unmounted  
    cancelAllInFlight(inFlight)
    window.removeEventListener('beforeunload', beforeUnload) 
  })    
  // DETECTING ROUTE CHANGES INSIDE SPA, PAGE REFRESH/CLOSE  
  async function beforeUnload(e){  //no custom confirm dialog for browser originated refresh
    if(!JSON.stringify(actualChanges.value).includes(true)) return
    e.preventDefault()
    e.returnValue = '' // required for some browsers
  }
  onBeforeRouteLeave(async() => {    
    if(!JSON.stringify(actualChanges.value).includes(true) && !tabUnsaved.value) return true
    if (!(await confirm($q,t('common.unsaved'),'cancel'))) return false    
  })
  // FOLDING MENU
  const isRotated = ref(false)
  function rotateIcon() {
    isRotated.value=!isRotated.value
  }
  // ACTIONS - MODEL INDEPENDANT
  function afterDelete(idx){  //update state, initialValues, actualChanges
    state.value[0].splice(idx,1)  
    initialValues.splice(idx,1)
    actualChanges.value.splice(idx,1)    
  }
  async function handleDelete(idx){  //applicable to tuser, toeuvre, tdoc, tfaq >>> idFile as a field in table, tbooking >>> no idFile
    const ctrl = newController(inFlight)
    const idFile=state.value[0][idx].idFile 
    if(selectedId.value>0) {
      try {
        const res=await deleteEntity(props.entity.model,selectedId.value,token.value,ctrl.signal)  //delete record in tuser, toeuvre, tbooking ...  
        if(res.data.statusCode!==200) return    
      } catch (error) {
        console.error(error)
      }
      finally {
        doneController(ctrl,inFlight)
      }      
    }      
    afterDelete(idx)  //update state, initialValues, actualChanges    
    if(idFile) {
      const ctrl = newController(inFlight)
      try {
        const {data:res}= await deleteEntity('File',idFile,token.value,ctrl.signal)  //delete record in tfile
        if(res.statusCode===200) 
          try {
            await deleteInCloud(idFile,token.value,ctrl.signal,getFileExtension(idFile).length>0?'?option=raw':'') //delete asset on Cloudinary.com                  
          } catch (error) {}  //asset no longer present        
      } catch (error) {
        console.error(error)
      }
      finally {
        doneController(ctrl,inFlight)
      }  
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
          cond.push(listItemsFilter.value.user_role?item.idRole>=3:
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
        const ctrl=newController(inFlight)
        let res=null,status=2
        const idx=getIndex()
        switch(cs){      
          case "deactivation":
            status=3
          case "validation":
            //database update
            try {
              res=await postEntity('StatusTracking', {idStatus:status,idUser:selectedId.value}, token.value, ctrl.signal)              
            } catch (error) {
                console.error(error)
            }
            finally {
              doneController(ctrl,inFlight)
            }  
            // state update
            if(res.data.statusCode!==200) return
            state.value[1].unshift({idUser:selectedId.value,idStatus:status,createdAt:new Date(Date.now())})
            state.value[0][idx].idStatus=status
            break
          case "deletion":
            handleDelete(idx)          
        }
      }
      break
    case "Expo":
      listItemsFilter=ref({search:'',expo_status:''})  
      filteredList=computed(() => {  
        return _.filter(state.value[0],(item) => {
          let cond=[],result=true
          cond.push(JSON.stringify(item).toLowerCase().includes(listItemsFilter.value.search.toLowerCase()))
          cond.push(listItemsFilter.value.expo_status?item.idStatus===11 || item.idStatus===12:
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
        const ctrl=newController(inFlight)   
        let res=null,status=12
        const idx=getIndex()
        switch(cs){      
          case "archiving":
            status=13
          case "activation":
            //database update
            try {
              res=await postEntity('StatusTracking', {idStatus:status,idExpo:selectedId.value}, token.value, ctrl.signal)              
            } catch (error) {
                console.error(error)
            }
            finally {
              doneController(ctrl,inFlight)
            }  
            // state update
            if(res.data.statusCode!==200) return
            state.value[1].unshift({idExpo:selectedId.value,idStatus:status,createdAt:new Date(Date.now())})
            state.value[0][idx].idStatus=status
            break;
          case "deletion":
            try {
              const {data:images}=(await getEntitiesBySql(
                'list_images_expo',
                token.value,
                ctrl.signal,
                ':idExpo', 
                selectedId.value
              )).data
              if(selectedId.value>0) {  //delete record in texpo >>> record(s) in texpo_image deleted by cascade delete from tExpo
                res=await deleteEntity('Expo',selectedId.value,token.value, ctrl.signal) 
                if(res.data.statusCode!==200) return 
              } 
              //delete images in tfile and delete asset on Cloudinary.com
              await Promise.all(images[0].map(async(image) => {
                //delete record in tfile
                res=await deleteEntity('File',image.idFile,token.value, ctrl.signal)  
                if(res.data.statusCode===200) { 
                  try {   //delete asset on Cloudinary.com
                    await deleteInCloud(image.idFile,token.value,ctrl.signal)                   
                  } catch (error) {}  //asset no longer present
                }
              })   )  
              afterDelete(idx)  //update state, initialValues, actualChanges               
            } catch (error) {
                console.error(error)      
            } 
            finally {
              doneController(ctrl,inFlight)
            }  
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
      handleAction = (cs)=>{    
        const idx=getIndex()
        switch(cs){   
          case "deletion":
            handleDelete(idx)
            // initFlag.value+=.01    //forces computed filteredDetails update >>> key property in FormDetails component in below template
        }
      }
      break
    case 'Partner':
    case 'Doc':
      listItemsFilter=ref({search:''})  
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
        const idx=getIndex()
        switch(cs){     
          case "deletion":    
            handleDelete(idx)
        }
      }
      break     
    case 'Faq':
      listItemsFilter=ref({search:'',faq_status:''})       
      filteredList=computed(() => {  
        return _.filter(state.value[0],(item) => {
          let cond=[],result=true
          cond.push(JSON.stringify(item).toLowerCase().includes(listItemsFilter.value.search.toLowerCase()))
          cond.push(listItemsFilter.value.faq_status?item.idStatus===26:
            (listItemsFilter.value.faq_status===false?item.idStatus===25:item.idStatus>=25)) 
          cond.map((cnd) => {
            result=result && cnd
          })
          return result
        })
      })  
      toggleOn = ref({status:false})
      getToggleLabel = (toggle)=>{
        switch(listItemsFilter.value[`faq_${toggle}`]){
          case true:
            toggleOn.value[toggle]=true
            return t(`comps.list_items.actions_menu.faq.published`) 
          case false:
            toggleOn.value[toggle]=false
            return t(`comps.list_items.actions_menu.faq.draft`)
          default:
            return t(`comps.list_items.actions_menu.user.${toggle}.indeterminate`)
        }
      }    
      handleAction = async(cs)=>{   
        const ctrl=newController(inFlight)
        let res=null,status=26
        const idx=getIndex()
        switch(cs){      
          case "drafting":
            status=25
          case "publication":
            //database update
            try {
              res=await postEntity('StatusTracking', {idStatus:status,idFaq:selectedId.value}, token.value, ctrl.signal)              
            } catch (error) {
                console.error(error)
            }
            finally {
              doneController(ctrl,inFlight)
            }  
            // state update
            if(res.data.statusCode!==200) return
            state.value[1].unshift({idFaq:selectedId.value,idStatus:status,createdAt:new Date(Date.now())})  //array.unshift >>> adds record at idx=0
            state.value[0][idx].idStatus=status
            break
          case "deletion":
            handleDelete(idx)          
        }
      }  
  }
  const initFlag=ref(0)
  const filteredDetails = computed(() => {
    if(state.value.length===0) return
    return _.filter(state.value[0],(item) => {
        return (item[idModel]===selectedId.value)
      })[0]
  })
  function filteredDetailsTrigger(){  //trigger filteredDetails computed update, see FormDetails component key in the template
    return parseInt(selectedId.value)+initFlag.value
  }

  function initNewrec(){
    let obj={}
    props.fieldsets.map((fieldset) => {
      fieldset.fields?.map((field) => {
        obj[field.name]=null
      })
    })
    newRecId+=-1
    obj[idModel]=newRecId
    switch(props.entity.model){
      case 'Expo':
        obj.idStatus=11     //pending status
        break
      case 'Oeuvre':
        obj.idUser=decoded.value.idUser
        obj.classic_modern=0
        obj.idDomain=null
        obj.idTech=null
        obj.idMedia=null
        obj.idFile=null
        obj.reserved=0
        break
      case 'Booking':
        obj.idUser=decoded.value.idUser
        obj.vernissage=0
        obj.lunch=0
        obj.price=0
        obj.terms=0
        obj.bookingOeuvre=[]        
        state.value[2].map((item,i) => {
          obj.bookingOeuvre.push({
            idBookingOeuvre:-(i+=1),
            idBooking:newRecId,
            idOeuvre:item.idOeuvre,
            title_fr:item.title_fr,
            title_en:item.title_en,
            url:item.url,
            selected:0,
            showRoom:0,
            screen:0,
            ...statusText[14]
          })
        })
        obj={...obj,...statusText[7]}
        break        
      case 'Faq':
        obj.idStatus=25     //draft status
        obj.idFile=null
        break

    }
    return obj
  }
  function handleNewRecord(){
    state.value[0]=[...state.value[0],_.cloneDeep(initNewrec())] 
    initInitialValues(newRecId) 
    resetActualChanges(newRecId)  //initialize actualChanges for the newly created record
    handleOpenDetails(newRecId)    
  }
  // FORM DETAILS TOOLBAR ACTIONS
  async function processBookingOeuvre(body,bookingID,idx,signal) {  //body=bookingOeuvre array
    const bookingStatus=state.value[0][idx].idStatus
    let res=null,obj=null,newId
    await Promise.all(
      body.map(async(bo,i) => {
        if(bo.selected && bo.idBookingOeuvre<0){  //new record case
          obj=await bodyCleanUp('BookingOeuvre',bo,token.value,signal)
          res=await postEntity('BookingOeuvre',obj,token.value, signal)  //creation of corresponding record in tstatus_tracking at the same time (idStatus:14 >>> draft)
          if(res.data.statusCode!==200) return
          newId=res.data.data.idBookingOeuvre
          state.value[0][idx].bookingOeuvre[i].idBookingOeuvre=newId //update idBookingOeuvre value to newly created record id
          //if booking is at candidate status (8), related BookingOeuvre should have a corresponding record at status 15 (candidate) in tstatus_tracking (in addition to those at 14)
          if(bookingStatus===8){  
            res=await postEntity('StatusTracking',{idStatus:15,idBookingOeuvre:newId},token.value, signal)
            if(res.data.statusCode!==200) return
            state.value[0][idx].bookingOeuvre[i]={...state.value[0][idx].bookingOeuvre[i],...statusText[15]}
          }
        }
        else if(bo.idBookingOeuvre>0) {   
          if(!bo.selected) {
            res=await deleteEntity('BookingOeuvre',bo.idBookingOeuvre,token.value, signal)  
            if(res.data.statusCode!==200) return
            const id=getRandomInt(-1e5,-1e2)
            state.value[0][idx].bookingOeuvre[i].idBookingOeuvre=id
            if(state.value[0][idx].bookingOeuvre[i].idStatus!==14)
              state.value[0][idx].bookingOeuvre[i]={...state.value[0][idx].bookingOeuvre[i],...statusText[14]}
          } 
          else  { 
            obj=await bodyCleanUp('BookingOeuvre',bo,token.value,signal)
            res=await patchEntity('BookingOeuvre',bo.idBookingOeuvre,obj,token.value, signal)
            if(res.data.statusCode!==200) return        
          }          
        }  
        initialValues[idx].bookingOeuvre[i]= _.cloneDeep(state.value[0][idx].bookingOeuvre[i]) //update initial values with saved data 
      })
    )
    actualChanges.value[idx].bookingOeuvre=false
  }
  async function processDTMP(body,signal) {  //body=bodyDTMP object >>> {domain:[{idDomain: ...},...{}]},tech:[{idTech:...},..{}],media:[{idMedia:...},prize:[{idPrize:...},..{}]}
    function findIndex(arr,key,id){
      return arr.findIndex((item) => {
        return item[`id${_.capitalize(key)}`]===id
      }) 
    }  
    const ids={domain:[],tech:[],media:[],prize:[]}  //id of records that have actually changed
    Object.keys(body).forEach((key) => { //key >>> domain, tech, media, prize
      const model=_.capitalize(key)
      body[key].forEach((item) => {
        const idx=findIndex(initialValues[0][key],key,item[`id${model}`])
        if(!isEqual(item,initialValues[0][key][idx]))
          ids[key].push(item[`id${model}`])        
      })
    })
    for (const key of Object.keys(ids)) {
      const model=_.capitalize(key)
      for (const id of ids[key]) {
        const idx1 = findIndex(body[key], key, id)
        const cleaned = await bodyCleanUp(model, body[key][idx1], token.value,signal)
        const {data:res}=await(id<0?postEntity(model,cleaned, token.value, signal):patchEntity(model, id, cleaned, token.value, signal))
        if(res.statusCode===200){
          if(id>0){
            const idx2=findIndex(initialValues[0][key],key,id)
            initialValues[0][key][idx2]=body[key][idx1]} 
          else { //new record case
            const newId=res.data[`id${model}`]
            const idx3=findIndex(state.value[0][0][key],key,id)
            state.value[0][0][key][idx3]={...state.value[0][0][key][idx3],[`id${model}`]:newId} //updtate state row with newly created record idModel
            initialValues[0][key].push(_.cloneDeep(state.value[0][0][key][idx3]))
          }
        }
      }
      actualChanges.value[0][key]=false  //reset actualChanges
    }
  }
  async function handleToolbarActions(cs){  
    let index=null
    switch(cs){
      case "save":
        let keys=[],obj=null,res=null,newId=null,cs=-1
        actualChanges.value.map(async(item,idx) => {
          if(JSON.stringify(item).includes(true)){
            obj={}
            keys=Object.keys(item)
            keys.map((key) => {
              if(key!==idModel) {
                if(item[key]) obj[key]=state.value[0][idx][key]
              }
              else obj[key]=item[key]
            })  
            let body=null,bodyBookingOeuvre=null,bodyDTMP=null  //Domain, Technique, Media, Prize
            if(obj[idModel]<0) body=state.value[0][idx]
            else body=_.cloneDeep(obj)  //cloneDeep necessary
            if(body.bookingOeuvre) {
              cs=1
              bodyBookingOeuvre=body.bookingOeuvre}
            if(body.domain) {
              cs=2
              bodyDTMP={domain:body.domain}}
            if(body.tech) {
              cs=2
              bodyDTMP={...bodyDTMP,tech:body.tech}}
            if(body.media) {
              cs=2
              bodyDTMP={...bodyDTMP,media:body.media}}
            if(body.prize) {
              cs=2
              bodyDTMP={...bodyDTMP,prize:body.prize}}
            const ctrl=newController(inFlight)
            try {
              body=await bodyCleanUp(props.entity.model,body,token.value,ctrl.signal)
            } catch (error) {
                console.error(error)
            }
            finally {
              doneController(ctrl,inFlight)
            }
            if(Object.keys(body).length>=1){
              const ctrl1=newController(inFlight)
              try {
                res=await(obj[idModel]<0?postEntity(props.entity.model,body,token.value, ctrl1.signal):
                patchEntity(props.entity.model,obj[idModel],body,token.value, ctrl1.signal))
              } catch (error) {
                  console.error(error)     
              } 
              finally {
                doneController(ctrl1,inFlight)
              }             
              if(res.data.statusCode!==200) return
              keys.map((key) => { 
                if(key!==idModel && item[key]){
                  initialValues[idx][key]=state.value[0][idx][key] //update initial values with saved data 
                  item[key]=false  //reset actualChanges item to false
                }
                if(key===idModel && obj[idModel]<0) {
                  newId=res.data.data[idModel]
                  initialValues[idx][key]=newId  //update initialValues idModel value to newly created record id
                  item[key]=newId  //update actualChanges idModel value to newly created record id
                }
              })  
              if(obj[idModel]<0) { //new record creation
                state.value[0][idx][idModel]=newId //update idModel value to newly created record id   
                if(props.entity.status_at_creation)   //actual record post request is run from the back-end API (entities.js)
                  state.value[1].unshift({[idModel]:newId,idStatus:props.entity.status_at_creation,createdAt:new Date(Date.now())})
                handleOpenDetails(newId)
                newRecId=0
              }
            }
            if(cs>0) {  //bodyBookingOeuvre || bodyDTMP             
              const ctrl2=newController(inFlight)
              try {
                switch(cs){
                  case 1:
                    processBookingOeuvre(bodyBookingOeuvre,newId?newId:obj[idModel],idx,ctrl2.signal)  //newId is idBooking in case of new Booking creation, otherwise idModel being updated
                    if(newId) {  //renumber idBooking in bodyBookingOeuvre to newly created Booking object
                      bodyBookingOeuvre.map((bo) => {
                        bo.idBooking=newId
                      })
                    }   
                    break
                  case 2:
                    const {idAdmin,orgExcluded,...rest}=bodyDTMP
                    processDTMP(rest,ctrl2.signal)

                }             
              } catch (error) {
                  console.error(error)               
              }
              finally {
                doneController(ctrl2,inFlight)
              }  
            }
            // else handleToolbarActions('undo')
          }
        }) 
        break
      case "clear":
        index=getIndex()
        clearables[`${props.entity.model}`].map((prop) => {
          if(state.value[0][index][prop[0]]){
            switch(prop[0]){
              case 'bookingOeuvre':
                const keys=Object.keys(prop[1])
                state.value[0][index][prop[0]].map((bo) => {
                  keys.map((key) => {
                    bo[key]=prop[1][key]
                  })
                })
                break
              default:
                state.value[0][index][prop[0]]=prop.length===1?null:prop[1] 
            }
            actualChanges.value[index][prop[0]]=!isEqual(initialValues[index][prop[0]],state.value[0][index][prop[0]])
          } 
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
  // BOTTOM BUTTONS ACTIONS - MODEL SPECIFIC
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
      case 'Booking':
        async function processBookingStatus(newStatus){
          const ctrl=newController(inFlight)
          try {
            //process new status for booking
            const{data:res}=await postEntity('StatusTracking',{idStatus:newStatus.booking,idBooking:state.value[0][idx].idBooking},token.value,ctrl.signal)  
            if(res.statusCode!==200) return
            state.value[0][idx].idStatus=newStatus.booking
            state.value[1].unshift(res.data) //update status tracking state
          } catch (error) {
            console.error(error)
          }
          finally {
            doneController(ctrl,inFlight)
          }
          //process new status for each booking-oeuvre
          await Promise.all(
            selection.value.map(async(bo,i) => {
              const ctrl=newController(inFlight)
              try {
                const{data:res}=await postEntity('StatusTracking',{idStatus:newStatus.bookingOeuvre,idBookingOeuvre:bo[0].idBookingOeuvre},token.value,ctrl.signal)  
                if(res.statusCode===200) {
                  state.value[0][idx].bookingOeuvre[bo[i]]={...state.value[0][idx].bookingOeuvre[bo[i]],...statusText[newStatus.bookingOeuvre]}
                }                     
              } catch (error) {
                  console.error(error)     
              }  
              finally {
                doneController(ctrl,inFlight)
              }         
            })
          )
        }
        if (!(await confirm($q,t(`comps.form_details.booking.${name}`),'cancel'))) return
        const idx=getIndex()
        switch(name){
          case 'register':
            if(state.value[0][idx].idStatus>7) return
            processBookingStatus({booking:8,bookingOeuvre:15})
            break
          case 'cancel':
            if(state.value[0][idx].idStatus<8) return
            processBookingStatus({booking:7,bookingOeuvre:14})
        }
        initFlag.value+=.01    //forces computed filteredDetails update >>> key property in FormDetails component in below template
    }
  }
  //BOTTOM BUTTONS ENABLE-DISABLE CONDITIONS
  const bottomButtonDisabled = computed(() => {  //applies to Booking model only
    const idx=getIndex()
    const out = { register: false, cancel: false }
    if(props.entity.model !== 'Booking') return out
    if(state.value[0][idx].terms==0 || !selection.value || JSON.stringify(actualChanges.value[idx]).includes(true)) {
      out.register = true
      out.cancel = true
      return out
    }
    const closureDate = state.value[0][idx].closureDateTime
      ? parse(state.value[0][idx].closureDateTime, 'dd/MM/yyyy HH:mm', new Date())
      : null
    const closureExceeded = closureDate && closureDate < new Date()
    if(state.value[0][idx].idStatus > 8 || (state.value[0][idx].idStatus === 8 && closureExceeded)) {
      out.register = true
      out.cancel = true
      return out
    }
    if(state.value[0][idx].idStatus === 8 && !closureExceeded){
      out.register = true
      out.cancel = false
      return out
    }
    if(state.value[0][idx].idStatus === 7) {      
      out.cancel=true
      if(!closureExceeded && state.value[0][idx].terms!=0) 
        out.register=false
      else out.register=true
      return out
    }
    return out
  })
  const selection=computed(() => {
    if(props.entity.model!=='Booking' || !selectedId.value) return null
    const idx=getIndex(),arr=[]
    if(!state.value[0][idx] || !state.value[0][idx].bookingOeuvre) return arr
    state.value[0][idx].bookingOeuvre.map((bo,i) => {
      if((bo.selected && bo.showRoom) || (bo.selected && bo.screen))
        arr.push([bo,i])
    })
    return arr
  })
  watch(selection, (newValue, oldValue) => {
    if(props.entity.model!=='Booking' || !selectedId.value) return null
    const idx=getIndex()
    let price=0,flg=false //showRoom flag
    newValue.map((item) => {
      if(!flg && item[0].showRoom) {
        price+=state.value[0][idx].priceShowRoom
        flg=true
      }
      price+= item[0].screen*state.value[0][idx].priceScreen
    }) 
    handleChange('price',true,price)
  }, { deep: true, immediate: true })
  
  const toolbarDisableItem=computed(() => {    
    const idx=getIndex()
    let obj={save:false,delete:false}
    switch(props.entity.model){
      case 'Booking':
        if(state.value[0][idx].idStatus>8 || 
        (state.value[0][idx].idStatus===8 && parse(state.value[0][idx].closureDateTime, 'dd/MM/yyyy HH:mm', new Date()) < new Date()))          
          obj= {save:true,delete:true}
    }
    return obj
  })
  const hideToolbar=ref(false)

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
            v-if="entity.model==='User' || entity.model==='Expo' || entity.model==='Faq'"
            v-model="listItemsFilter[`${entity.model.toLowerCase()}_status`]"
            toggle-indeterminate
            :label="getToggleLabel('status')"            
            :color="toggleOn.status?'positive':'deep-orange-9'"
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
        :key="selectedId*getRandomInt(1e2,1e5)"
        :entity="entity"
        :master="field_master"
        :data="filteredList"
        :selectedId="selectedId"
        :infos="state.length>1?state[1]:null"
        @open-details="handleOpenDetails"
        @user-action="handleAction"
        @expo-action="handleAction"
        @oeuvre-action="handleAction"
        @faq-action="handleAction"
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
        @delete-row="handleDeleteRow"
        @hide-toolbar="(val) => {
          hideToolbar=val
        }"
        @tab-unsaved="(val) => {
          tabUnsaved=val
        }"
        @parent-update="(file) => {     //update state with uploaded file data
          const idx=getIndex()
          state[0][idx]={...state[0][idx],idFile:file.idFile,fileName:file.fileName,fileLastModified:file.fileLastModified,url:file.url}
        }"
      >
        <template #toolbar> <!--named scoped slot -->
          <Toolbar v-if="props.entity.newRecord && !hideToolbar" class="toolbar"
            @toolbar-actions="handleToolbarActions"
          >
            <template #save>    <!--named scoped slot -->          
              <div class="save">
                <q-btn round flat icon="save" 
                  :size="`${changeStatus===0?'1.6rem':'1.8rem'}`" 
                  :class="`${changeStatus==0?'':'pulse'}`" 
                  :disable="changeStatus===0 || toolbarDisableItem.save" 
                  @click="handleToolbarActions('save')">
                </q-btn>
                <q-badge v-if="changeStatus>=1" color="orange" text-color="black" :label="changeStatus" />
                <Tooltip 
                  :tt_text="$t(`${toolbarDisableItem.save?'comps.toolbar.booking_save':'common.save'}`)"
                  :wrap="toolbarDisableItem.save?true:false"
                >
              </Tooltip>
              </div>
            </template>
            <template #delete> <!--named scoped slot -->              
              <div v-if="entity.model==='Oeuvre' || entity.model==='Booking' || entity.model==='Partner' || entity.model==='Doc'" class="delete">        
                <q-btn round flat icon="delete" size="1.6rem" 
                  :disable="toolbarDisableItem.delete"
                  @click="async() => {
                    if(!(await confirm($q,t(`common.confirm.deletion`),'cancel'))) return   
                    handleToolbarActions('deletion') 
                  }" 
                />
                <Tooltip 
                  :tt_text="$t(`${toolbarDisableItem.delete?'comps.toolbar.booking_delete':'common.delete'}`)"
                  :wrap="toolbarDisableItem.delete?true:false"
                  ></Tooltip>
              </div>
            </template>
          </Toolbar>
        </template> 
      </FormDetails>
    </form>
    <div v-if="fieldsets[fieldsets.length-1].type==='button-bottom' && filteredDetails" :class="['bottom-container',entity.model]">
      <FieldsetButton  
        :buttons="fieldsets[fieldsets.length-1].buttons"  
        :disabled="bottomButtonDisabled"
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
    grid-template-columns: auto 0.9fr;
    justify-content: left;
    height:100%;   
    position:relative;
    overflow:hidden;
  }  
  .master-container.no-list {
    grid-template-columns: 80%;
  }
  .master-container.no-list:has(.admin) {
    grid-template-columns: 100%;
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
    /* height:fit-content; */
    overflow-y: hidden;
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
  .toolbar .save {    
    position:relative;
    color:var(--green);
  }
  .toolbar .q-badge {
    position:absolute;
    top:5px;
    right:0;
  }
  @keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(0,0,0,.0) }
  40%  { box-shadow: 0 0 0 8px rgba(25,118,210,.25) } /* adjust color */
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,.0) }
  }
  .pulse { 
    animation: pulse 1.2s ease-out infinite 
  }
  .toolbar .delete {    
    color:var(--red-opaque8);
  }
  div.folded .details-container {
    border-width: 0;
  }

</style>