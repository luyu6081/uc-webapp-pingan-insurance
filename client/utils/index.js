export function setLocalStorage (key, value) {
  window.localStorage[key] = JSON.stringify(value)
}

export function getLocalStorage (key) {
  return JSON.parse(window.localStorage[key] || null)
}

export function formatTime (time, format) {
  if (!time) {
    return ''
  }
  if (typeof time === 'string') {
    time = time.toString().replace(/-/g, '/') // ios下new Date(2016-10-31)报错:invalid date...要改为: 2016/10/31样式
  }
  if (typeof time === 'number' && (time.toString().length) === 10) {
    time = parseInt(time + '000')
  }
  // 过去
  let stamp = new Date(time)
  let cur = new Date()
  let year = stamp.getFullYear()
  let month = (stamp.getMonth() + 1) > 9 ? (stamp.getMonth() + 1) : '0' + (stamp.getMonth() + 1)
  let day = stamp.getDate() > 9 ? stamp.getDate() : '0' + stamp.getDate()
  let hour = stamp.getHours() > 9 ? stamp.getHours() : '0' + stamp.getHours()
  let minute = stamp.getMinutes() > 9 ? stamp.getMinutes() : '0' + stamp.getMinutes()
  let sec = stamp.getSeconds() > 9 ? stamp.getSeconds() : '0' + stamp.getSeconds()
  let ms = stamp.getMilliseconds() < 100 ? '0' + (stamp.getMilliseconds() < 10 ? '0' + stamp.getMilliseconds() : stamp.getMilliseconds()) : stamp.getMilliseconds()
  let weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  let week = weeks[stamp.getDay()]
  if (format) {
    format = format.replace('yyyy', year)
    format = format.replace('MM', month)
    format = format.replace('dd', day)
    format = format.replace('hh', hour)
    format = format.replace('mm', minute)
    format = format.replace('ss', sec)
    format = format.replace('ms', ms)

    if (year === cur.getFullYear() && stamp.getMonth() === cur.getMonth() && stamp.getDate() === cur.getDate()) {
      week = '今天'
    }
    format = format.replace('week', week)
  } else {
    format = year + '-' + month + '-' + day + ' ' + hour + ':' + minute
  }

  return format
}
/*
options = {
  id: 'organizationId',
  parentId: 'parentId',
  name: 'organizationName',
  rootId: '0',
}
*/
export function toTreeData (data, attributes) {
  let resData = data
  let tree = []

  for (let i = 0; i < resData.length; i++) {
    if (resData[i][attributes.parentId] === attributes.rootId) {
      let obj = {
        id: resData[i][attributes.id],
        title: resData[i][attributes.name],
        children: [],
      }
      tree.push(obj)
      resData.splice(i, 1)
      i--
    }
  }
  run(tree)
  function run (chiArr) {
    if (resData.length !== 0) {
      for (let i = 0; i < chiArr.length; i++) {
        for (let j = 0; j < resData.length; j++) {
          if (chiArr[i].id === resData[j][attributes.parentId]) {
            let obj = {
              id: resData[j][attributes.id],
              title: resData[j][attributes.name],
              children: [],
            }
            chiArr[i].children.push(obj)
            resData.splice(j, 1)
            j--
          }
        }
        run(chiArr[i].children)
      }
    }
  }

  return tree
}
