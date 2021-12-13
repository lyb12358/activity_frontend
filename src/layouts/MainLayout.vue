<template>
  <q-layout view="lHh LpR lFf">
    <q-header
      reveal
      :class="$q.dark.isActive ? 'header_dark' : 'header_normal'"
    >
      <q-toolbar>
        <q-btn
          @click="left = !left"
          flat
          round
          dense
          icon="menu"
          class="q-mr-sm"
        />
        <q-toolbar-title>{{ $route.meta.title }}</q-toolbar-title>
        <q-btn
          class="q-mr-xs"
          flat
          round
          @click="$q.dark.toggle()"
          :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"
        />
        <q-btn flat round dense icon="mdi-logout" @click="logout" />
      </q-toolbar>
    </q-header>
    <q-drawer
      class="left-navigation text-white"
      show-if-above
      v-model="left"
      side="left"
      elevated
    >
      <div
        class="full-height"
        :class="$q.dark.isActive ? 'drawer_dark' : 'drawer_normal'"
      >
        <div style="height: calc(100% - 117px); padding: 10px">
          <q-toolbar>
            <q-avatar>
              <img src="images/personal_logo.png" />
            </q-avatar>

            <q-toolbar-title>{{
              $store.getters['user/userInfo'].name
            }}</q-toolbar-title>
            <q-btn
              flat
              round
              dense
              icon="mdi-cog"
              @click="openPasswordDialog"
            />
          </q-toolbar>
          <hr />
          <q-scroll-area style="height: 100%">
            <q-list padding>
              <q-item
                active-class="tab-active"
                to="/index"
                exact
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="dashboard" />
                </q-item-section>
                <q-item-section> 主页 </q-item-section>
              </q-item>
              <q-item
                active-class="tab-active"
                to="/user"
                exact
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="mdi-account-group" />
                </q-item-section>
                <q-item-section> 用户管理 </q-item-section>
              </q-item>
              <q-item
                active-class="tab-active"
                to="/role"
                exact
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
                v-show="this.$store.getters['user/userInfo'].type == 1"
              >
                <q-item-section avatar>
                  <q-icon name="mdi-account-key" />
                </q-item-section>
                <q-item-section> 角色管理 </q-item-section>
              </q-item>
              <q-item
                active-class="tab-active"
                to="/shop"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="mdi-store" />
                </q-item-section>
                <q-item-section> 门店管理 </q-item-section>
              </q-item>
              <q-item
                active-class="tab-active"
                to="/activity"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="mdi-ticket" />
                </q-item-section>
                <q-item-section> 活动管理 </q-item-section>
              </q-item>
              <q-item
                active-class="tab-active"
                to="/appointment"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="mdi-ticket-confirmation" />
                </q-item-section>
                <q-item-section> 预约信息管理 </q-item-section>
              </q-item>
              <q-item
                active-class="tab-active"
                to="/custom"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="mdi-face-agent" />
                </q-item-section>
                <q-item-section> 客户管理 </q-item-section>
              </q-item>
              <q-item
                active-class="tab-active"
                to="/music"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="mdi-music" />
                </q-item-section>
                <q-item-section> 音乐管理 </q-item-section>
              </q-item>
              <q-item
                active-class="tab-active"
                to="/sysConfig"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
                v-show="this.$store.getters['user/userInfo'].type == 1"
              >
                <q-item-section avatar>
                  <q-icon name="mdi-cog" />
                </q-item-section>
                <q-item-section> 系统设置 </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </div>
      </div>
    </q-drawer>
    <q-page-container>
      <q-page class="row no-wrap">
        <div class="col">
          <div class="full-height">
            <q-scroll-area class="col q-pr-sm full-height" visible>
              <router-view />
            </q-scroll-area>
          </div>
        </div>
        <!-- update password -->
        <q-dialog v-model="passwordDialogopened" persistent>
          <q-card style="min-width: 350px">
            <q-form
              @submit="submitPasswordDialog"
              @reset="resetPasswordDialog"
              autocorrect="off"
              autocapitalize="off"
              autocomplete="off"
              spellcheck="false"
            >
              <q-card-section>
                <div class="text-h6">修改密码</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-input
                  dense
                  v-model="password.password1"
                  label="请输入新密码"
                  outlined
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length >= 6) || '不能为空,最小6位'
                  ]"
                  ><template v-slot:prepend>
                    <q-icon name="mdi-account" /> </template
                ></q-input>
                <q-input
                  dense
                  v-model="password.password2"
                  label="请再次输入新密码"
                  outlined
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length >= 6) || '不能为空,最小6位'
                  ]"
                  ><template v-slot:prepend>
                    <q-icon name="mdi-account" /> </template
                ></q-input>
              </q-card-section>

              <q-card-actions align="right" class="text-primary">
                <q-btn flat label="取消" v-close-popup />
                <q-btn color="primary" type="reset" label="重置" />
                <q-btn color="primary" type="submit" label="确定" />
              </q-card-actions>
            </q-form>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { updatePassword } from 'src/api/userManage'
export default {
  data() {
    return {
      left: false,
      passwordDialogopened: false,
      password: {
        password1: '',
        password2: ''
      }
    }
  },
  methods: {
    submitPasswordDialog() {
      if (this.password.password1 != this.password.password2) {
        this.notify('warning', '两次新密码必须相同')
        return
      }
      updatePassword(
        this.$store.getters['user/userInfo'].id,
        this.password.password1
      )
        .then((response) => {
          this.notify('positive', response.data.msg)
          this.passwordDialogopened = false
        })
        .catch((error) => {})
    },
    resetPasswordDialog() {
      this.password.password1 = ''
      this.password.password2 = ''
    },
    openPasswordDialog() {
      this.password.password1 = ''
      this.password.password2 = ''
      this.passwordDialogopened = true
    },
    notify(color, message) {
      this.$q.notify({
        position: 'top-right',
        message: message,
        color: color
      })
    },
    logout() {
      this.$q
        .dialog({
          title: '退出登录',
          message: '你确定要退出登录吗？',
          ok: '确定',
          cancel: '取消'
        })
        .onOk(() => {
          this.$store.dispatch('user/FedLogout').then(() => {
            this.$router.push('/auth/login')
            this.notify('warning', '已登出')
          })
        })
    }
  }
}
</script>

<style>
.q-drawer {
  background-image: url('http://pb.beyond-itservice.com/images/2021/12/09/lakecd7ba0c3e44a1fa3.jpg') !important;
  background-size: cover !important;
}

.drawer_normal {
  background-color: rgba(1, 1, 1, 0.75);
}

.drawer_dark {
  background-color: #010101f2;
}

.navigation-item {
  border-radius: 5px;
}

.tab-active {
  background-color: green;
}

body {
  background: #f1f1f1 !important;
}

.header_normal {
  background: linear-gradient(
    145deg,
    rgb(32, 106, 80) 15%,
    rgb(21, 57, 102) 70%
  );
}

.header_dark {
  background: linear-gradient(145deg, rgb(61, 14, 42) 15%, rgb(14, 43, 78) 70%);
}
</style>
