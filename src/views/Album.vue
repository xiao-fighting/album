<template lang="pug">
  #album
    h1.text-center 我的相簿
    hr
    h2 檔案上傳
    br
    b-form(@submit="submit")
        b-form-file(
          v-model="file" :state="state"
          placeholder="選擇檔案或拖曳至此"
          drop-placeholder="將檔案拖曳至此"
          required
          browse-text="瀏覽"
          accept="image/*"
          @input="validateFile"
        )
        p.text-danger 僅支援 1MB 以下的圖片
        b-form-textarea(
          v-model="description"
          placeholder="相片說明"
          rows="3"
          max-rows="6"
          maxlength="200"
          @input="validateText"
          :state="textstate"
        )
        br
        b-button(type="submit" variant="primary") 上傳
    hr
    Photoswipe
        b-row
            b-col(cols="12" md="6" lg="3" v-for="(image, idx) in images" :key="idx")
                b-card
                    b-card-img(:src="image.src" v-pswp="image")
                    b-card-body
                      b-btn(v-if="image.edit" variant="danger" @click="cancel(image)" ) 取消
                      b-btn(v-else variant="success" @click="edit(image)") 編輯
                      b-btn(v-if="image.edit" variant="success" @click="update(image)") 更新
                      b-btn(v-else variant="danger" @click="del(image,idx)") 刪除
                      hr
                      pre(v-if="!image.edit") {{image.title}}
                      b-form-textarea(v-else v-model="image.model")
</template>

<script>
//  上面的註解
// 要使用 b-form-textarea 的話，不能用span(不會換行) 要用 pre (才會換行)
export default {
  name: 'album',
  data () {
    return {
      file: null,
      description: '',
      //  null不是成功也不是失敗
      state: null,
      textstate: null,
      images: []
    }
  },
  computed: {
    user () {
      return this.$store.getters.user
    }
  },
  methods: {
    validateFile () {
    //   console.log(this.file)
      if (this.file !== null) {
        if (this.file.size >= 1024 * 1024 || !this.file.type.includes('image')) {
          //   紅色外框
          this.state = false
          this.file = null
        } else {
          this.state = true
        }
      }
    },
    validateText () {
      if (this.description.length > 10) {
        this.textstate = false
      } else {
        this.textstate = true
      }
    },
    submit (event) {
      event.preventDefault()
      if (this.file === null || this.file.size >= 1024 * 1024 || !this.file.type.includes('image')) {
        alert('檔案格式不符')
      } else {
        //   FormData() form標籤裡面的資料
        // FormData 可以同時送出檔案和表單資料
        const fd = new FormData()
        fd.append('image', this.file)
        fd.append('description', this.description)

        // axios預設是送出json，所以要自己設定成 formdata
        this.axios.post(process.env.VUE_APP_APIURL + '/file', fd, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(response => {
        //   console.log(response.data)
          this.images.push(
            {
              title: this.description,
              src: process.env.VUE_APP_APIURL + '/file/' + response.data.name,
              _id: response.data._id,
              edit: false,
              model: response.data.name
            }
          )
          this.file = null
          this.description = ''
        }).catch(error => {
          alert(error.response.data.message)
        })
      }
    },
    edit (image) {
      image.edit = true
      image.model = image.title
    },
    update (image) {
      // patch 只更新一個欄位 與後臺有關
      this.axios.patch(process.env.VUE_APP_APIURL + '/file/' + image._id, { description: image.model })
        .then(response => {
          image.edit = false
          image.title = image.model
        })
        .catch(() => {
          alert('發生錯誤')
        })
    },
    cancel (image) {
      image.edit = false
      image.model = image.title
    },
    del (image, idx) {
      this.axios.delete(process.env.VUE_APP_APIURL + '/file/' + image._id)
        .then(response => {
          this.images.splice(idx, 1)
        })
        .catch(() => {
          alert('刪除發生錯誤')
        })
    }
  },
  mounted () {
    this.axios.get(process.env.VUE_APP_APIURL + '/album/' + this.user)
      .then(response => {
        console.log(response.data)
        this.images = response.data.result.map(d => {
          return {
            title: d.description,
            src: process.env.VUE_APP_APIURL + '/file/' + d.name,
            _id: d._id,
            edit: false,
            model: d.name
          }
        })
      })
      .catch(() => {
        // console.log(error)
        alert('發生錯誤')
      })
  }

}
// 前端要檔 格式不對的 & 檔案太大

</script>
