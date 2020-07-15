// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')
const db = cloud.database()
const blogCollection = db.collection('blog')

// 云函数入口函数
exports.main = async (event, context) => {
  const keyword = event.keyword
  let w = {}
  if (keyword.trim() != '') {
    w = {
      content: new db.RegExp({
        regexp: keyword,
        options: 'i' // i 表示 ignore ，忽略大小写
      })
    }
  }

  const app = new TcbRouter({
    event
  })

  app.router('list', async (ctx, next) => {
    let blogList = await blogCollection
      .where(w) // keyword 为空 w 也为空，where 语句就没有了筛选条件了。会全部返回
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then(res => res.data)
    ctx.body = blogList
  })

  return app.serve()
}