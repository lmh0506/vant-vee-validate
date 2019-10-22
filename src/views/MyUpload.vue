<template>
  <div class="my-upload-wrapper">
    <div class="my-img-wrapper" v-for="(file, index) in fileList" :key="index">
      <img class="my-img" :class="imgClass" :src="file.url" alt="">
      <div class="upload-mask" v-if="file.success">
        <van-icon class="success" name="checked" />
      </div>
      <div class="upload-mask" v-if="file.progress <= 100 && !file.success">
        <van-circle
          class="upload-progress"
          v-model="file.currentProgress"
          :rate="file.progress"
          :text="file.currentProgress + '%'"
          :speed="progressSpeed"
          :size="progressSize"
          :color="progressColor"
          :fill="progressFill"
          :layer-color="progressLayerColor"
          :stroke-width="progressStrokeWidth"
          :clockwise="progressClockwise"
        />
      </div>
      <van-icon @click="deleteFile(index)" class="close-btn" name="clear" />
    </div>
    <van-uploader
      v-if="isOverFileCount"
      :capture="capture"
      :accept="accept"
      :disabled="disabled"
      :max-size="maxSize"
      :upload-text="uploadText"
      :after-read="afterRead"
      :before-read="beforeRead"
      @oversize="oversize">
      <slot></slot>
    </van-uploader>
  </div>
</template>

<script>
import axios from 'axios'
import { FILE_UPLOAD } from '@/configs/config'
export default {
  name: 'MyUpload',
  props: {
    // 上传组件Props开始
    files: { // 已上传的文件列表
      type: Array,
      default () {
        return []
      }
    },
    imgClass: { // 上传后的图片样式
      type: String,
      default: ''
    },
    accept: { // 接受的文件类型
      type: String,
      default: 'image/*'
    },
    capture: { // 图片选取模式，可选值为camera(直接调起摄像头)
      type: String,
      default: ''
    },
    disabled: { // 是否禁用文件上传
      type: Boolean,
      default: false
    },
    beforeRead: { // 文件读取前的回调函数，返回false可终止文件读取，支持返回Promise
      type: Function,
      default () {
        return () => {}
      }
    },
    maxSize: { // 文件大小限制，单位为byte
      type: Number
    },
    maxCount: { // 文件上传数量限制
      type: Number
    },
    uploadText: { // 上传区域文字提示
      type: String
    },
    fileName: { // 上传文件时文件的参数名
      type: String,
      default: 'file'
    },
    data: { // 上传需要附加数据
      type: Object,
      default () {
        return {}
      }
    },
    timeout: {
      type: Number,
      default: 60000
    },
    // 上传组件Props结束

    // 进度条组件Props开始
    progressSpeed: { // 动画速度（单位为 rate/s）
      type: Number,
      default: 100
    },
    progressSize: { // 圆环直径，默认单位为 px
      type: [Number, String],
      default: 100
    },
    progressColor: { // 进度条颜色，传入对象格式可以定义渐变色
      type: [String, Object],
      default: '#1989fa'
    },
    progressLayerColor: { // 轨道颜色
      type: String,
      default: '#fff'
    },
    progressFill: { // 填充颜色
      type: String
    },
    progressStrokeWidth: { // 进度条宽度
      type: Number,
      default: 40
    },
    progressClockwise: { // 是否顺时针增加
      type: Boolean,
      default: true
    }
    // 进度条组件Props结束
  },
  data () {
    return {
      fileList: this.files.slice()
    }
  },
  computed: {
    // 是否超过最大数量
    isOverFileCount () {
      if (this.maxCount === undefined) {
        return true
      } else {
        return this.maxCount > this.files.length
      }
    }
  },
  methods: {
    async afterRead ({ file, content }) {
      let id = new Date().getTime()
      let source = axios.CancelToken.source()
      this.fileList.push({
        file,
        url: content,
        id,
        source,
        progress: 0,
        currentProgress: 0
      })

      let data = new FormData()
      data.append(this.fileName, file)
      for (let key in this.data) {
        data.append(key, this.data[key])
      }

      try {
        let res = await axios({
          method: 'post',
          url: FILE_UPLOAD,
          data,
          timeout: this.timeout,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          cancelToken: source.token, // 这里声明的cancelToken其实相当于是一个标记
          onUploadProgress: progressEvent => {
            if (progressEvent.lengthComputable) {
              // 属性lengthComputable主要表明总共需要完成的工作量和已经完成的工作是否可以被测量
              // 如果lengthComputable为false，就获取不到progressEvent.total和progressEvent.loaded
              let index = this.getFileIndex(id)
              this.$set(this.fileList[index], 'progress', parseInt(progressEvent.loaded / progressEvent.total * 100))
            }
          }
        })

        if (res.data.success) {
          let index = this.getFileIndex(id)

          this.$set(this.fileList[index], 'success', true)
          this.$emit('uploadSuccess', res.data.data)
        } else {
          this.$toast.fail('上传出错了')
        }
      } catch (e) {
        console.log(e)

        if (axios.isCancel(e)) {
          this.$toast('取消上传')
        } else if (e.code === 'ECONNABORTED' && e.message.indexOf('timeout') !== -1) {
          this.$toast('请求超时')
          let index = this.getFileIndex(id)
          this.fileList.splice(index, 1)
        } else {
          let index = this.getFileIndex(id)
          this.fileList.splice(index, 1)
          this.$toast.fail('服务器出错了')
        }
      }
    },
    deleteFile (index) {
      let source = this.fileList[index].source
      source && source.cancel('取消上传')
      // 删除 上传成功或者是已上传的文件时
      if (this.fileList[index].success || !source) {
        this.$emit('deleteFile', index, this.fileList[index])
      }
      this.fileList.splice(index, 1)
    },
    getFileIndex (id) {
      return this.fileList.findIndex(file => file.id === id)
    },
    oversize (file) {
      this.$emit('oversize', file)
    }
  }
}
</script>

<style lang="css" scoped>
  .my-upload-wrapper{
    display: flex;
    flex-wrap: wrap;
  }
  .my-img{
    display: block;
    border-radius: 5px;
    width: 80px;
    height: 80px;
  }
  .my-img-wrapper{
    position: relative;
    margin: 0 8px 8px 0;
  }
  .close-btn{
    position: absolute;
    top: -8px;
    right: -8px;
    color: #969799;
    font-size: 18px;
    background-color: #fff;
    border-radius: 100%;
  }
  .upload-mask{
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: rgba(0, 0, 0, .5);
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .success{
    color: #07c160;
  }
</style>
<style lang="css">
  .my-upload-wrapper .upload-progress .van-circle__text{
    color: #fff;
  }
</style>
