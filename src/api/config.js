import { service } from 'src/boot/axios'

//获取设置
export function getConfigById(id) {
  return service({
    url: '/config/' + id,
    method: 'get'
  })
}
//添加/修改设置
export function addConfig(config) {
  return service({
    url: '/config',
    method: 'post',
    data: config
  })
}
