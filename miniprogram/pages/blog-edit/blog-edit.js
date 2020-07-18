const MAX_WORDS_NUM = 140
const MAX_IMG_NUM = 9
const db = wx.cloud.database()
// 输入的文字内容
let content = ''
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    wordsNum: 0,
    footerBottom: 0,
    images: [],
    selectPhoto: true,
  },

  onInput(e) {
    this.data.content = e.detail.value
    let wordsNum = e.detail.value.length
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
  },

  onFocus(e) {
    // console.log(e)
    // 获取键盘高度
    this.setData({
      footerBottom: e.detail.height
    })
  },

  onBlur(e) {
    this.setData({
      footerBottom: 0
    })
  },

  onChooseImage() {
    // 还能再选几张图片
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      }
    })
  },

  send() {
    if(this.data.content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: ''
      })
      return 
    }
    wx.showLoading({
      title: '发布中...',
      mask: true
    })
    let promiseArr = []
    let fileIds = []
    for (let i = 0; i < this.data.images.length; i++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            console.log('fileID', res.fileID)
            fileIds = fileIds.concat(res.fileID)
            resolve(res)
          },
          fail: (err) => {
            // console.log('err', err)
            reject(err)
          }
        })
      })
      promiseArr.push(p)
    }
    Promise.all(promiseArr)
    .then(res => {
      db.collection('blog').add({
        data: {
          content:this.data.content,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          img: fileIds,
          createTime: db.serverDate(),// 服务端的时间
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        // 返回 blog 页面并刷新
        wx.navigateBack()
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        prevPage._refreshPage()
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },

  deletePhoto (e) {
    // splice 会改变原数组，并且以数组的形式返回被删除的元素
    this.data.images.splice(e.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length === 0 || this.data.images.length === MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true
      })
    }
  },

  onPreviewImage(e) {
    wx.previewImage({
      urls: this.data.images,
      current: e.target.dataset.imgsrc
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    userInfo = options
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