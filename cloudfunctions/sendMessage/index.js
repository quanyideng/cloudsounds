// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const result = await cloud.openapi.subscribeMessage.send({
    touser: OPENID,
    page: `pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data: {
      phrase1: {
        value: "评价完成"
      },
      thing2: {
        value: event.content
      }
    },
    templateId: "0HfOXm3rmASOX9lLY-T9JzxCmTZnkaHsgcKFRJ3wX1w"
  })
  return result
}