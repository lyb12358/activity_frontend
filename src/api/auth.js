import { service } from 'src/boot/axios'

//auth
export function login(user) {
    return service({
        url: '/user/login',
        method: 'post',
        data: user
    })
}
export function getInfoByToken(token) {
    return service({
        url: '/user/info',
        method: 'get',
        params: { token }
    })
}
//auth deprecated
export function logout() {
    return service({
        url: '/user/logout',
        method: 'post'
    })
}

