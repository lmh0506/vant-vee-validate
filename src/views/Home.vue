<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <div style="width: 320px;margin: auto;">
      <van-cell-group>
        <ValidationObserver ref="form">
          <ValidationProvider name="用户名" :rules="{ required: true, max: 5 }" v-slot="{ errors }">
            <van-field
              v-model="username"
              label="用户名"
              placeholder="请输入用户名"
              :error-message="errors[0]"
            />
          </ValidationProvider>
          <ValidationProvider name="手机号" :rules="'required|phone'" v-slot="{ errors }">
            <van-field
              v-model="phone"
              label="手机号"
              placeholder="请输入手机号"
              :error-message="errors[0]"
            />
          </ValidationProvider>
          <ValidationProvider name="留言" :rules="{ required: true, max: 100 }" v-slot="{ errors }">
            <van-field
              v-model="message"
              rows="1"
              autosize
              label="留言"
              type="textarea"
              placeholder="请输入留言"
              :error-message="errors[0]"
            />
          </ValidationProvider>
          <van-button @click="test">click me</van-button>
        </ValidationObserver>
      </van-cell-group>
      <my-upload
        :files="files"
        @oversize="oversize"
        @deleteFile="deleteFile"
        @uploadSuccess="uploadSuccess"
        :beforeRead="beforeRead"></my-upload>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import { extend } from 'vee-validate'
import { required, max } from 'vee-validate/dist/rules'

export default {
  name: 'home',
  data () {
    return {
      username: '',
      phone: '',
      message: '',
      radio: 0,
      files: [
        {
          url: 'http://61.164.53.62:9080/7,4593337f4a'
        },
        {
          url: 'http://61.164.53.62:9080/7,4593337f4a'
        },
        {
          url: 'http://61.164.53.62:9080/7,4593337f4a'
        },
        {
          url: 'http://61.164.53.62:9080/7,4593337f4a'
        },
        {
          url: 'http://61.164.53.62:9080/7,4593337f4a'
        },
        {
          url: 'http://61.164.53.62:9080/7,4593337f4a'
        },
        {
          url: 'http://61.164.53.62:9080/7,4593337f4a'
        },
        {
          url: 'http://61.164.53.62:9080/7,4593337f4a'
        },
        {
          url: 'http://61.164.53.62:9080/7,4593337f4a'
        }
      ],
      rule: []
    }
  },
  mounted () {
    extend('required', {
      ...required,
      message: '{_field_}不能为空'
    })
    extend('max', {
      ...max,
      params: ['length'],
      message: '{_field_}长度不能超过{length}个字符'
    })

    extend('phone', {
      validate (value) {
        return !(/^1[3456789]\d{9}$/.test(value)) ? '手机号格式不正确' : ''
      }
    })
  },
  methods: {
    test () {
      this.$refs.form.validate().then(res => {
        console.log(res)
      })
    },
    deleteFile (index) {
      console.log(index)
      this.files.splice(index, 1)
    },
    uploadSuccess (res) {
      console.log(res)
      this.files.push({
        url: res.fileUrl
      })
    },
    beforeRead (file) {
      console.log(file)
      if (file.type !== 'image/jpeg') {
        this.$toast('请上传 jpg 格式图片')
        return false
      }

      return true
    },
    oversize (file) {
      console.log(file)
      this.$toast('文件大小过大')
    }
  },
  components: {
    HelloWorld,
    'my-upload': () => import('./MyUpload')
  }
}
</script>
