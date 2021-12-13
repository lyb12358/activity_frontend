import { Notify } from 'quasar'
import { getStorageToken } from 'src/utils/storageControl'
export default ({ router, store, Vue }) => {
  const whiteList = ['/auth/login', '/auth/register']// no redirect whitelist
  router.beforeEach((to, from, next) => {
    if (getStorageToken()) { // determine if there has token
      /* has token*/
      if (to.path === '/auth/login') {
        next({ path: '/' })
      } else {
        if (store.getters['user/permissions'].length === 0) {
          store.dispatch('user/GetInfo').then(response => {
            const permissions = store.getters['user/permissions']
            if (to.meta.requiresAuth && (permissions.indexOf(1) < 0) && (permissions.indexOf(2) < 0)) {
              if (permissions.indexOf(to.meta.auth) > -1) {
                next()
              } else {
                Notify.create({
                  message: '权限不足，无法访问',
                  color: 'negative',
                  position: 'top-right'
                })
                next('/auth/login')
              }
            } else {
              next()
            }
          }).catch((error) => {
            store.dispatch('user/FedLogout').then(() => {
              Notify.create({
                message: '鉴权失败，请重新登录',
                color: 'negative',
                position: 'top-right'
              })
              next({ path: '/' })
            })
          })
        } else {
          const permissions = store.getters['user/permissions']
          if (to.meta.requiresAuth && (permissions.indexOf(1) < 0) && (permissions.indexOf(2) < 0)) {
            if (permissions.indexOf(to.meta.auth) > -1) {
              next()
            } else {
              Notify.create({
                message: '权限不足，无法访问',
                color: 'negative',
                position: 'top-right'
              })
              next('/auth/login')
            }
          } else {
            next()
          }
        }
      }
    } else {
      /* has no token*/
      if (whiteList.indexOf(to.path) > -1) {
        next()
      } else {
        next('/auth/login')
      }
    }
  })
}
