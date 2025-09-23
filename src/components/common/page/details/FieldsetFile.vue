<script setup>
  import {ref,inject,onUnmounted} from 'vue'
  import { useRouter } from 'vue-router'
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n'
  import {arrayBufferToWebP} from "webp-converter-browser"
  import _ from 'lodash'
  import InputField from '../../fields/InputField.vue'
  import { getEmptyFile, getRandomInt } from '@/utilityFunctions.js'
  import { fileSize } from '@/utilityFunctions.js'
  import { environment } from '@/config/environment.js'
  import { toastError, toastWarning } from '@/composable/toast.js'
  import { useFormatDate } from '@/composable/useFormatDate.js'
  import { postInCloud,deleteInCloud } from '@/services/httpCloudinary.js'
  import { postEntity,patchEntity, deleteEntity } from '@/services/httpEntities.js'
  import { confirm } from '../../dialog/dialog.js'

  const props = defineProps({
    fileYes:{type:String},
    model:{type:String},
    fields:{type:Array},
    data:{type:Object}
  })
  const {t,locale}=useI18n()  
  const $q=useQuasar()
  const router = useRouter()
  const {token,decoded}=inject('userCookie')
  const {formatDateTime}=useFormatDate()

  const file=ref(null)
  const loading=ref(false)
  if (!props.data?.idImage) file.value=getEmptyFile()
  else file.value={
    idImage:props.data.idImage,
    fileName:props.data.fileName,
    fileSize:fileSize(props.data.fileSize),
    fileLastModified:formatDateTime(props.data.fileLastModified),
    url:props.data.url
  }
  const ctrl=new AbortController()  
  let alive = true // guard against updates after unmount
  onUnmounted(() => { // clean-up code after component has unmounted
    alive=false
    ctrl.abort()
  })   
  async function handleClick(cs){
    if(!alive) return
    switch(cs){
      case 'upload':
        document.getElementById('select-file').click()
        break
      case 'delete':
        if (!(await confirm($q,t('comps.file_upload.file_delete'),'cancel'))) return false 
        loading.value=true
        const idImage=file.value.idImage
        switch(props.model) {
          case 'Expo':  //do nothing >>> record in texpo_image deleted by cascade delete from timage  
            break
          default: //update idImage in mariaDB tmodel (tuser ...)
            const res1=(await patchEntity(props.model,props.data[`id${props.model}`],{idImage:null},token.value,ctrl.signal)).data
            if(res1.statusCode!==200) return
        }            
        const {data:res2}=await deleteEntity('Image',idImage,token.value,ctrl.signal) //delete idImage record in timage
        if(res2.statusCode===200) file.value=getEmptyFile()  //update state
        if(props.model==='User' && props.data[`id${props.model}`]===decoded.value.idUser) 
          router.go(0)  //page refresh without full reload
        try {
          await deleteInCloud(idImage,token.value,ctrl.signal)  //delete asset on Cloudinary.com
        } catch (error) {}  //asset no longer present
        loading.value=false
    }
  }
  async function processFileData(obj) {
    if(props.data[`id${props.model}`]<=0){  //new record creation 
      toastWarning(t('comps.form_details.newRec'))
      return
    }
    loading.value=true
    const idImage=getRandomInt(1,214e7)
    const {data:res1}=await postInCloud(idImage,obj.data,token.value,ctrl.signal) //create asset on Cloudinary.com
    if(res1.statusCode===200){  
      obj.idImage=idImage
      obj.data=undefined  
      obj.url=res1.data
      const {data,...body}=_.cloneDeep(obj)
      const {data:res2}=await postEntity('Image',body,token.value,ctrl.signal)  //create image record in mariaDB timage
      if(res2.statusCode===200) {
        let res3=null
        switch(props.model){
          case 'Expo':
            res3=(await postEntity('ExpoImage',{idExpo:props.data.idExpo,idImage},token.value,ctrl.signal)).data
            break
          default:
            res3=(await patchEntity(props.model,props.data[`id${props.model}`],{idImage},token.value,ctrl.signal)).data  //update idImage (avatar) in mariaDB tuser
        }
        if(res3.statusCode===200) 
          file.value={    //update state
            ...body,
            fileSize:formatDateTime(body.fileLastModified),
            fileLastModified:formatDateTime(body.fileLastModified)
          }   
        }
    }
    if(props.model==='User' && props.data[`id${props.model}`]===decoded.value.idUser) 
      router.go(0)  //page refresh without full reload
    loading.value=false
  }
  function handleSelectedFile(e){    
    const file = e.target.files[0];
    let val = getEmptyFile()    
    if (typeof file !== "undefined") {
      const reader1 = new FileReader();
      if (props.fileYes.includes("image")) {
        reader1.onload = async function () {
          let name = file.name;
          const blob = await arrayBufferToWebP(reader1.result);
          if (blob.size > environment.max_file_size) {
            toastError(`${t('comps.file_upload.max_exceeded')} ${environment.max_file_size}`)
            return
          }
          const reader2 = new FileReader();
          reader2.onload = function () {
            if (!file.type.includes("webp")) {
              name = file.name.split(".");
              name.splice(-1, 1);
              name = name.join(".") + ".webp";
            }
            val = {
              ...val,
              fileName:name,
              fileSize: blob.size,
              fileLastModified: file.lastModified,
              url: null,
              data: reader2.result,};
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
        reader1.readAsArrayBuffer(file);
      }
      if (!props.fileYes.includes('image')) {
        reader1.readAsText(file);
        reader1.onload = function () {
          val = {
            ...val,
            fileName: file.name,
            fileSize: file.size,
            fileLastModified: file.lastModified,
            url: null,
            data: btoa(reader1.result),
          };
          processFileData(val);
        };
        reader1.onerror = function (error) {
          console.log("Error during umap file upload in FieldsetFile.vue: ", error);
        };
      }
    } else processFileData(val);
  }
</script>

<template>
  <div className="file-container">
    <div class="action-infos">
      <div className="buttons-container">
        <q-btn v-if="file.url"
          color='primary'
          rounded standout pulse
          no-wrap
          icon="delete"
          :label="$t('comps.file_upload.delete')"
          :disabled="false"
          @click="handleClick('delete')"
        >
        </q-btn >    
        <q-btn v-if="!file.url"
          color='primary'
          rounded standout pulse
          no-wrap
          icon="upload"
          :label="$t('comps.file_upload.upload')"
          :disabled="false"
          @click="handleClick('upload')"
        >
          <input
            id="select-file"
            class="upload"
            type="file"
            :accept="fileYes"
            @change="handleSelectedFile"
          />
        </q-btn>
      </div>
      <div className="file-details">
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
    </div>
    <div v-if="file.url && fileYes.includes('image')" class="image">
      <img :src="file.url" :alt="file.fileName">
    </div>
  </div>
</template>

<style scoped>
  div.file-container {
    display:flex;
    flex-wrap: wrap;
    justify-content: center;
    margin:5px auto;
  }
  div.action-infos {
    display:flex;
    flex-direction: column;
  }
  div.buttons-container {
    display:flex;
    flex-wrap: nowrap;
    justify-content: space-between;
  }
  .q-btn {
    width:100%;
    max-height: 3.6rem;
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
  img {
    object-fit: cover;
    height:223px;
    padding:5px;
    border:1px solid lightgrey;
    margin-left: 0;
  }
  @media screen and (min-width: 753px) {
    img {      
      margin-left: 30px;
    }
  }
</style>