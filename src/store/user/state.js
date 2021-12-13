import { getStorageToken } from 'src/utils/storageControl'
export default function () {
  return {
    token: getStorageToken(),
    userInfo: {},
    permissions: []
  }
}
