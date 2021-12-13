<template>
  <q-page class="q-pa-sm">
    <card-social icon_position="left" />

    <card-charts />

    <div class="row q-col-gutter-sm q-py-sm"><card-time-line /><card-mp /></div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue'

export default defineComponent({
  name: 'PageIndex',
  components: {
    CardSocial: defineAsyncComponent(() =>
      import('components/cards/CardSocial')
    ),
    CardCharts: defineAsyncComponent(() =>
      import('components/cards/CardCharts')
    ),
    CardTimeLine: defineAsyncComponent(() =>
      import('components/cards/CardTimeLine')
    ),
    CardMp: defineAsyncComponent(() => import('components/cards/CardMp'))
  },
  setup() {
    return {
      mode: 'list'
    }
  }
})
</script>
