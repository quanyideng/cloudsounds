let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false,
    blogList: [],
    isNoMoreBlog: false
  },

  onPublish() {
    // 判断用户是否授权
    wx.getSetting({
      success: (res) => {
        // console.log(res)
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              console.log(res)
              this.onLoginSuccess(res.userInfo)
            }
          })
        } else {
          this.setData({
            modalShow: true
          })
        }
      }
    })
  },

  onLoginSuccess(userInfo) {
    console.log(userInfo)
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${userInfo.nickName}&avatarUrl=${userInfo.avatarUrl}`
    })
  },

  onLoginFail() {
    wx.showModal({
      title: '授权的用户才能发布博客',
      content: ""
    })
  },

  _loadBlogList(start = 0) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    wx.cloud.callFunction({
      name: "blog",
      data: {
        keyword,
        start,
        count: 10,
        $url: "list",
      }
    }).then(res => {
      // 如果这次请求的结果不够十条，那么下一次请求的结果肯定为零，
      // 随意在这里更新 isNoMoreBlog
      if(res.result.length < 10) {
        this.setData({
          isNoMoreBlog: true
        })
      }
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
    })
  },

  _refreshPage() {
    this.setData({
      blogList: [],
      isNoMoreBlog: false
    })
    this._loadBlogList()
  },

  goComment(e) {
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId=' + e.target.dataset.blogid,
    })
  },

  onSearch(event) {
    // console.log(event.detail.keyword)
    this.setData({
      blogList: [],
      isNoMoreBlog: false
    })
    keyword = event.detail.keyword
    this._loadBlogList(0)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this._refreshPage()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(!this.data.isNoMoreBlog) {
      this._loadBlogList(this.data.blogList.length)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    // console.log(e)
    let blogObj = e.target.dataset.blog
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
    }
  }
})