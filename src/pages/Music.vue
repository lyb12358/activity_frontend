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
            <q-td key="size" :props="props">{{
              getFileSize(props.row.size)
            }}</q-td>
            <q-td key="url" :props="props"
              ><audio :src="api + props.row.url" controls="controls">
                您的浏览器不支持 audio 标签。
              </audio></q-td
            >
            <q-td key="gmtCreate" :props="props">{{
              formatDate(props.row.gmtCreate)
            }}</q-td>
            <q-td key="gmtModified" :props="props">{{
              formatDate(props.row.gmtModified)
            }}</q-td>
          </q-tr>
          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%">
              <div class="text-left no-padding">
                <q-btn-group>
                  <q-btn
                    dense
                    label="修改"
                    icon="mdi-pencil"
                    @click="openDetailDialog('update', props.row.id)"
                  />
                  <!-- <q-btn label="启用/停用" icon="mdi-eraser" /> -->
                </q-btn-group>
              </div>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:top="props">
          <div class="col-2 q-table__title">音乐</div>
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
            @click="openUploadDialog()"
          ></q-btn>
        </template>
      </q-table>
    </div>
    <!-- detail dialog -->
    <q-dialog v-model="detailOpened" persistent>
      <q-card style="width: 600px; max-width: 80vw">
        <q-form
          @submit="submitDetailDialog"
          @reset="resetDetailDialog"
          autocorrect="off"
          autocapitalize="off"
          autocomplete="off"
          spellcheck="false"
        >
          <q-card-section>
            <div class="text-h6">{{ dialogActiveName }}</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <q-input
              class="col-6"
              outlined
              v-model.trim="music.name"
              label="名称"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || '姓名不能为空']"
              ref="name"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat label="取消" v-close-popup />
            <q-btn
              color="primary"
              type="reset"
              v-if="dialogActiveName === '新增音乐'"
              label="重置"
            />
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
    <!-- upload music -->
    <q-dialog v-model="musicDialogOpened" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">上传音乐</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-uploader
            ref="musicUpload"
            :url="api + mediaUploadUrl"
            accept=".mp3"
            :headers="[
              {
                name: 'id',
                value: this.uploadId
              },
              { name: 'uploadType', value: 5 }
            ]"
            style="max-width: 300px"
            @uploaded="musicUploaded"
            @failed="uploadFail"
            @added="addMusicFile"
            field-name="file"
            name="file"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { date } from 'quasar'
import { getMusicList, addMusic, getMusicById } from 'src/api/activity'
export default {
  data() {
    return {
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
          name: 'size',
          label: '容量',
          align: 'center',
          field: 'size'
        },
        {
          name: 'url',
          label: '播放',
          align: 'center',
          field: 'url'
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
        'size',
        'url',
        'gmtCreate',
        'gmtModified'
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
      music: { name: '' },
      serverData: [],
      //dialog
      detailOpened: false,
      dialogActiveName: '',
      detailDialogLoading: false,
      searchDetailOpened: false,
      //upload
      musicDialogOpened: false,
      uploadId: '',
      uploadType: ''
    }
  },
  methods: {
    notify(color, message) {
      this.$q.notify({
        message: message,
        color: color
      })
    },
    getFileSize(str) {
      if (str < 0.1 * 1024) {
        //小于0.1KB，则转化成B
        return str.toFixed(2) + 'B'
      } else if (str < 0.1 * 1024 * 1024) {
        //小于0.1MB，则转化成KB
        return (str / 1024).toFixed(2) + 'KB'
      } else if (str < 0.1 * 1024 * 1024 * 1024) {
        //小于0.1GB，则转化成MB
        return (str / (1024 * 1024)).toFixed(2) + 'MB'
      } else {
        //其他转化成GB
        return (str / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
      }
    },
    formatDate(timeStamp) {
      return date.formatDate(timeStamp, 'YYYY-MM-DD HH:mm:ss')
    },
    //dataTable request
    request({ pagination }) {
      this.tableLoading = true
      this.searchForm.page = pagination.page
      this.searchForm.row = pagination.rowsPerPage
      getMusicList(this.searchForm)
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
    //dialog
    openDetailDialog(action, id) {
      if (action == 'add') {
        Object.assign(this.music, this.$options.data.call(this).music)
        this.user.id = ''
        this.dialogActiveName = '新增音乐'
        this.detailOpened = true
      } else {
        this.dialogActiveName = '修改音乐'
        getMusicById(id)
          .then((response) => {
            Object.assign(this.music, response.data.data)
          })
          .catch((error) => {})
        this.detailOpened = true
      }
    },
    resetDetailDialog() {
      Object.assign(this.music, this.$options.data.call(this).music)
    },
    submitDetailDialog() {
      this.detailDialogLoading = true
      // if (this.dialogActiveName == '新增音乐') {
      //   this.music.status = 1
      //   this.music.isDel = 0
      //   this.user.userId = this.$store.getters['user/userInfo'].id
      // }
      addMusic(this.music)
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
    //upload
    openUploadDialog() {
      this.uploadId = this.$store.getters['user/userInfo'].id
      this.uploadType = 5
      this.musicDialogOpened = true
    },
    // when music has just bean uploaded
    musicUploaded(info) {
      let response = JSON.parse(info.xhr.response)
      if (response.code == 20000) {
        this.notify('positive', response.msg)
        this.$refs.musicUpload.reset()
        this.musicDialogOpened = false

        this.request({
          pagination: this.serverPagination
        })
      } else {
        this.notify('negative', response.msg)
        this.$refs.musicUpload.reset()
      }
    },
    // when it has encountered error while uploading
    uploadFail(info) {
      let response = JSON.parse(info.xhr.response)
      this.notify('negative', response.data.msg)
    },
    addMusicFile(files) {
      if (files[0].size > 5 * 1024 * 1024) {
        this.$refs.musicUpload.reset()
        this.notify('warning', '音乐不能大于5MB')
      }
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
