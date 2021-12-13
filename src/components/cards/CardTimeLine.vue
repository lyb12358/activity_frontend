<template>
  <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
    <q-card class="q-pa-md">
      <q-card-section class="text-h6 q-pb-none">
        <q-item>
          <q-item-section avatar class="">
            <q-icon
              color="blue"
              name="mdi-text-box-check"
              style="font-size: 2em"
            />
          </q-item-section>

          <q-item-section>
            <div class="text-h6">使用须知</div>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section class="">
        <q-timeline color="secondary">
          <q-timeline-entry
            v-for="(timeline, index) in timeline_list"
            :key="index"
            :title="timeline.title"
            :subtitle="timeline.subtitle"
            :color="timeline.color"
            :icon="timeline.icon"
            :side="timeline.side"
          >
            <div>
              {{ timeline.desc }}
            </div>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CardTimeLine',
  setup() {
    return {
      timeline_list: [
        {
          title: '维护基础信息',
          side: 'left',
          desc: '依次维护门店信息、添加音乐',
          color: 'red',
          icon: 'mdi-numeric-1-box'
        },
        {
          title: '新建活动',
          side: 'left',
          desc: '输入活动基础信息，依次上传产品主图（限一张），产品详情图（限一张），活动主图（限一张），活动详情图（限五张），并生成活动二维码',
          color: 'blue',
          icon: 'mdi-numeric-2-box'
        },
        {
          title: '传播二维码',
          side: 'left',
          desc: '客户到店后，核销二维码',
          color: 'green',
          icon: 'mdi-numeric-3-box'
        }
      ]
    }
  }
})
</script>
