<script setup>
  import { computed } from 'vue'

  const props=defineProps({
    item:{type:Object},
    master:{type:Array},
    id:{type:Number}
  })

 const status=computed(() => {
   switch (props.item.idStatus){
      case 1:
        return [1,'warning']
      case 2:
        return [2,'positive']
      case 3:
        return [3,'negative']
    }
 }) 

</script>

<template>
  <label  :for="id">
    <div class="row1">
      <span class="ucase">{{item[master[0].name]?item[master[0].name]:'t.b.d'}}</span>
      <span v-if="master[1]" class="ccase">{{ item[master[1].name]?item[master[1].name]:'' }}</span>
      <q-icon v-if="status[0]===1 || status[0]===2"name="done_all" :color="status[1]" size="2.5rem"></q-icon>
      <q-icon v-if="status[0]===3" name="no_accounts" :color="status[1]" size="2.5rem"></q-icon>
    </div>
    <div v-if="master[2]" class="row2 lcase">
      <span>{{ item[master[2].name] }}</span>
    </div>
  </label>
</template>

<style scoped>
  label {
    cursor: pointer;
  }  
  span {
    padding-right: 5px;
  }
  .row1 {
    display:flex;
    flex-wrap: nowrap;
    justify-content: left;
    position:relative;
    min-width:250px;
  }
  .q-icon {
    position:absolute;
    right:0;
  }
  .ucase {
    text-transform: uppercase;
  }
  .ccase {
    text-transform: capitalize;
  }
  .lcase {
    text-transform: lowercase;
  }
  .row2 {
    display:flex;
    justify-content: left;
  }
  .row2 span {
    font-weight: lighter;
    color:blue;
    padding:0 5px;
  }

</style>