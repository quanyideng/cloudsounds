// miniprogram/pages/blog/blog.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modelShow: false,
    blogList: []
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
            modelShow: true
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

  _loadBlogList() {
    wx.cloud.callFunction({
      name: "blog",
      data: {
        $url: "list",
        start: 0,
        count: 10
      }
    }).then(res => {
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
    })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})