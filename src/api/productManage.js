import { service } from 'src/boot/axios'

//product
export function getActivityProductList(id) {
  return service({
    url: '/activity/product',
    method: 'get',
    params: { id }
  })
}

export function addActivityProduct(list) {
  return service({
    url: '/activity/product',
    method: 'post',
    data: list
  })
}
