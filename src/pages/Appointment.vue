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
            <q-td key="customName" :props="props">
              {{ props.row.customName }}
              <q-btn
                dense
                round
                flat
                :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
                @click="props.expand = !props.expand"
              />
            </q-td>
            <q-td key="customAvatar" :props="props">
              <img
                :src="props.row.customAvatar"
                style="height: 50px; width: 50px"
              />
            </q-td>
            <q-td key="mobile" :props="props">{{ props.row.mobile }}</q-td>
            <q-td key="activityName" :props="props">
              {{ props.row.activityName }}
            </q-td>
            <q-td key="shopName" :props="props">{{ props.row.shopName }}</q-td>
            <q-td key="isVerified" :props="props">
              <q-icon
                :name="
                  props.row.isVerified == 1
                    ? 'mdi-check-circle'
                    : 'mdi-close-circle'
                "
                size="1.5rem"
                :color="props.row.isVerified == 1 ? 'positive' : 'amber-3'"
              />
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
              <div class="text-left no-padding">
                <q-btn-group>
                  <q-btn
                    dense
                    label="核销"
                    icon="mdi-checkbox-marked"
                    @click="checkCode(props.row.isVerified, props.row.code)"
                  />
                  <!-- <q-btn label="启用/停用" icon="mdi-eraser" /> -->
                </q-btn-group>
              </div>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:top="props">
          <div class="col-2 q-table__title">客户</div>
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
            color="primary"
            style="margin-left: 8px"
            size="sm"
            icon="mdi-file-excel"
            label="导出预约信息"
            :loading="excelLoading"
            @click="downloadExcel"
          />
        </template>
      </q-table>
    </div>
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
              label="姓名"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-model.trim="searchForm.mobile"
              label="手机号"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-model.trim="searchForm.activityName"
              label="活动名称"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-model.trim="searchForm.shopName"
              label="门店名称"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
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
  </q-page>
</template>

<script>
import { date } from 'quasar'
import { getAppointmentList, verifiedCodeById } from 'src/api/shopAndCustom'
import { appointmentExport } from 'src/api/file'
export default {
  data() {
    return {
      //table
      columns: [
        {
          name: 'customName',
          required: true,
          label: '名称',
          align: 'left',
          field: 'customName'
        },
        {
          name: 'customAvatar',
          label: '头像',
          align: 'center',
          field: 'customAvatar'
        },
        {
          name: 'mobile',
          label: '手机号',
          align: 'center',
          field: 'mobile'
        },
        {
          name: 'activityName',
          label: '活动',
          align: 'center',
          field: 'activityName'
        },
        {
          name: 'shopName',
          label: '门店',
          align: 'center',
          field: 'shopName'
        },
        {
          name: 'isVerified',
          label: '是否核销',
          align: 'center',
          field: 'isVerified'
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
        'customName',
        'customAvatar',
        'mobile',
        'activityName',
        'shopName',
        'isVerified'
      ],
      tableLoading: false,
      searchForm: {
        page: 0,
        row: 0,
        mobile: '',
        userId: this.$store.getters['user/userInfo'].id,
        name: '',
        activityName: '',
        shopName: '',
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
      detailDialogLoading: false,
      searchDetailOpened: false,
      //excel
      excelLoading: false
    }
  },
  methods: {
    notify(color, message) {
      this.$q.notify({
        message: message,
        color: color
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
      getAppointmentList(this.searchForm)
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
      this.searchDetailOpened = false
      this.resetBtnExist = true
    },
    checkCode(isVerified, code) {
      if (isVerified) {
        this.notify('warning', '该预约已经核销，无法重复核销')
        return
      }
      this.$q
        .dialog({
          title: '确认框',
          message: '是否核销客户本次预约?',
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          verifiedCodeById(code, this.$store.getters['user/userInfo'].id, 0)
            .then((response) => {
              this.notify('positive', response.data.msg)
              this.request({
                pagination: this.serverPagination
              })
            })
            .catch((error) => {})
        })
        .onOk(() => {
          // console.log('>>>> second OK catcher')
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        })
    },
    //download excel
    downloadExcel() {
      this.excelLoading = true
      appointmentExport(this.searchForm)
        .then((response) => {
          this.fileDownload(
            response.data,
            '预约信息导出' + this.formatDate(Date.now()) + '.xls'
          )
          this.excelLoading = false
        })
        .catch((error) => {
          this.excelLoading = false
        })
    },
    // public method to download file
    fileDownload(data, name) {
      if (!data) {
        return
      }
      let url = window.URL.createObjectURL(new Blob([data]))
      let link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', name)
      document.body.appendChild(link)
      link.click()
      // release url object
      URL.revokeObjectURL(link.href)
      document.body.removeChild(link)
    }
  },
  mounted() {
    this.searchForm.userId = this.$store.getters['user/userInfo'].id
    this.searchForm.type = this.$store.getters['user/userInfo'].type
    this.request({
      pagination: this.serverPagination
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
