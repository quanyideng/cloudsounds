let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String
  },

  observers: {
    lyric(lrc) {
      // console.log('lrc', lrc)
      if(lrc == '暂无歌词') {
        this.setData({
          lrcList: [{
            lrc,
            time: 0
          }],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lrc)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0, //当前选中歌词的索引
    scrollTop: 0, // 滚动条滚动的高度
  },

  lifetimes: {
    ready() {
      // 不管什么手机的宽度，在小程序中，宽度都为750rpx, 也就是说都会750份
      wx.getSystemInfo({
        success(res) {
          // console.log(res)
          // 由 res.screenWidth / 750 计算出 1px
          // 在样式中一行歌词的高度为84，所以乘以84，计算出 一行歌词的高度
          lyricHeight = res.screenWidth / 750 * 84
        }
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime) {
      // console.log('currentTime', currentTime)
      let lrcList = this.data.lrcList
      if (lrcList.length == 0) {
        return
      }
      if(currentTime > lrcList[lrcList.length - 1].time) {
        if(this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      for(let i = 0; i < lrcList.length; i++) {
        if (currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i -1) * lyricHeight
          })
          break
        }
      }
    },
    _parseLyric(lyric) {
      // 以换行分割成数组
      let line = lyric.split('\n')
      let _lrcList = []
      line.forEach(elem => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if(time != null) {
          // 取出歌词
          let lrc = elem.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把时间转换成秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc: lrc,
            time: time2Seconds 
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})
