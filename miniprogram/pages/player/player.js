let musiclist = []
// 当前正在播放歌曲的index
let nowPlayingIndex = 0
// 获取全局唯一的音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false,
    isLyricShow: false,
    lyric: '',
    isSame: false, // 表示是否为同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicid)
  },

  _loadMusicDetail(musicId) {
    if(musicId == app.getPlayMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    let music = musiclist[nowPlayingIndex]
    // console.log(music)
    wx.setNavigationBarTitle({
      title: music.name,
    })

    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })
    app.setPlayMusicId(musicId)
    if(!this.data.isSame) {
      wx.showLoading({
        title: "歌曲加载中"
      })
    }

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
      if(result.data[0].url == null) {
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if(!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name
      }
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()
      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric'
        }
      }).then(res => {
        // console.log('res', JSON.parse(res.result))
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        // console.log('lrc', lrc)
        if(lrc) {
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
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
  },
  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  timeUpdate(e) {
    // 调用 x-lyric 组件内部的 update 方法来更新 currentTime
    this.selectComponent('.lyric').update(e.detail.currentTime)
  },
  onPlay() {
    this.setData({
      isPlaying: true
    })
  },
  onPause() {
    this.setData({
      isPlaying: false
    })
  }
})