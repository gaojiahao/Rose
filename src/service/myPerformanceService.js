import $flyio from 'plugins/ajax';


// 获取我的工作日志信息
export let getMyJobLogCountInfo = (time) => {
    let data = {
      time: time
    };
    return $flyio.ajax({
        url:'/H_roleplay-si/ds/getMyJobLogCountInfo',
        data
    })
}

// 获取我的今日绩效
export let getTodayPerformance = () => {
  return $flyio.ajax({
      url:'/H_roleplay-si/ds/getTodayPerformance'
  })
}

// 获取我的本年累计绩效
export let getYearPerformance = () => {
  return $flyio.ajax({
      url:'/H_roleplay-si/ds/getYearPerformance'
  })
}

// 日、月、年的工时绩效查询
export let getPerformance = (time,val) => {
  let data = {
    time: time,
    val: val
  };
  return $flyio.ajax({
      url:'/H_roleplay-si/ds/getPerformance',
      data
  })
}
