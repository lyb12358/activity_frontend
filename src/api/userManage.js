import { service } from 'src/boot/axios'

//user
export function getUserList(searchForm) {
    return service({
        url: '/users',
        method: 'post',
        data: searchForm
    })
}
// 修改密码
export function updatePassword(id, password) {
    return service({
        url: '/user/' + id + '/newPassword/' + password,
        method: 'get'
    })
}
//获取用户
export function getUserById(id) {
    return service({
        url: '/user/' + id,
        method: 'get'
    })
}
//添加/修改用户
export function addUser(user) {
    return service({
        url: '/user',
        method: 'post',
        data: user
    })
}
//role
export function getRoleList(searchForm) {
    return service({
        url: '/roles',
        method: 'post',
        data: searchForm
    })
}
// 添加角色
export function addRole(role) {
    return service({
        url: '/role',
        method: 'post',
        data: role
    })
}
// 修改角色
export function updateRole(role) {
    return service({
        url: '/role',
        method: 'put',
        data: role
    })
}
// 获取角色options
export function getRoleOptions() {
    return service({
        url: '/roles/options',
        method: 'get'
    })
}
// user role
// 获取用户拥有的角色
export function getUserRole(id) {
    return service({
        url: '/userRole/' + id,
        method: 'get'
    })
}
// 批量更新用户拥有的角色
export function updateUserRole(id, list) {
    return service({
        url: '/userRole/' + id,
        method: 'post',
        data: list
    })
}
// role permission
// 获取角色拥有的权限
export function getRolePermission(id) {
    return service({
        url: '/rolePermission/' + id,
        method: 'get'
    })
}
// 批量更新角色拥有的权限
export function updateRolePermission(id, list) {
    return service({
        url: '/rolePermission/' + id,
        method: 'post',
        data: list
    })
}
//permission
//获取所有权限
export function getStaticPermissionList(id) {
    return service({
        url: '/permissions/' + id,
        method: 'get'
    })
}