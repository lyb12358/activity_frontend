import { login, logout, getInfoByToken } from 'src/api/auth'
import { LocalStorage, SessionStorage } from 'quasar'

const TokenKey = 'activityToken'

//token
export function getStorageToken() {
  return SessionStorage.getItem(TokenKey)
}

export function setStorageToken(token) {
  return SessionStorage.set(TokenKey, token)
}

export function removeStorageToken() {
  return SessionStorage.remove(TokenKey)
}

export function removeStorageAll() {
  return SessionStorage.clear()
}
