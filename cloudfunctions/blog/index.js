// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')
const db = cloud.database()
const blogCollection = db.collection('blog')
const blogCommentCollection = db.collection('blog-comment')
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  
  const app = new TcbRouter({
    event
  })

  app.router('list', async (ctx, next) => {
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
    let blogList = await blogCollection
      .where(w) // keyword 为空 w 也为空，where 语句就没有了筛选条件了。会全部返回
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then(res => res.data)
    ctx.body = blogList
  })

  app.router('detail', async (ctx, next) => {
    let blogId = event.blogId
    // 详情查询
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then(res => res.data)
    // 评论查询 
    const countResult = await blogCollection.count()
    const total = countResult.total
    let commentList = {
      data: []
    }
    if(total > 0) {
      const batchTimes = Math.ceil(total / MAX_LIMIT)
      const tasks = []
      for(let i = 0; i < batchTimes; i++) {
        let promise = blogCommentCollection
          .skip(i * MAX_LIMIT)
          .limit(MAX_LIMIT)
          .where({blogId})
          .orderBy('createTime', 'desc')
          .get()
        tasks.push(promise)
      }
      if(tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }
    }
    ctx.body = {
      commentList,
      detail
    }
  })

  return app.serve()
}