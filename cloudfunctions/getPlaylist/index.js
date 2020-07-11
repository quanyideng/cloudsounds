// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取得数据条数有限
  // 小程序端最多20条
  // 服务端是100条
  // const list = await playlistCollection.get()
  const { total } = await playlistCollection.count()
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for(let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }

  let list = {
    data: []
  }

  if(tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }


  const playlist = await rp(URL).then(res => JSON.parse(res).result)
  // 去重处理，从服务端请求会得数据与数据库里得数据相比较，相同则去重，只插入不同的数据
  const newData = []
  for(let i = 0; i < playlist.length; i++) {
    let flag = true
    for(let j = 0; j < list.data.length; j++) {
      if(playlist[i].id === list.data[j].id){
        flag = false
        break
      }
    }
    if(flag) {
      newData.push(playlist[i])
    }
  }

  for(let i = 0; i < newData.length; i++) {
    playlistCollection.add({
      data: {
        ...newData[i],
        createTime: db.serverDate()
      }
    }).then(res => {
      console.log('insert successfully')
    }).catch(err => {
      console.error('failed to insert')
    })
  }

  return newData.length
}