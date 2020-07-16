let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },

  externalClasses: [
    'iconfont',
    'icon-share',
    'icon-pinglun'
  ],

  /**
   * 组件的初始数据
   */
  data: {
    loginShow: false,
    content: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSend(event) {
      // 将评论内容插入数据库
      let blogId = this.properties.blogId
      let formId = event.detail.formId
      let content = event.detail.value.content
      if(content.trim() == '') {
        wx.showModal({
          title: '评论内容不能为空',
          content: ''
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        mask: true
      })
      db.collection('blog-comment')
        .add({
          data: {
            content,
            blogId,
            createTime: db.serverDate(),
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl
          }
        }).then(res => {
          // 推送模板信息
          // wx.requestSubscribeMessage({
          //   tmplIds: ['0HfOXm3rmASOX9lLY-T9JzxCmTZnkaHsgcKFRJ3wX1w'],
          //   success: (res) => { 
          //     console.log(res)
          //     wx.cloud.callFunction({
          //       name: "sendMessage", 
          //       data: {
          //         content,
          //         formId,
          //         blogId,
          //       }
          //     }).then(res => {
          //       console.log('res', res)
          //     })
          //   }
          // })
          
          wx.hideLoading()
          wx.showToast({
            title: '评论成功',
          })
          this.setData({
            modalShow: false,
            content: ''
          })
          // 通知父元素去刷新评论页面
          this.triggerEvent('refreshCommentList')
        })
    },
    onLoginSuccess(event) {
      userInfo = event.detail
      //授权框消失，评论框显示, 这两个过程是前后顺序，
      // 可以使用setData()的回调函数实现按顺序执行
      this.setData({
        loginShow: false,
      }, () => {
        this.setData({
          modalShow: true
        })
      })
    },
    onLoginFail() {
      wx.showModal({
        title: '只有授权的用户才能进行评价',
        content: ''
      })
    },
    onComment() {
      // 判断用户是否授权
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  modalShow: true
                })
              },
            })
          } else {
            // 没有授权就弹出授权框
            this.setData({
              loginShow: true
            })
          }
        },
      })
    }
  }
})
