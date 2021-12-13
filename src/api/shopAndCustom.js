import { service } from 'src/boot/axios'

//shop
export function getShopList(searchForm) {
  return service({
    url: '/shops',
    method: 'post',
    data: searchForm
  })
}

//获取门店
export function getShopById(id) {
  return service({
    url: '/shop/' + id,
    method: 'get'
  })
}
//添加/修改门店
export function addShop(shop) {
  return service({
    url: '/shop',
    method: 'post',
    data: shop
  })
}
export function getShopOptions(type, id) {
  return service({
    url: '/shop/options',
    method: 'get',
    params: { type, id }
  })
}
//custom
export function getCustomList(searchForm) {
  return service({
    url: '/customs',
    method: 'post',
    data: searchForm
  })
}

//获取客户
export function getCustomById(id) {
  return service({
    url: '/custom/' + id,
    method: 'get'
  })
}
//添加/修改客户
export function addCustom(custom) {
  return service({
    url: '/custom',
    method: 'post',
    data: custom
  })
}

//appointment
export function getAppointmentList(searchForm) {
  return service({
    url: '/appointments',
    method: 'post',
    data: searchForm
  })
}
//根据id核销
export function verifiedCodeById(code, userId, parentId) {
  return service({
    url: '/appointment/verify',
    method: 'get',
    params: { code, userId, parentId }
  })
}
