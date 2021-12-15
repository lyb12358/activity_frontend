<template>
  <q-page>
    <div class="q-pa-sm">
      <q-table
        :class="
          $q.dark.isActive
            ? 'my-sticky-header-table-dark'
            : 'my-sticky-header-table'
        "
        :rows="serverData"
        :columns="columns"
        row-key="id"
        flat
        :loading="tableLoading"
        v-model:pagination="serverPagination"
        bordered
        virtual-scroll
        :visible-columns="visibleColumns"
        @request="request"
        :rows-per-page-options="[10, 20]"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              {{ props.row.name }}
              <q-btn
                dense
                round
                flat
                :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
                @click="props.expand = !props.expand"
              />
            </q-td>
            <q-td key="userId" :props="props">{{ props.row.userName }}</q-td>
            <q-td key="shopId" :props="props">{{ props.row.shopName }}</q-td>
            <q-td key="mainImage" :props="props">
              <q-img
                :src="api + props.row.mainImage"
                style="height: 50px; width: 50px"
              />
            </q-td>
            <q-td key="prodImage" :props="props">
              <q-img
                :src="api + props.row.prodImage"
                style="height: 50px; width: 50px"
              />
            </q-td>
            <q-td key="prodDetailImage" :props="props">
              <q-img
                :src="api + props.row.prodDetailImage"
                style="height: 50px; width: 50px"
              />
            </q-td>
            <q-td key="isDel" :props="props">
              <q-icon
                :name="
                  props.row.isDel == 0 ? 'mdi-check-circle' : 'mdi-close-circle'
                "
                size="1.5rem"
                :color="props.row.isDel == 0 ? 'positive' : 'negative'"
              />
            </q-td>
            <q-td key="gmtExpiry" :props="props">
              {{ formatDate(props.row.gmtExpiry) }}
            </q-td>
            <q-td key="gmtCreate" :props="props">
              {{ formatDate(props.row.gmtCreate) }}
            </q-td>
            <q-td key="gmtModified" :props="props">
              {{ formatDate(props.row.gmtModified) }}
            </q-td>
          </q-tr>
          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%">
              <div class="text-left">
                <q-btn-group>
                  <q-btn
                    dense
                    label="修改活动"
                    icon="mdi-pencil"
                    @click="openDetailDialog('update', props.row.id)"
                  />
                  <q-btn
                    dense
                    label="上传产品主图"
                    icon="mdi-pencil"
                    @click="openImageDialog(props.row.id, 1)"
                  />
                  <q-btn
                    dense
                    label="上传产品详情图"
                    icon="mdi-pencil"
                    @click="openImageDialog(props.row.id, 2)"
                  />
                  <q-btn
                    dense
                    label="上传活动主图"
                    icon="mdi-pencil"
                    @click="openImageDialog(props.row.id, 3)"
                  />
                  <q-btn
                    dense
                    label="维护活动详情图"
                    icon="mdi-pencil"
                    @click="
                      openDetailImageDialog(props.row.id, props.row.detailImage)
                    "
                  />
                  <q-btn
                    dense
                    label="维护活动产品"
                    icon="mdi-pencil"
                    @click="openProdDialog(props.row.id)"
                  />
                  <q-btn
                    dense
                    label="二维码"
                    icon="mdi-qrcode"
                    @click="openQrDialog(props.row.id)"
                  />
                  <!-- <q-btn label="启用/停用" icon="mdi-eraser" /> -->
                </q-btn-group>
              </div>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:top="props">
          <div class="col-2 q-table__title">活动</div>
          <q-space />
          <q-select
            v-model="visibleColumns"
            multiple
            borderless
            dense
            options-dense
            display-value="显示列"
            emit-value
            map-options
            :options="columns"
            option-value="name"
          />
          <q-btn
            v-show="resetBtnExist"
            color="secondary"
            style="margin-left: 8px"
            size="sm"
            icon="mdi-eraser"
            label="重置当前搜索"
            @click="resetSearchForm()"
          />
          <q-btn
            color="secondary"
            style="margin-left: 8px"
            size="sm"
            icon="mdi-magnify"
            label="搜索"
            @click="searchDetailOpened = true"
          />
          <q-btn
            style="margin-left: 8px"
            icon="mdi-new-box"
            size="sm"
            color="primary"
            label="新建"
            @click="openDetailDialog('add', 0)"
          ></q-btn>
        </template>
      </q-table>
    </div>
    <!-- activity-dialog -->
    <q-dialog v-model="detailOpened" persistent>
      <q-card style="width: 1000px; max-width: 80vw">
        <q-toolbar class="bg-white text-teal">
          <q-toolbar-title>
            <span class="text-h5 text-weight-bold">{{ dialogActiveName }}</span>
          </q-toolbar-title>
        </q-toolbar>
        <q-card-section style="max-height: 70vh" class="scroll">
          <q-separator inset />
          <q-card-section>
            <div class="text-subtitle">基本属性</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <q-input
              class="col-4"
              outlined
              v-model.trim="activity.name"
              label="名称"
              ref="name"
              :error="v$.activity.name.$error"
              error-message="名称必填！"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
            <q-input
              class="col-4"
              outlined
              v-model.trim="activity.subTitle"
              label="副标题"
              ref="subTitle"
              :error="v$.activity.subTitle.$error"
              error-message="副标题必填！"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>

            <q-select
              class="col-4"
              outlined
              v-model="activity.shopId"
              emit-value
              label="门店"
              map-options
              :error="v$.activity.shopId.$error"
              error-message="关联门店必选！"
              :options="shopOptions"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account-box-outline" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>
                      创建人{{ scope.opt.name }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              class="col-4"
              outlined
              v-model.trim="activity.prodName"
              label="主推产品名称"
              ref="prodName"
              :error="v$.activity.prodName.$error"
              error-message="必须为活动创建一个主推产品！"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="text-subtitle">媒体属性</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <q-input
              class="col-4"
              outlined
              v-model.trim="activity.theme"
              label="主题颜色"
              ref="theme"
            >
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <div>
                  <q-color
                    v-model="activity.theme"
                    no-header-tabs
                    no-footer
                    default-view="palette"
                  />
                </div>
              </q-popup-proxy>
              <template v-slot:prepend>
                <q-icon name="colorize" class="cursor-pointer"></q-icon>
              </template>
            </q-input>
            <q-select
              class="col-4"
              outlined
              v-model="activity.musicId"
              emit-value
              use-input
              input-debounce="0"
              label="音乐"
              map-options
              :options="musicOptions"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account-box-outline" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>
                      创建人{{ scope.opt.name }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="text-subtitle">活动设置</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <q-input
              class="col-4"
              outlined
              v-model.trim="activity.fakeCount"
              label="虚拟浏览次数"
              ref="fakeCount"
              :error="v$.activity.fakeCount.$error"
              error-message="不能为空，必须是一个整数！"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
            <q-input
              class="col-4"
              outlined
              v-model.trim="activity.fakeAppointment"
              label="虚拟预约次数"
              ref="fakeAppointment"
              :error="v$.activity.fakeAppointment.$error"
              error-message="不能为空，必须是一个整数！"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
            <q-input
              class="col-4"
              outlined
              v-model.trim="activity.customLimit"
              label="单人预约上限"
              ref="customLimit"
              :error="v$.activity.customLimit.$error"
              error-message="不能为空，必须是一个整数！"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
            <q-input
              class="col-4"
              outlined
              v-model.trim="activity.activityLimit"
              label="总预约上限"
              ref="limit"
              :error="v$.activity.activityLimit.$error"
              error-message="不能为空，必须是一个整数！"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
            <q-input
              class="col-4"
              outlined
              v-model.trim="activity.proxyExpiry"
              label="截止日期"
              ref="gmtExpiry"
              :error="v$.activity.proxyExpiry.$error"
              error-message="必须选择一个日期，截止日期只用作进度条显示！"
            >
              <q-popup-proxy
                ref="qDateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="activity.proxyExpiry">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="关闭" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer"></q-icon>
              </template>
            </q-input>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md"></q-card-section>
          <q-separator inset />
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="取消" v-close-popup />
          <q-btn
            color="primary"
            @click="resetDetailDialog"
            v-if="dialogActiveName === '新增活动'"
            label="重置"
          />
          <q-btn
            color="primary"
            @click="submitDetailDialog"
            :loading="detailDialogLoading"
            label="确定"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- search dialog -->
    <q-dialog v-model="searchDetailOpened" persistent>
      <q-card style="width: 600px; max-width: 80vw">
        <q-form
          @submit="search"
          @reset="resetSearchForm"
          autocorrect="off"
          autocapitalize="off"
          autocomplete="off"
          spellcheck="false"
        >
          <q-card-section>
            <div class="text-h6">搜索</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <q-input
              class="col-6"
              outlined
              v-model.trim="searchForm.name"
              label="名称"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <template v-slot:prepend>
              <q-icon name="mdi-account-box-outline" />
            </template>
          </q-card-section>
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat label="取消" v-close-popup />
            <q-btn color="primary" type="reset" label="重置" />
            <q-btn
              color="primary"
              type="submit"
              :loading="detailDialogLoading"
              label="确定"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <!-- detail image -->
    <q-dialog v-model="detailImageDialogOpened" persistent>
      <q-card style="width: 800px">
        <q-card-section>
          <div class="text-h6">
            拖动右侧小图可以改变顺序(如果空白请先上传图片)
          </div>
        </q-card-section>
        <q-card-section horizontal>
          <q-card-section style="max-height: 70vh" class="scroll">
            <div class="row">
              <div
                class="col-12"
                v-for="item in detailImageList"
                :key="item.index"
              >
                <q-img :src="api + item" style="width: 400px" />
              </div>
            </div>
          </q-card-section>
          <q-card-section class="col-3">
            <draggable :list="detailImageList" group="people" item-key="index">
              <template #item="{ element }">
                <div class="q-pa-xs">
                  <q-img
                    :src="api + element"
                    style="width: 80px; height: 80px"
                    class="rounded-borders"
                  >
                    <q-badge floating @click="removeAt(index)">
                      <q-icon name="close" color="white" />
                    </q-badge>
                  </q-img>
                </div>
              </template>
            </draggable>
          </q-card-section>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="关闭" color="primary" v-close-popup />
          <q-btn
            flat
            label="上传图片"
            color="primary"
            @click="openImageDialog(this.uploadId, 4)"
          />
          <q-btn flat label="确认" color="primary" @click="confirmDrag()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- qrcode -->
    <q-dialog v-model="qrDialogOpened">
      <q-card>
        <q-card-section>
          <div class="text-h6">活动二维码</div>
        </q-card-section>
        <q-card-section>
          <qrcode-vue :value="qrValue" :size="300" level="H" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- upload image -->
    <q-dialog v-model="imageDialogOpened" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">上传图片</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-uploader
            ref="imageUpload"
            :url="api + mediaUploadUrl"
            accept=".jpg, .jpeg, .png"
            :headers="[
              {
                name: 'id',
                value: this.uploadId
              },
              { name: 'uploadType', value: this.uploadType }
            ]"
            style="max-width: 300px"
            @uploaded="imageUploaded"
            @failed="uploadFail"
            @added="addImageFile"
            field-name="file"
            name="file"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- product -->
    <q-dialog v-model="prodDialogOpened" persistent>
      <q-card style="width: 600px; max-width: 80vw">
        <q-form
          @submit="submitProdDialog"
          autocorrect="off"
          autocapitalize="off"
          autocomplete="off"
          spellcheck="false"
        >
          <q-card-section>
            <div class="text-h6">活动产品信息</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <q-input
              class="col-6"
              outlined
              v-model.trim="product[0].name"
              label="活动产品1"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-model.trim="product[1].name"
              label="活动产品2"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-model.trim="product[2].name"
              label="活动产品3"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-model.trim="product[3].name"
              label="活动产品4"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-model.trim="product[4].name"
              label="活动产品5"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-subtitles" />
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat label="取消" v-close-popup />
            <q-btn
              color="primary"
              type="submit"
              :loading="prodDialogLoading"
              label="确定"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { date } from 'quasar'
import {
  getActivityList,
  addActivity,
  getActivityById,
  getMusicOptions,
  updateDetailImage
} from 'src/api/activity'
import {
  getActivityProductList,
  addActivityProduct
} from 'src/api/productManage'
import { getShopOptions } from 'src/api/shopAndCustom'
import draggable from 'vuedraggable'
import QrcodeVue from 'qrcode.vue'
// import { Field, Form, useForm, useField } from 'vee-validate'
// import * as yup from 'yup'
// import QInputWithValidation from 'components/QInputWithValidation.vue'
import useVuelidate from '@vuelidate/core'
import {
  required,
  minlength,
  maxLength,
  minValue,
  maxValue,
  numeric,
  integer,
  decimal
} from '@vuelidate/validators'

export default {
  components: {
    QrcodeVue,
    draggable
  },
  setup() {
    //const { resetForm } = useForm()
    // const schema = yup.object({
    //   name: yup.string().required(),
    //   shopId: yup.string().required()
    // })
    return {
      // resetForm,
      // schema,
      v$: useVuelidate()
    }
  },
  validations() {
    return {
      activity: {
        name: { required },
        subTitle: { required },
        shopId: { required },
        prodName: { required },
        fakeCount: { required, integer, minValue: minValue(0) },
        fakeAppointment: { required, integer, minValue: minValue(0) },
        customLimit: { required, integer, minValue: minValue(0) },
        activityLimit: { required, integer, minValue: minValue(0) },
        proxyExpiry: {
          required
        }
      }
    }
  },
  data() {
    return {
      //qr
      qrValue: '',
      qrDialogOpened: false,
      //api
      api: process.env.API,
      mediaUploadUrl: '/mediaUpload',
      //table
      columns: [
        {
          name: 'name',
          required: true,
          label: '名称',
          align: 'left',
          field: 'name'
        },
        {
          name: 'userId',
          label: '创建人',
          align: 'center',
          field: 'userId'
        },
        {
          name: 'shopId',
          label: '关联门店',
          align: 'center',
          field: 'shopId'
        },
        {
          name: 'mainImage',
          label: '活动主图',
          align: 'center',
          field: 'mainImage'
        },
        {
          name: 'prodImage',
          label: '产品主图',
          align: 'center',
          field: 'prodImage'
        },
        {
          name: 'prodDetailImage',
          label: '产品详情图',
          align: 'center',
          field: 'prodDetailImage'
        },
        {
          name: 'isDel',
          label: '状态',
          align: 'center',
          field: 'isDel'
        },
        {
          name: 'gmtExpiry',
          label: '过期时间',
          align: 'center',
          field: 'gmtExpiry'
        },
        {
          name: 'gmtCreate',
          label: '添加时间',
          align: 'center',
          field: 'gmtCreate'
        },
        {
          name: 'gmtModified',
          label: '修改时间',
          align: 'center',
          field: 'gmtModified'
        }
      ],
      visibleColumns: [
        'name',
        'userId',
        'shopId',
        'mainImage',
        'prodImage',
        'prodDetailImage',
        'isDel',
        'gmtExpiry'
      ],
      tableLoading: false,
      searchForm: {
        page: 0,
        row: 0,
        userId: this.$store.getters['user/userInfo'].id,
        name: '',
        status: '',
        type: this.$store.getters['user/userInfo'].type
      },
      resetBtnExist: false,
      serverPagination: {
        page: 1,
        rowsNumber: 10,
        rowsPerPage: 10
        // specifying this determines pagination is server-side
      },
      serverData: [],
      //dialog
      detailOpened: false,
      dialogActiveName: '',
      detailDialogLoading: false,
      activity: {
        id: '',
        name: '',
        subTitle: '',
        music: '',
        musicId: '',
        shopId: '',
        userId: '',
        theme: '#FF0000',
        mainImage: '',
        detailImage: '',
        fakeCount: 0,
        fakeAppointment: 0,
        customLimit: 5,
        activityLimit: '',
        prodName: '',
        prodImage: '',
        prodDetailImage: '',
        status: '',
        isDel: '',
        gmtExpiry: '',
        proxyExpiry: ''
      },
      searchDetailOpened: false,
      //mount fetch data
      shopOptions: [],
      musicOptions: [],
      //upload
      //main image
      imageDialogOpened: false,
      uploadId: '',
      uploadType: '',
      //detail image
      detailImageList: [],
      detailImageDialogOpened: false,
      //product
      prodDialogOpened: false,
      prodDialogLoading: false,
      product: [
        { id: '', name: '', activityId: '' },
        { id: '', name: '', activityId: '' },
        { id: '', name: '', activityId: '' },
        { id: '', name: '', activityId: '' },
        { id: '', name: '', activityId: '' }
      ],
      product1: { id: '', name: '', activityId: '' },
      product2: { id: '', name: '', activityId: '' },
      product3: { id: '', name: '', activityId: '' },
      product4: { id: '', name: '', activityId: '' },
      product5: { id: '', name: '', activityId: '' }
    }
  },
  computed: {
    // detailImageList: function () {
    //   return this.activity.detailImage.split(';')
    // }
  },
  methods: {
    notify(color, message) {
      this.$q.notify({
        message: message,
        color: color
      })
    },
    //drag
    removeAt(idx) {
      this.detailImageList.splice(idx, 1)
    },
    //qr code
    openQrDialog(id) {
      this.qrValue =
        'http://www.beyond-it-service.com/activity_frontend/reserve?activityId=' +
        id
      this.qrDialogOpened = true
    },
    //detail image
    openDetailImageDialog(id, detailImage) {
      this.uploadId = id
      if (detailImage != '') {
        this.detailImageList = detailImage.split(';')
      } else {
        this.detailImageList = []
      }

      this.detailImageDialogOpened = true
    },
    openImageDialog(id, type) {
      this.uploadId = id
      this.uploadType = type
      this.imageDialogOpened = true
    },
    confirmDrag() {
      if (this.detailImageList.length > 5) {
        this.notify(
          'warning',
          '活动详情图最多允许5张，请删除多余的图片再确认！'
        )
        return
      }
      let imageString = this.detailImageList.join(';')
      updateDetailImage(this.uploadId, imageString)
        .then((response) => {
          this.request({
            pagination: this.serverPagination
          })
          this.detailImageDialogOpened = false
        })
        .catch((error) => {})
    },
    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.musicOptions.value = this.musicOptions.filter(
          (v) => v.label.indexOf(needle) > -1
        )
      })
    },
    formatDate(timeStamp) {
      return date.formatDate(timeStamp, 'YYYY-MM-DD HH:mm:ss')
    },
    //dataTable request
    request({ pagination }) {
      this.tableLoading = true
      this.searchForm.page = pagination.page
      this.searchForm.row = pagination.rowsPerPage
      getActivityList(this.searchForm)
        .then((response) => {
          let data = response.data.data
          this.serverPagination.rowsNumber = data.total
          this.serverPagination.page = pagination.page
          this.serverPagination.rowsPerPage = pagination.rowsPerPage
          this.serverData = data.rows
          this.tableLoading = false
        })
        .catch((error) => {
          this.tableLoading = false
        })
    },
    resetSearchForm() {
      Object.assign(this.searchForm, this.$options.data.call(this).searchForm)
      this.searchForm.userId = this.$store.getters['user/userInfo'].id
      this.searchForm.type = this.$store.getters['user/userInfo'].type
      this.$nextTick(() => {
        this.serverPagination.page = 1
        this.request({
          pagination: this.serverPagination
        })
      })
      this.resetBtnExist = false
    },
    search() {
      this.serverPagination.page = 1
      this.request({
        pagination: this.serverPagination
      })
      this.resetBtnExist = true
    },
    //dialog
    openDetailDialog(action, id) {
      this.v$.activity.$reset()
      if (action == 'add') {
        Object.assign(this.activity, this.$options.data.call(this).activity)
        this.activity.id = ''
        this.dialogActiveName = '新增活动'
        this.detailOpened = true
      } else {
        this.dialogActiveName = '修改活动'
        getActivityById(id)
          .then((response) => {
            Object.assign(this.activity, response.data.data)
            this.activity.proxyExpiry = date.formatDate(
              response.data.data.gmtExpiry,
              'YYYY/MM/DD'
            )
          })
          .catch((error) => {})
        this.detailOpened = true
      }
    },
    resetDetailDialog() {
      Object.assign(this.activity, this.$options.data.call(this).activity)
      this.v$.activity.$reset()
    },
    submitDetailDialog() {
      this.v$.activity.$touch()
      if (this.v$.activity.$invalid) {
        return
      }
      if (date.formatDate(this.activity.proxyExpiry, 'x') < Date.now()) {
        this.notify('warning', '请输入合理的过期时间，至少为明天')
        return
      }
      this.v$.activity.$reset()
      this.detailDialogLoading = true
      this.activity.gmtExpiry = date.formatDate(this.activity.proxyExpiry, 'x')
      if (this.dialogActiveName == '新增活动') {
        this.activity.status = 1
        this.activity.isDel = 0
        this.activity.userId = this.$store.getters['user/userInfo'].id
      }
      addActivity(this.activity)
        .then((response) => {
          this.notify('positive', response.data.msg)
          this.detailDialogLoading = false
          this.detailOpened = false
          this.request({
            pagination: this.serverPagination
          })
        })
        .catch((error) => {
          this.detailDialogLoading = false
        })
    },
    //product
    openProdDialog(id) {
      Object.assign(this.product, this.$options.data.call(this).product)
      for (let i = 0; i < this.product.length; i++) {
        this.product[i].activityId = id
      }
      getActivityProductList(id)
        .then((response) => {
          let prodList = response.data.data
          for (let i = 0; i < prodList.length; i++) {
            this.product[i].id = prodList[i].id
            this.product[i].name = prodList[i].name
          }
          this.prodDialogOpened = true
        })
        .catch((error) => {})
    },
    submitProdDialog() {
      this.prodDialogLoading = true
      addActivityProduct(this.product)
        .then((response) => {
          this.notify('positive', response.data.msg)
          this.prodDialogLoading = false
          this.prodDialogOpened = false
        })
        .catch((error) => {
          this.prodDialogLoading = false
        })
    },
    //image
    // when image has just bean uploaded
    imageUploaded(info) {
      let response = JSON.parse(info.xhr.response)
      if (response.code == 20000) {
        this.notify('positive', response.msg)
        this.$refs.imageUpload.reset()
        this.imageDialogOpened = false
        if (this.uploadType != 4) {
          this.request({
            pagination: this.serverPagination
          })
        } else {
          this.detailImageList.push(response.data)
        }
      } else {
        this.notify('negative', response.msg)
        this.$refs.imageUpload.reset()
      }
    },
    // when it has encountered error while uploading
    uploadFail(info) {
      let response = JSON.parse(info.xhr.response)
      this.notify('negative', response.data.msg)
    },
    addImageFile(files) {
      if (files[0].size > 3 * 1024 * 1024) {
        this.$refs.imageUpload.reset()
        this.notify('warning', '单张图片不能大于3MB')
      }
      if (this.uploadType == 4 && this.detailImageList.length >= 5) {
        this.notify(
          'warning',
          '活动详情图最多允许5张，请删除多余的图片再上传！'
        )
        this.$refs.imageUpload.reset()
        this.imageDialogOpened = false
      }
    }
  },
  mounted() {
    this.searchForm.userId = this.$store.getters['user/userInfo'].id
    this.searchForm.type = this.$store.getters['user/userInfo'].type

    this.request({
      pagination: this.serverPagination
    })

    getMusicOptions().then((response) => {
      this.musicOptions = response.data.data
    })
    getShopOptions(
      this.$store.getters['user/userInfo'].type,
      this.$store.getters['user/userInfo'].id
    ).then((response) => {
      this.shopOptions = response.data.data
    })
  }
}
</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: calc(100vh - 65px)

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #c1f4cd

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
.my-sticky-header-table-dark
  /* height or max-height is important */
  height: calc(100vh - 65px)

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #000000

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
