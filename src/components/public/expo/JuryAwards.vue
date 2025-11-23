<script setup>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'

  const props = defineProps({
    data: { type: Object }
  })

  const { locale } = useI18n()

  const columns = {
    jury:[
      { name: 'idUser', field: 'idUser' },
      { name: 'url', field: 'url' },
      { name: 'lastName', field: 'lastName' },
      { name: 'firstName', field: 'firstName' },
      { name: 'role_fr', field: 'role_fr' },
      { name: 'role_en', field: 'role_en' },
      { name: 'resume_fr', field: 'resume_fr' },
      { name: 'resume_en', field: 'resume_en' }
    ],
    award:[
      { name: 'idPrize', field: 'idPrize' },
      { name: 'prize_fr', field: 'prize_fr' },
      { name: 'prize_en', field: 'prize_en' },
      { name: 'url', field: 'url' },
      { name: 'lastName', field: 'lastName' },
      { name: 'firstName', field: 'firstName' }
    ]
  }
  const visible = computed(() => {
    return {
      jury:[
        'idUser',
        'url',
        'lastName',
        'firstName',
        `role_${locale.value}`,
        `resume_${locale.value}`
      ],
      award:[
        'idPrize',
        `prize_${locale.value}`,
        'url',
        'lastName',
        'firstName'
      ]
    }
  }
  )

  const pagination = ref({
    page: 1,
    rowsPerPage: 0
  })
</script>

<template>
  <section>
    <q-table
      class="table"
      :title="$t('comps.public_site.expos.tabs.jury-award.jury')"
      :rows="data.jury"
      :columns="columns.jury"
      :visible-columns="visible.jury"
      :row-key="columns.jury[0].name"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      hide-pagination
      dense
    >
      <template #no-data>
        <div class="no-data">
          <q-icon name="warning" size="2rem" />
          <div>{{ $t('comps.public_site.expos.tabs.jury-award.not-yet-jury') }} 😕</div>
        </div>
      </template>
      <template #body="slotProps">
        <q-tr :key="slotProps.row.idUser">
          <q-td >
            <div class="personalia">
              <q-img :src="slotProps.row.url" />
              <p class="name">
                {{ `${slotProps.row.lastName} ${slotProps.row.firstName}` }}
              </p>
              <p class="role">
                {{ slotProps.row[`role_${locale}`] }}
              </p>
              <p class="resume">
                {{ slotProps.row[`resume_${locale}`] }}
              </p>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </section>
  <section>
    <q-table
      class="table"
      :title="$t('comps.public_site.expos.tabs.jury-award.award')"
      :rows="data.award"
      :columns="columns.award"
      :visible-columns="visible.award"
      :row-key="columns.award[0].name"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      hide-pagination
      dense
    >
      <template #no-data>
        <div class="no-data">
          <q-icon name="warning" size="2rem" />
          <div>{{ $t('comps.public_site.expos.tabs.jury-award.not-yet-award') }} 😕</div>
        </div>
      </template>
      <template #body="slotProps">
        <q-tr :key="slotProps.row.idPrize" >
          <q-td >
            <div class="award">
              <p class="prize">
                {{ slotProps.row[`prize_${locale}`] }}
              </p>
              <q-img :src="slotProps.row.url" />
              <p v-if="slotProps.row.lastName" class="name">
                {{ `${slotProps.row.lastName} ${slotProps.row.firstName}` }}
              </p>
              <p v-if="!slotProps.row.lastName" >
                {{$t('comps.public_site.expos.tabs.jury-award.not-awarded') }}
              </p>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </section>
</template>

<style scoped>
  section {
    padding: 10px 20px;
    overflow:hidden;
  }
  .table {
    padding-bottom: 10px;
    margin-bottom: 5px;
    width:450px;
    height:100%;
  }
  ::v-deep(div.q-table__title) {
    color:var(--blue);
    font-weight: bolder;
    font-style: italic;
  }
  div.no-data {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    font-size: 1.5rem;
  }
  div.no-data .q-icon {
    padding: 0 5px 5px;
  }
  .personalia {
    display: grid;
    grid-template-rows: 25px auto;
    grid-template-columns: 40px 150px auto;
    align-self: center;
    gap:5px;
  }
 .q-img {
    height: 35px;
    width: 35px;
    object-fit: cover;
    margin-right: 10px;
  }
  .personalia .q-img {
    grid-row: 1;
    grid-column: 1;
  }
  p {    
    font-size: 1.5rem;  
  }
  .personalia p.name {
    grid-row: 1;
    grid-column: 2;
    font-weight: bolder;
  }
  .personalia p.role {
    grid-row: 1;
    grid-column: 3;
    text-wrap: nowrap;
    text-align: right;
  }
  .personalia p.resume {
    grid-row: 2;
    grid-column: 2 / span 2;
    text-align: justify;
    white-space: normal;
    overflow-wrap: break-word;
    line-height: 1.7rem;
  }  
  .award {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 150px 40px  auto;
    align-self: center;
    gap:5px;
  }
  .award p.prize {    
    grid-row: 1;
    grid-column: 1;
  }
  .award .q-img {      
    grid-row: 1;
    grid-column: 2;
  }
  .award p.name {    
    grid-row: 1;
    grid-column: 3;
    font-weight: bolder;
  }
</style>
