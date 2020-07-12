let musiclist = []
// 当前正在播放歌曲的index
let nowPlayingIndex = 0
// 获取全局唯一的音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicid)
  },

  _loadMusicDetail(musicId) {
    let music = musiclist[nowPlayingIndex]
    console.log(music)
    wx.setNavigationBarTitle({
      title: music.name,
    })

    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })

    wx.showLoading({
      title: "歌曲加载中"
    })

    wx.cloud.callFunction({
      name: "music",
      data: {
        musicId,
        $url: 'musicUrl',
      }
    }).then(res => {
      // backgroundAudioManager.stop()
      // console.log(JSON.parse(res.result))
      let result = JSON.parse(res.result)
      backgroundAudioManager.src = result.data[0].url
      backgroundAudioManager.title = music.name
      backgroundAudioManager.coverImgUrl = music.al.picUrl
      backgroundAudioManager.singer = music.ar[0].name
      backgroundAudioManager.epname = music.al.name
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()
    })
  },

  togglePlaying() {
    if (this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }

    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  onPrev() {
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    backgroundAudioManager.stop()
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext() {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    backgroundAudioManager.stop()
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  }
})