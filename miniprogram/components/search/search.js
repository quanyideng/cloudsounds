let keyword = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      value: "请输入关键字"
    }
  },
  // 接收外部传入的样式
  externalClasses: [
    'iconfont',
    'icon-sousuo',
    "icon-ai54"
  ],

  /**
   * 组件的初始数据
   */
  data: {
    showClearBtn: false,
    inputValue: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClear() {
      console.log('keyword')
      this.setData({
        inputValue: '',
        showClearBtn: false
      })
      keyword = ''
    },
    onInput(event) {
      keyword = event.detail.value
      if (keyword.trim() != '') {
        this.setData({
          showClearBtn: true
        })
      } else {
        this.setData({
          showClearBtn: false
        })
      }
    },
    onSearch() {
      // console.log(keyword)
      this.triggerEvent('search', {
        keyword
      })
    }
  }
})
