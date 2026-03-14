<script setup>
  import {ref,computed,inject,onUnmounted} from 'vue'
  import { useRouter,useRoute } from 'vue-router'
  import { useQuasar } from 'quasar'
  import { useI18n } from 'vue-i18n'
  import {arrayBufferToWebP} from "webp-converter-browser"
  import _ from 'lodash'  
  import InputField from '../../fields/InputField.vue'
  import FileViewer from './FileViewer.vue'
  import { getEmptyFile, getRandomInt,getFileExtension,fileSize } from '@/utilityFunctions.js'
  import supported from './supported.json'
  import { environment } from '@/config/environment.js'
  import { toastError, toastWarning } from '@/composable/toast.js'
  import { useFormatDate } from '@/composable/useFormatDate.js'
  import { postInCloud,deleteInCloud } from '@/services/httpCloudinary.js'
  import { postEntity,patchEntity, deleteEntity } from '@/services/httpEntities.js'
  import { confirm } from '../../dialog/dialog.js'
  import Tooltip from '../../Tooltip.vue'

  const props = defineProps({
    fileYes:{type:Array},
    model:{type:String},
    fields:{type:Array},
    data:{type:Object}
  })

  const {t,locale}=useI18n()  
  const $q=useQuasar()
  const router = useRouter()
  const route = useRoute()
  const {token,decoded}=inject('userCookie')
  const {formatDateTime}=useFormatDate()

  const loading=ref(false)
  const file=ref(null)
  if (!props.data.idFile) file.value=getEmptyFile()
  else 
    file.value={
      idFile:props.data.idFile,
      fileName:props.data.fileName,
      fileSize:fileSize(props.data.fileSize),
      fileLastModified:formatDateTime(props.data.fileLastModified),
      url:props.data.url
    }
  const file_ext=computed(() => {
    return getFileExtension(file.value.fileName)
  })

  const emit=defineEmits(['parentUpdate'])

  const ctrl=new AbortController()  
  onUnmounted(() => { // clean-up code after component has unmounted
    ctrl.abort()
  })   
  async function handleClick(cs){
    switch(cs){
      case 'upload':
        document.getElementById('select-file').click()  
        break
      case 'delete':
        if (!(await confirm($q,t('comps.file_upload.file_delete'),'cancel'))) return false 
        loading.value=true
        const id=file.value.idFile
        switch(props.model) {
          case 'Expo':  //do nothing >>> record in texpo_image deleted by cascade delete from timage  
            break
          default: //update idFile in mariaDB tmodel (tuser, tpartner,tdoc)
            const res1=(await patchEntity(props.model,props.data[`id${props.model}`],{idFile:null},token.value,ctrl.signal)).data
            if(res1.statusCode!==200) return
        }            
        const {data:res2}=await deleteEntity('File',id,token.value,ctrl.signal) //delete idFile record in tfile
        if(res2.statusCode===200) {     //update state
          file.value=getEmptyFile()
        } 
        try {
          await deleteInCloud(id,token.value,ctrl.signal,getFileExtension(id).length>0?'?option=raw':'')  //delete asset on Cloudinary.com
        } catch (error) {}  //asset no longer present
        if(props.model==='User' && props.data[`id${props.model}`]===decoded.value.idUser) setTimeout(() => {
          router.go(0)  //page refresh without full reload
        },1000)
    }  
    loading.value=false
  }
  async function processFileData(obj,option=null) {
    if(props.data[`id${props.model}`]<=0){  //new record creation >>> no file upload until actual save
      toastWarning(t('comps.form_details.newRec'))
      return
    }   
    loading.value=true
    let idFile=getRandomInt(1,214e7).toString()
    const ext=getFileExtension(obj.fileName)
    if(option && ext!=='.pdf') idFile=`${idFile}${ext}`  //add file extension in cloudinary publicId for msoffice files
    const {data:res1}=await postInCloud(idFile,obj.data,token.value,ctrl.signal,option) //create asset on Cloudinary.com
    if(res1.statusCode===200){  
      obj.idFile=idFile
      obj.data=undefined  
      obj.url=res1.data
      const {data,...body}=_.cloneDeep(obj)
      const {data:res2}=await postEntity('File',body,token.value,ctrl.signal)  //create file record in mariaDB tfile
      if(res2.statusCode===200) {
        let res3=null
        switch(props.model){
          case 'Expo':  //multiple upload
            res3=(await postEntity('ExpoImage',{idExpo:props.data.idExpo,idFile},token.value,ctrl.signal)).data
            break
          case 'User':  //single upload
          case 'Partner':
          case 'Oeuvre':
          case 'Doc':
          case 'Faq':
            res3=(await patchEntity(props.model,props.data[`id${props.model}`],{idFile},token.value,ctrl.signal)).data  //update idFile in mariaDB tModel
        }
        if(!res3 || res3.statusCode===200) {
          file.value={    //update state
            ...body
          }   
          emit('parentUpdate',file.value)
        }
      }
    }
    if((props.model==='User' && props.data[`id${props.model}`]===decoded.value.idUser)) //avatar  update after upload
      setTimeout(() => {
        router.go(0)  //page refresh without full reload
      },1000)      
    loading.value=false
  }
 
  const exts=[]
  props.fileYes.forEach((cat) => {
    supported[cat].forEach((ext) => {      
    exts.push(ext)
    })
  })
  function handleSelectedFile(e){   
    let ext=null 
    const selectedFile = e.target.files[0]
    ext=getFileExtension(selectedFile.name)
    let val = getEmptyFile()  
    if (typeof selectedFile !== undefined) {      
      if(!exts.includes(ext)) { //check supported extensions
        toastWarning(`${t('comps.file_upload.file_ext1')} ${ext} ${t('comps.file_upload.file_ext2')}`)
        return
      }
      const reader1 = new FileReader();
      if (props.fileYes.includes("image") && supported.image.includes(ext)) { //image file
        reader1.onload = async function () {
          let name = selectedFile.name;
          const blob = await arrayBufferToWebP(reader1.result);
          if (blob.size > environment.max_file_size) {
            toastError(`${t('comps.file_upload.max_exceeded')} ${environment.max_file_size}`)
            return
          }
          const reader2 = new FileReader();
          reader2.onload = function () {
            if (!selectedFile.type.includes("webp")) {
              name = selectedFile.name.split(".");
              name.splice(-1, 1);
              name = name.join(".") + ".webp";
            }
            val = {
              ...val,
              fileName:name,
              fileSize: blob.size,
              fileLastModified: selectedFile.lastModified,
              url: null,
              data: reader2.result
            };
            processFileData(val);
          };
          reader2.readAsDataURL(blob);
        };
        reader1.onerror = function (error) {
          console.log(
            "Error during image file upload in FieldsetFile.vue: ",
            error
          );
        };
        reader1.readAsArrayBuffer(selectedFile);
      }
      if ((props.fileYes.includes("msoffice") && supported.msoffice.includes(ext)) ||  //non image file
          props.fileYes.includes("pdf") && supported.pdf.includes(ext)) { 
        reader1.readAsDataURL(selectedFile);
        reader1.onload = function () {
          val = {
            ...val,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileLastModified: selectedFile.lastModified,
            url: null,
            data: reader1.result
          };
          processFileData(val,'?option=raw');
        };
        reader1.onerror = function (error) {
          console.log("Error during non image file upload in FieldsetFile.vue: ", error);
        };
      }
    } else processFileData(val);
  }
  function roleRouteCondition(){
    const orgRole=decoded.value.idRole>=5
    if(!orgRole) return true
    switch(route.name){
      case 'member user':
      case 'member expos':
      case 'member docs':
      case 'member partners':
      case 'member faq':
        return true
      case 'member users':
      case 'member oeuvres_org':
        return false
      default:
        return true
    }
  }

</script>

<template>
  <div class="file-container">
    <div class="action-infos">
      <q-btn v-if="file.url && roleRouteCondition()"
        color='primary'
        rounded standout pulse
        no-wrap
        icon="delete"
        :label="$t('comps.file_upload.delete')"
        :disable="false"
        @click="handleClick('delete')"
      >
      </q-btn >    
      <q-btn v-if="!file.url && roleRouteCondition()"
        color='primary'
        rounded standout pulse
        no-wrap
        icon="upload"
        :label="$t('comps.file_upload.upload')"
        :disable="data.idOeuvre<0 || data.idExpo<0 || data.idPartner<0 || data.idDoc<0 || data.idFaq<0?true:false"
        @click="handleClick('upload')"
      >
        <input
          id="select-file"
          class="upload"
          type="file"
          :accept="exts.join(',')"
          @change="handleSelectedFile"
        />
      </q-btn>
      <Tooltip v-if="data.idOeuvre<0 || data.idExpo<0 || data.idPartner<0 || data.idDoc<0 || data.idFaq<0" :tt_text="$t('comps.file_upload.tooltip')"></Tooltip> 
      <div class="file-details">
        <InputField v-for="(item,idx) in fields"
          :key="getRandomInt(1,3e6)"
          :name="item.name"
          :label="item[`label_${locale}`]"
          :required="false"
          :disabled="true"
          :value="file[item.name]"
        >      
        </InputField>
        <q-inner-loading :showing="loading">
          <q-spinner size='8rem' color="green" :thickness="4"/>
        </q-inner-loading>
      </div>
      <a :href="file.url" target="_blank">
        <q-btn v-if="file.url && roleRouteCondition() && route.name==='member docs'"
          color='primary'
          rounded standout pulse
          no-wrap
          icon="download"
          :label="$t('comps.file_upload.download')"
          :disable="false"
        >
        </q-btn>
      </a>
    </div>
    <FileViewer v-if="file"
      :file="{name:file.fileName,url:file.url,ext:file_ext}"
      :fileYes="fileYes"
      :supported="supported"
      :size="roleRouteCondition()?'medium':'small'"
    >
    </FileViewer>
  </div>
</template>

<style scoped>
  div.file-container {
    display:flex;
    flex-wrap: nowrap;
    justify-content: left;
    gap:20px;
    margin:5px auto;
    min-width:200px;
  }
  div.action-infos {
    display:flex;
    flex-direction: column;
  }
  .q-btn {
    width:100%;
    max-height: 3.6rem;
  }
  a .q-btn {
    margin:5px 0;
  }
  input.upload {
    display:none;
  }
  .file-details {
    position:relative;
  }
  .q-spinner-oval {
    position:fixed;
    top:30%;
    font-size: 9rem;
    font-weight: 900;
  }
</style>