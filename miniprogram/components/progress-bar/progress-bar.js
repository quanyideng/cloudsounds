let movableAreaWidth = 0
let movableViewWidth = 0
const BackgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 // 当前的秒数
let duration = 0 //当前歌曲总时长，以秒为单位
let isMoving = false // 进度条是否在拖拽，如果在拖拽，onTimeUpdate事件也会触发，这会造成冲突
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: "00:00"
    },
    movableDis: 0,
    progress: 0
  },

  lifetimes: {
    ready() {
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      // console.log('event', event)
      // 处理拖动所导致的change
      if (event.detail.source === 'touch') {
        // 只是保存数值，不会向 setData 方法那样会更新视图
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
        // console.log('change', isMoving)
      }
    },
    onTouchEnd() {
      const currentTimeFmt = this._dataFormat(Math.floor(BackgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })
      // 播放指定时间处的声音
      BackgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
      // console.log('end', isMoving)
    },
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec(rect => {
        // console.log(rect)
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        // console.log(movableAreaWidth, movableViewWidth)
      })
    },
    _setTime() {
      duration = BackgroundAudioManager.duration
      // console.log(duration)
      const durationFmt = this._dataFormat(duration)
      // console.log(durationFmt)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    _dataFormat(sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    },
    _bindBGMEvent() {
      BackgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay')
      })
      BackgroundAudioManager.onStop(() => {
        console.log('onStop')
      })
      BackgroundAudioManager.onPause(() => {
        console.log('pause')
        this.triggerEvent('musicPause')
      })
      BackgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
      BackgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        // console.log(BackgroundAudioManager.duration)
        if (typeof BackgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })
      BackgroundAudioManager.onTimeUpdate(() => {
        // 优化：如果进度条没有在拖拽，就执行一下逻辑，否则会造成冲突
        if(!isMoving) {
          const currentTime = BackgroundAudioManager.currentTime
          const duration = BackgroundAudioManager.duration
          // 优化，节流事件。
          // 触发过于频繁，只需每一秒触发即可
          const sec = currentTime.toString().split('.')[0]
          if (sec != currentSec) {
            // console.log('currentTime', currentTime)
            const currentTimeFmt = this._dataFormat(currentTime)
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            currentSec = sec
            // 歌词联动
            this.triggerEvent('timeUpdate', {currentTime})
          }
        }
      })
      BackgroundAudioManager.onEnded(() => {
        console.log('onEnded')
        this.triggerEvent('musicEnd')
      })
      BackgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误：' + res.errCode
        })
      })
    }
  }
})
