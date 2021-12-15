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
            <q-td key="account" :props="props">{{ props.row.account }}</q-td>
            <q-td key="type" :props="props">{{ calRole(props.row.type) }}</q-td>
            <q-td key="status" :props="props">
              <q-icon
                :name="
                  props.row.status == 1
                    ? 'mdi-check-circle'
                    : 'mdi-close-circle'
                "
                size="1.5rem"
                :color="props.row.status == 1 ? 'positive' : 'negative'"
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
                    label="修改"
                    icon="mdi-pencil"
                    v-show="props.row.type != 1"
                    @click="openDetailDialog('update', props.row.id)"
                  />
                  <q-btn
                    dense
                    label="重置密码"
                    icon="mdi-pencil"
                    @click="resetPassword(props.row.id, 111111)"
                  />
                  <!-- <q-btn label="启用/停用" icon="mdi-eraser" /> -->
                </q-btn-group>
              </div>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:top="props">
          <div class="col-2 q-table__title">用户</div>
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
              v-model.trim="user.account"
              label="账号"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || '账号不能为空']"
              ref="account"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-model.trim="user.name"
              label="姓名"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || '姓名不能为空']"
              ref="name"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-show="pwdInput"
              v-model.trim="user.password"
              label="密码"
              ref="name"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <q-select
              class="col-6"
              outlined
              v-model="user.type"
              emit-value
              label="角色"
              v-show="
                ($store.getters['user/userInfo'].type == 1 && user.type == 2) ||
                ($store.getters['user/userInfo'].type != 1 && user.type == 3)
              "
              map-options
              :options="
                this.$store.getters['user/userInfo'].type == 1
                  ? roleOptions
                  : roleOptions2
              "
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account-box-outline" />
              </template>
            </q-select>
            <q-select
              class="col-6"
              outlined
              v-model="user.shopId"
              emit-value
              label="门店"
              map-options
              v-show="this.$store.getters['user/userInfo'].type != 1"
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
          </q-card-section>
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat label="取消" v-close-popup />
            <q-btn
              color="primary"
              type="reset"
              v-if="dialogActiveName === '新增用户'"
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
              v-model.trim="searchForm.account"
              label="用户名"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
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
  </q-page>
</template>

<script>
import { date } from 'quasar'
import {
  getUserList,
  updatePassword,
  addUser,
  getUserById
} from 'src/api/userManage'
import { getShopOptions } from 'src/api/shopAndCustom'
// import useVuelidate from '@vuelidate/core'
// import { required } from '@vuelidate/validators'
export default {
  // setup() {
  //   return { v$: useVuelidate() }
  // },
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
          label: '姓名',
          align: 'left',
          field: 'name'
        },
        { name: 'account', label: '账号', align: 'center', field: 'account' },
        {
          name: 'type',
          label: '角色',
          align: 'center',
          field: 'type'
        },
        {
          name: 'status',
          label: '状态',
          align: 'center',
          field: 'status'
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
        'account',
        'type',
        'status',
        'gmtCreate',
        'gmtModified'
      ],
      tableLoading: false,
      searchForm: {
        page: 0,
        row: 0,
        account: '',
        name: '',
        userId: '',
        type: ''
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
      pwdInput: false,
      dialogActiveName: '',
      detailDialogLoading: false,
      user: {
        id: '',
        account: '',
        name: '',
        type: 2,
        shopId: '',
        status: '',
        password: '111111'
      },
      searchDetailOpened: false,
      roleOptions: [
        {
          label: '超级管理员',
          value: 1
        },
        {
          label: '普通管理员',
          value: 2
        }
      ],
      roleOptions2: [
        {
          label: '店员',
          value: 3
        }
      ],
      shopOptions: []
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
      getUserList(this.searchForm)
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
        Object.assign(this.user, this.$options.data.call(this).user)
        this.pwdInput = true
        this.user.id = ''
        this.dialogActiveName = '新增用户'
        if (this.$store.getters['user/userInfo'].type == 2) {
          this.user.type = 3
        }
        this.detailOpened = true
      } else {
        if (id == this.$store.getters['user/userInfo'].id) {
          this.notify('warning', '无法修改自身账号！')
          return
        }
        this.dialogActiveName = '修改用户'
        this.pwdInput = false
        getUserById(id)
          .then((response) => {
            Object.assign(this.user, response.data.data)
          })
          .catch((error) => {})
        this.detailOpened = true
      }
    },
    resetDetailDialog() {
      Object.assign(this.user, this.$options.data.call(this).user)
    },
    submitDetailDialog() {
      this.detailDialogLoading = true
      if (this.dialogActiveName == '新增用户') {
        if (this.user.password.length < 6) {
          this.notify('warning', '密码长度最小6位')
          this.detailDialogLoading = false
          return
        }
        this.user.status = 1
        this.user.isDel = 0
        this.user.parentId = this.$store.getters['user/userInfo'].id
      }
      addUser(this.user)
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
    calRole(type) {
      switch (type) {
        case 1:
          return '超级管理员'
        case 2:
          return '普通管理员'
        case 3:
          return '店员'
        default:
          return '游客'
      }
    },
    resetPassword(id, pwd) {
      this.$q
        .dialog({
          title: '确认框',
          message: '是否重置该用户密码为 111111',
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          updatePassword(id, pwd)
            .then((response) => {
              this.notify('positive', response.data.msg)
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
    }
  },
  mounted() {
    this.searchForm.userId = this.$store.getters['user/userInfo'].id
    this.searchForm.type = this.$store.getters['user/userInfo'].type
    this.request({
      pagination: this.serverPagination
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
