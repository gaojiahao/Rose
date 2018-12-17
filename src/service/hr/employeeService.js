
import $flyio from 'plugins/ajax';

// 获取 所有部门列表
export let getAllGroup = () => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getAllGroup',
    data: {
      page: 1,
      start: 0,
      limit: 1000
    }
  })
}
// 获取所有岗位列表
export let getAllRoleInfo = () => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getAllRoleInfo',
    data: {
      page: 1,
      start: 0,
      limit: 1000
    }
  })
}
export let getDepartMentWage = () => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getDepartMentWage',
    data: {
      page: 1,
      start: 0,
      limit: 1000
    }
  })
}


export default {
  getAllGroup,
  getAllRoleInfo

}
