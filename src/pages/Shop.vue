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
            <q-td key="contact" :props="props">{{ props.row.contact }}</q-td>
            <q-td key="address" :props="props">{{ props.row.address }}</q-td>
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
          <div class="col-2 q-table__title">门店</div>
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
              v-model.trim="shop.name"
              label="名称"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || '名称不能为空']"
              ref="name"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-model.trim="shop.address"
              label="地址"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || '地址不能为空']"
              ref="address"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-map-marker" />
              </template>
            </q-input>
            <q-input
              class="col-6"
              outlined
              v-model.trim="shop.contact"
              label="联系电话"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || '联系电话不能为空']"
              ref="contact"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-phone" />
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat label="取消" v-close-popup />
            <q-btn
              color="primary"
              type="reset"
              v-if="dialogActiveName === '新增门店'"
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
  </q-page>
</template>

<script>
import { date } from 'quasar'
import { getShopList, addShop, getShopById } from 'src/api/shopAndCustom'
export default {
  data() {
    return {
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
          name: 'contact',
          label: '联系方式',
          align: 'center',
          field: 'contact'
        },
        {
          name: 'address',
          label: '地址',
          align: 'center',
          field: 'address'
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
        'contact',
        'address',
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
      serverData: [],
      //dialog
      detailOpened: false,
      dialogActiveName: '',
      detailDialogLoading: false,
      shop: {
        id: '',
        address: '',
        name: '',
        userId: '',
        contact: ''
      },
      searchDetailOpened: false
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
      getShopList(this.searchForm)
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
        Object.assign(this.shop, this.$options.data.call(this).shop)
        this.dialogActiveName = '新增门店'
        this.detailOpened = true
      } else {
        this.dialogActiveName = '修改门店'
        getShopById(id)
          .then((response) => {
            Object.assign(this.shop, response.data.data)
          })
          .catch((error) => {})
        this.detailOpened = true
      }
    },
    resetDetailDialog() {
      Object.assign(this.shop, this.$options.data.call(this).shop)
    },
    submitDetailDialog() {
      this.detailDialogLoading = true
      if (this.dialogActiveName == '新增门店') {
        this.shop.isDel = 0
        this.shop.userId = this.$store.getters['user/userInfo'].id
      }
      addShop(this.shop)
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
