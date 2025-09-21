<script setup>
  import { ref } from 'vue';
  import _ from 'lodash'
  import { useI18n } from 'vue-i18n';
  import InputField from '../../fields/InputField.vue';

  const props = defineProps({
    fields:{type:Array},
    data:{type:Object}
  })  
  const {locale}=useI18n()
  const counters=ref({en:0,fr:0})

  const emit=defineEmits(['change','translate'])
  function handleChange(name,valid,val){
    const count=name.split('_')[1]
    counters.value[count]=val.length
    emit('change',name,valid,val)
  }
  function handleTranslate(dir){
    let params=null
    const name=props.fields[0].name.split('_fr')[0]
    switch(dir){
      case "west":
        params=locale.value==='en'?{from:'fr',to:'en',rootName:name}:{from:'en',to:'fr',rootName:name}
        break
      case 'east':        
        params=locale.value==='en'?{from:'en',to:'fr',rootName:name}:{from:'fr',to:'en',rootName:name}
    }
    emit('translate',params)
  }

</script>

<template>
  <div :class="['translate',locale==='en'?'reverse':'']">
    <div class="fr">
      <!-- <label>{{locale==='fr'?fields[0].label:''}}</label> -->
      <img src="../../../../assets/images/fr.png" alt="drapeu français">
      <span class="count">{{`${counters.fr}/${fields[0].max_length}`}}</span>
    </div>
    <InputField 
      v-for="(item) in fields" 
      :key="item.name"
      :name="item.name"
      :field_type="item.field_type"
      label=''
      :required="item.required"
      :disabled="item.disabled"
      :highlight="item.highlight"
      :format="item.format"
      :value="data[item.name]!==null?data[item.name]:''"
      :maxLength="item.max_length"
      :rows="item.rows"
      @change="handleChange"
    >
    </InputField>
    <div class="en">
      <!-- <label>{{locale==='en'?fields[1].label:''}}</label> -->
      <img src="../../../../assets/images/uk.png" alt="UK flag">
      <span class="count">{{`${counters.en}/${fields[0].max_length}`}}</span>
    </div>    
    <div class="controls">
       <q-btn 
          class="glossy" 
          round push color="primary" 
          icon="west" size="sm" tabindex="-1" 
          @click="handleTranslate('west')"
        />  
        <span >{{$t('comps.form_details.translate')}}</span>
       <q-btn 
          class="glossy" 
          round push color="primary" 
          icon="east" size="sm" tabindex="-1"
          @click="handleTranslate('east')"
        />  
    </div>
  </div>
</template>

<style scoped>
  div.translate {
    display:grid;
    grid-template-rows: auto auto;
    grid-template-columns: 1fr 150px 1fr;
    width:100%;
  }
  div.fr,div.en {    
    display:flex;
    flex-wrap: nowrap;
    justify-content:space-between;
    align-items:center;
    padding-top: 5px;
  }
  div.fr {
    grid-area: 1/1;
  }
  .reverse div.fr {
    grid-area: 1/3;
  }
  div.en {
    grid-area: 1/3;
  }
  .reverse div.en {
    grid-area: 1/1;
  }
  span.count {
    font-size:1.15rem;
    color:blue;
    margin:0 5px;
  }
  div.input-container {
    padding-top:0;
  }
  .resume_fr, .title_fr, .desc_fr {
    grid-area: 2/1
  }
  .reverse .resume_fr,.title_fr, .desc_fr {
    grid-area: 2/3;
  }
  .resume_en, .title_en, .desc_en {
    grid-area: 2/3;
  }
  .reverse .resume_en, .reverse .title_en, .reverse .desc_fr {
    grid-area: 2/1
  }
  div.controls {
    grid-area: span 2/2;
    align-self: top;
    justify-self: center;
    display:flex;
    flex-wrap: nowrap;
    align-items: center;

  }
  .q-btn {
    margin: 0 5px;
    height:30px;
  }
  img {
    width:25px;
    height:15px;
    margin-right: 10px;
    margin-bottom: 5px;
  }
  @media screen and (max-width: 900px) {
    div.translate {
      grid-template-rows: repeat(2,auto) 40px repeat(2,auto);
      grid-template-columns: 1fr ;
    }    
    div.fr {
      grid-area: 1/1;
    }
    .reverse div.fr {
      grid-area: 4/1;
    }
    div.en {
      grid-area: 4/1;
    }
    .reverse div.en {
      grid-area: 1/1;
    }
    .resume_fr, .title_fr, .desc_fr {
      grid-area: 2/1
    }
    .reverse .resume_fr, .reverse .title_fr, .reverse .desc_fr {
      grid-area: 5/1;
    }
    .resume_en, .title_en, .desc_en {
      grid-area: 5/1;
    }
    .reverse .resume_en, .reverse .title_en, .reverse .desc_en {
      grid-area: 2/1
    }
    div.controls {
      grid-area: 3/1;
      margin-top: 0; 
    }
    .q-btn {
      transform: rotate(90deg);
    }
  }

</style>