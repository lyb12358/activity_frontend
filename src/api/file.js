import { service } from 'src/boot/axios'

//添加/修改设置
export function appointmentExport(searchForm) {
  return service({
    url: '/excel/appointment',
    method: 'post',
    responseType: 'blob',
    data: searchForm
  })
}
