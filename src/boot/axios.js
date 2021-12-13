import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify, Dialog } from 'quasar'
import { getStorageToken } from 'src/utils/storageControl'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const service = axios.create({ baseURL: process.env.API })
export default boot(({ app, store }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  // request interceptors
  service.interceptors.request.use(
    (config) => {
      if (store.getters['user/token']) {
        config.headers['activityToken'] = getStorageToken()
      }
      return config
    },
    (error) => {
      console.log(2)
      // Do something with request error
      console.log(error) // for debug
      Promise.reject(error)
    }
  )

  // respone interceptors
  service.interceptors.response.use(
    (response) => {
      const res = response.data
      if (res.code && res.code !== 20000) {
        Notify.create({
          message: res.msg,
          color: 'negative',
          position: 'top-right'
        })

        if (res.code === 50000 || res.code === 50001 || res.code === 50002) {
          Dialog.create({
            title: '重新登录',
            message: '你已被登出，可以取消继续留在该页面，或者重新登录',
            ok: '重新登录',
            cancel: '取消'
          }).onOk(() => {
            store.dispatch('user/FedLogout').then(() => {
              location.reload() // 为了重新实例化vue-router对象 避免bug
            })
          })
        }
        return Promise.reject('error')
      } else {
        return response
      }
    },
    (error) => {
      console.log('err' + error) // for debug
      Notify.create({
        message: '网络异常，请联系信息中心运维部！',
        color: 'negative',
        position: 'top-right'
      })
      return Promise.reject(error)
    }
  )
  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = service
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { service }
