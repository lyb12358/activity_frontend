import { service } from 'src/boot/axios'

//activity
export function getActivityList(searchForm) {
  return service({
    url: '/activities',
    method: 'post',
    data: searchForm
  })
}
//获取活动
export function getActivityById(id) {
  return service({
    url: '/activity/' + id,
    method: 'get'
  })
}
//添加/修改活动
export function addActivity(activity) {
  return service({
    url: '/activity',
    method: 'post',
    data: activity
  })
}
//music
export function getMusicList(searchForm) {
  return service({
    url: '/maintain/musics',
    method: 'post',
    data: searchForm
  })
}

//获取音乐
export function getMusicById(id) {
  return service({
    url: '/maintain/music/' + id,
    method: 'get'
  })
}
//添加/修改音乐
export function addMusic(music) {
  return service({
    url: '/maintain/music',
    method: 'post',
    data: music
  })
}

export function getMusicOptions() {
  return service({
    url: '/maintain/music/options',
    method: 'get'
  })
}
//更新详情图
export function updateDetailImage(id, detailImage) {
  return service({
    url: '/activity/detailImage',
    method: 'post',
    params: { id, detailImage }
  })
}
