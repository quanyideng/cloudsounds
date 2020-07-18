const MAX_LIMIT = 10
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList: [],
    isNoMoreBlog: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getBlogList()
  },

  goComment(e) {
    wx.navigateTo({
      url: '../blog-comment/blog-comment?blogId=' + e.target.dataset.blogid,
    })
  },

  _getBlogList() {
    wx.showLoading({
      title: '加载中'
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'getListByOpenid',
        start: this.data.blogList.length,
        count: MAX_LIMIT
      }
    }).then(res => {
      
      let _blogList = res.result.data
      for (let i = 0; i < _blogList.length; i++) {
        _blogList[i].createTime = _blogList[i].createTime.toString()
      }
      // console.log(res)
      this.setData({
        blogList: this.data.blogList.concat(_blogList)
      })
      if(res.result.data.length < 10) {
        this.setData({
          isNoMoreBlog: true
        })
      }
      wx.hideLoading()
    })
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
    if(!this.data.isNoMoreBlog) {
      this._getBlogList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    const blog = event.target.dataset.blog
    return {
      title: blog.content,
      path: '/pages/blog-comment/blog-comment?blogId=' + blog._id
    }
  }
})