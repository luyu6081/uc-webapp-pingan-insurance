<template>
  <div class="user-aside" @mouseover="handleOver" @mouseout="handleOut">
    <i class="edit-icon el-icon-edit-outline" @click="handleModify" v-show="permissionCodes.includes('ucManager') && isShowEditIcon"></i>
    <el-form label-position="top" :model="formData" ref="formData" v-ej-loading="userInfo_loading">
      <el-form-item :label-width="formLabelWidth" prop="userAvatar" class="form-avatar">
        <el-upload
            class="avatar-uploader"
            v-ej-loading="is_avatar_uploading"
            :action="actionUrl"
            :data="{
              serviceId: 'auth',
              ttl: '-1',
            }"
            name="file"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="handleAvatarUpload"
            v-if="isModify">
          <img v-if="formData.userAvatar" :src="formData.userAvatar" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
        <div class="avatar-uploader avatar-static" v-else>
          <div class="el-upload el-upload--text">
            <img v-if="formData.userAvatar" :src="formData.userAvatar" class="avatar">
            <i v-else class="el-icon-plus1 avatar-uploader-icon"></i>
          </div>
        </div>
        <div class="user-name">{{formData.name}}</div>
        <div class="user-name gray">{{formData.username}}</div>
        <!-- <div class="user-name">{{formData.name}}（{{formData.username}}）</div> -->
      </el-form-item>
      <!-- <el-form-item label="" :label-width="formLabelWidth" prop="username">
        <ej-icon icon="user" :class="isModify ? 'edit-status mt9' : ''" />
        <el-input v-model="formData.username" v-if="isModify" />
        <div class="user-text" v-else>{{formData.username}}</div>      
      </el-form-item> -->
      <el-form-item label="" :label-width="formLabelWidth" prop="position">
        <i class="user-icon el-icon-collection-tag" :class="isModify ? 'edit-status mt9' : ''"></i>
        <el-input v-model="formData.position" v-if="isModify" />
        <div class="user-text" v-else>{{formData.position}}</div>      
      </el-form-item>
      <el-form-item label="" :label-width="formLabelWidth" prop="title">
        <ej-icon icon="idcard" :class="isModify ? 'edit-status mt9' : ''" />
        <el-input v-model="formData.title" v-if="isModify" />
        <div class="user-text" v-else>{{formData.title}}</div>      
      </el-form-item>
      <el-form-item label="" :label-width="formLabelWidth" prop="userAddress">
        <i class="user-icon el-icon-location-information" :class="isModify ? 'edit-status mt9' : ''"></i>
        <el-input v-model="formData.userAddress" v-if="isModify" />
        <div class="user-text" v-else>{{formData.userAddress}}</div>      
      </el-form-item>
      <el-form-item label="" :label-width="formLabelWidth" v-for="(item, index) in contactList" :key="index">
        <i class="user-icon el-icon-phone-outline" :class="isModify ? 'edit-status mt9' : ''" v-show="item.contact === 'FIXEDTELEPHONE'"></i>
        <i class="user-icon el-icon-mobile-phone" :class="isModify ? 'edit-status mt9' : ''" v-show="item.contact === 'MOBILEPHONE'"></i>
        <i class="user-icon el-icon-receiving" :class="isModify ? 'edit-status mt9' : ''" v-show="item.contact === 'FAXNUMBER'"></i>
        <i class="user-icon el-icon-message" :class="isModify ? 'edit-status mt9' : ''" v-show="item.contact === 'MAILBOX'"></i>
        <el-input v-model="item.information" v-if="isModify"/>
        <div class="user-text" v-else>{{item.information}}</div>
      </el-form-item>
      <el-form-item label="" :label-width="formLabelWidth" v-show="!isModify">
        <ej-icon icon="lock" />
        <div class="user-change-password" @click="changePassword">更改密码</div>      
      </el-form-item>
      <div class="footer" v-if="isModify">
        <el-button type="primary" @click="handleAsideSubmit('formData')">保存</el-button>
        <el-button @click="handleAsideCancel('formData')">取消</el-button>
      </div>
    </el-form>
    <div class="user-group">
      <div class="user-group-title">参加分组</div>
      <div class="user-group-list">
        <div class="group-item" v-for="(item, index) in groupList" :key="index">
          <ej-icon icon="idcard" />
          <div class="group-item-title">{{item.groupName}}</div>
        </div>
      </div>
    </div>
    <el-dialog class="dialogVisible"
      title="修改密码"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :show-close="false" width="584px">
      <el-form label-position="left" :model="formDataPs" :rules="formPsRules" ref="formDataPs">
        <el-form-item label="旧密码" :label-width="formLabelWidthPs" prop="originalPwd">
          <el-input v-model="formDataPs.originalPwd" show-password placeholder="旧密码"/>
        </el-form-item>
        <el-form-item label="新密码" :label-width="formLabelWidthPs" prop="newPwd">
          <el-input v-model="formDataPs.newPwd" show-password placeholder="新密码"/>
        </el-form-item>
        <el-form-item label="确认密码" :label-width="formLabelWidthPs" prop="confirmPassword">
          <el-input v-model="formDataPs.confirmPassword" show-password placeholder="确认密码"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel('formDataPs')">取消</el-button>
        <el-button type="primary" @click="handleSubmit('formDataPs')">保存</el-button>
      </div>
    </el-dialog>
  </div>
  
</template>

<script>
  import Vue from 'vue'
  import {
    Button,
    Col,
    Dialog,
    Form,
    FormItem,
    Input,
    Message as ElMessage,
    Row,
    Upload,
  } from 'element-ui'
  import {
    Icon,
    Loading,
  } from '@ej/ui'
  import runtimeArgs from '@/runtime-args'
  import USER_INFO from './graphql/user_info.gql'
  import DELETE_AMBRY_BY_ID from './graphql/delete_ambry_by_id.gql'
  import UPDATE_USER from './graphql/update_user.gql'
  import UPDATE_USER_PASSWORD from './graphql/update_user_password.gql'
  Vue.use(Button)
  Vue.use(Col)
  Vue.use(Dialog)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
  Vue.use(Icon)
  Vue.use(Row)
  Vue.use(Loading)
  Vue.use(Upload)
  // const upDownUrl  = process.env.NUXT_ENV_AUTH_FRONTIER_HTTP + 'fileDownload'
  // const upLoadUrl = process.env.NUXT_ENV_AUTH_FRONTIER_HTTP + 'filesUpload'
  const upDownUrl  = runtimeArgs.NUXT_ENV_AUTH_FRONTIER_HTTP + 'fileDownload'
  const upLoadUrl = runtimeArgs.NUXT_ENV_AUTH_FRONTIER_HTTP + 'filesUpload'
  export default {
    name: 'EjUserAside',
    data () {
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入新密码'))
        } else {
          if (this.formDataPs.confirmPassword !== '') {
            this.$refs.formDataPs.validateField('confirmPassword')
          }
          callback()
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请确认密码'))
        } else if (value !== this.formDataPs.newPwd) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      };
      return {
        permissionCodes: [],
        curUserId: '',
        isShowEditIcon: false,
        formLabelWidth: '',
        is_avatar_uploading: false,
        actionUrl: upLoadUrl,
        isModify: false,
        oldAvatarAambryId: '', // 头像id值，保存时需要用该id删除头像
        newAvatarAambryId: '',
        userInfo_loading: false,
        formData: {
          name: '',
          username: '',
          position: '',
          title: '',
          userAddress: '',
        },
        dialogVisible: false,
        formLabelWidthPs: '80px',
        formDataPs: {
          originalPwd: '',
          newPwd: '',
          confirmPassword: '',
        },
        formPsRules: {
          originalPwd: [
            {
              required: true,
              message: '请输入旧密码',
              trigger: 'blur',
            },
          ],
          newPwd: [
            {
              required: true,
              validator: validatePass,
              trigger: 'blur',
            },
          ],
          confirmPassword: [
            {
              required: true,
              validator: validatePass2,
              trigger: 'blur',
            },
          ],
        },
        contactList: [],
        groupList: [],
      }
    },
    computed: {
    },
    watch: {
    },
    created () {
      this.curUserId = this.$nuxt.$store.$app.state.me.id
      if (this.curUserId) {
        this.getUserInfoById()
      }
    },
    methods: {
      getUserInfoById () {
        this.$apollo.query({
          query: USER_INFO,
          fetchPolicy: 'network-only',
          client: 'auth',
          variables: {
            input: [this.curUserId],
          },
        }).then(respData => {
          let curUserInfo = respData.data.data[0]          
          this.permissionCodes = curUserInfo.permissionCodes
          let getCurAvatar = ''
          if (curUserInfo.userAvatar) {
            getCurAvatar = curUserInfo.userAvatar.indexOf('fileDownload') < 0 ? `${upDownUrl}?ambryId=${curUserInfo.userAvatar}&show=true` : curUserInfo.userAvatar
          } else {
            // getCurAvatar = 'http://5b0988e595225.cdn.sohucs.com/images/20170918/36341cb3b515496ca14bdf20c4dde876.jpeg'
          }
          // 机构名称值
          let oIds = []
          curUserInfo.organizations.forEach(item => {
            oIds.push(item.organizationId)
          })
          let rIds = []
          curUserInfo.roles.forEach(item => {
            rIds.push(item.id)
          })
          let gIds = []
          curUserInfo.groups.forEach(item => {
            gIds.push(item.id)
          })
          let pContacts = []
          let oContacts = []
          if (curUserInfo.userInfoVOS.length > 0) {
            curUserInfo.userInfoVOS.forEach(item => {
              if(item.isPrimary) {
                pContacts.push({
                  information: item.information,
                  contact: item.contact,
                  isPrimary: item.isPrimary,
                  infoDesc: item.infoDesc,
                })
              }
            })
            curUserInfo.userInfoVOS.forEach(item => {
              if(!item.isPrimary) {
                oContacts.push({
                  information: item.information,
                  contact: item.contact,
                  isPrimary: item.isPrimary,
                  infoDesc: item.infoDesc,
                })
              }
            })
            this.contactList = pContacts.concat(oContacts)
          } else {
            if (curUserInfo.phoneNumber) {
              this.contactList.push({
                information: curUserInfo.phoneNumber,
                contact: 'MOBILEPHONE',
                isPrimary: false,
                infoDesc: '',
              })
            }
            if (curUserInfo.email) {
              this.contactList.push({
                information: curUserInfo.email,
                contact: 'MAILBOX',
                isPrimary: false,
                infoDesc: '',
              })
            }
            if (curUserInfo.faxNumber) {
              this.contactList.push({
                information: curUserInfo.faxNumber,
                contact: 'FAXNUMBER',
                isPrimary: false,
                infoDesc: '',
              })
            }
            if (curUserInfo.fixedPhoneNumber) {
              this.contactList.push({
                information: curUserInfo.fixedPhoneNumber,
                contact: 'FIXEDTELEPHONE',
                isPrimary: false,
                infoDesc: '',
              })
            }
          }
          this.formData = {
            id: curUserInfo.userId,
            name: curUserInfo.name,
            userAvatar: getCurAvatar,
            username: curUserInfo.username,
            password: curUserInfo.password,
            roleIds: rIds,
            organizationIds: oIds,
            jobNumber: curUserInfo.jobNumber,
            position: curUserInfo.position,
            title: curUserInfo.title,
            userAddress: curUserInfo.userAddress,
          }
          this.oldAvatarAambryId = curUserInfo.userAvatar
          this.groupList = curUserInfo.groups
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      handleAvatarSuccess (file) {
        this.is_avatar_uploading = false
        if (file.errno === '106') {
          ElMessage.error({message: '上传头像失败'})
        } else {
          this.newAvatarAambryId = file[0].ambryId
          let getAmbryUrl = `${upDownUrl}?ambryId=${this.newAvatarAambryId}&show=true`
          this.formData.userAvatar = getAmbryUrl
          this.$refs['formData'].validateField('userAvatar')
        }
      },
      beforeAvatarUpload (file) {
        const isJPG = file.type === 'image/jpeg'
        const isPNG = file.type === 'image/png'
        const isGIF = file.type === 'image/gif'
        const isLt2M = file.size / 1024 / 1024 < 2
        let result = true
        if (!isJPG && !isPNG && !isGIF) {
          ElMessage.warning({message: '上传头像大小只能是PNG/JPG/JIF格式'})
          result = false
        }
        if (!isLt2M) {
          ElMessage.warning({message: '上传头像大小不能超过2MB'})
          result = false
        }
        return result
      },
      handleAvatarUpload (file) {
        if (this.beforeAvatarUpload(file)) {
          this.is_avatar_uploading = true
        }
        return this.beforeAvatarUpload(file)
      },
      changePassword () {
        this.formDataPs = {
          originalPwd: '',
          newPwd: '',
          confirmPassword: '',
        }
        this.dialogVisible = true
      },
      handleSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.updateUserPassword()
          }
        })
      },
      handleCancel(formName) {
        this.$refs[formName].resetFields()
        this.dialogVisible = false
      },
      handleOver () {
        this.isShowEditIcon = true
      },
      handleOut () {
        this.isShowEditIcon = false
      },
      handleModify () {
        this.isModify = true
      },
      handleAsideCancel () {
        this.isModify = false
        let getOldAmbryUrl = `${upDownUrl}?ambryId=${this.oldAvatarAambryId}&show=true`
        this.formData.userAvatar = getOldAmbryUrl
        this.newAvatarAambryId = ''
      },
      /* 保存之前，先删除头像 */
      async handleDeleteAmbryById () {
        await this.$apollo.mutate({
          mutation: DELETE_AMBRY_BY_ID,
          fetchPolicy: 'no-cache',
          client: 'auth',
          variables: {
            ambryId: this.oldAvatarAambryId,
          },
        })
      },
      // 修改密码
      updateUserPassword () {
        delete this.formDataPs.confirmPassword
        this.$apollo.mutate({
          mutation: UPDATE_USER_PASSWORD,
          client: 'auth',
          variables: {
            input: this.formDataPs,
          },
        }).then((data) => {
          if (data.data.data) {
            ElMessage.success('修改密码成功')
            this.dialogVisible = false
          } else {
            ElMessage.error('旧密码错误')
          }
        }).catch((error) => {
          ElMessage.error({message: error.message})
        })
      },
      // 编辑用户方法
      updateUser () {
        this.userInfo_loading = true
        // 修改用户更换头像
        if (this.newAvatarAambryId !== '' && (this.oldAvatarAambryId !== this.newAvatarAambryId)) {
          this.formData.userAvatar = this.newAvatarAambryId
        } else {
          this.formData.userAvatar = this.oldAvatarAambryId
        }
        this.formData.oauthUserInfos = this.contactList
        this.$apollo.mutate({
          mutation: UPDATE_USER,
          client: 'auth',
          variables: {
            input: this.formData,
          },
        }).then((data) => {
          // 如果有更换头像，则更新store->userInfo中的avatar头像值
          if (this.$nuxt.$store.$app.state.me.id === this.curUserId && this.newAvatarAambryId !== '' && this.oldAvatarAambryId !== this.newAvatarAambryId) {
            this.handleDeleteAmbryById()
            let getNewAmbryUrl = `${upDownUrl}?ambryId=${this.newAvatarAambryId}&show=true`
            this.formData.userAvatar = getNewAmbryUrl
            this.$nuxt.$store.$app.state.me.avatar = this.newAvatarAambryId // 更新顶部菜单用户头像值
            // 初始原始值
            this.oldAvatarAambryId = this.newAvatarAambryId
            this.newAvatarAambryId = ''
          } else {
            let curOldAmbryUrl = `${upDownUrl}?ambryId=${this.oldAvatarAambryId}&show=true`
            this.formData.userAvatar = curOldAmbryUrl
            this.newAvatarAambryId = ''
          }
          this.userInfo_loading = false
          this.isModify = false
        }).catch((error) => {
          this.userInfo_loading = false
          ElMessage.error({message: error.message})
        })
      },
      handleAsideSubmit(formName) {
        this.updateUser()
      },
    },
  }
</script>
<style lang="scss">
  .user-aside {
    position: relative;

    .mt9 {
      margin-top: 9px !important;
    }

    .edit-icon {
      font-size: 26px;
      color: #477DE9;
      cursor: pointer;
      position: absolute;
      right: 20px;
      top: 0;
      z-index: 1;
    }

    .el-form {
      padding-bottom: 15px;

      .el-form-item {
        // margin-bottom: 16px;
        margin: 0 25px 16px 25px;

        &.form-avatar {
          border-bottom: 1px solid #f4f4f4;
          padding: 0 0 15px 0;
          margin: 18px 0 16px 0;

          .user-name {
            @apply text-center;

            line-height: 17px;
            // height: 24px;
            color: #333333;
            word-break: break-all;

            &.gray {
              margin-top: 5px;
              color: #999999;
            }
          }
          .el-form-item__content {
            display: block;
            // justify-content: center;
          }
        }
      }

      .el-form-item__content {
        @apply flex; //  items-center

        .el-input__inner {
          height: 32px;
          border-radius: 4px;
        }

        .el-input__suffix {
          right: 15px;
        }
      }

      .footer {
        @apply text-center;

        .el-button {
          padding: 0;
          width: 64px;
          height: 32px;
        }
      }

      .ej-icon, .user-icon {
        color: #477DE9;
        width: 19px;
        height: 19px;
        margin: 3px 10px 0 0;
        // margin: 0 10px 0 0;
        font-size: 19px;

        &.edit-status {

        }
      }

      .user-text {
        width: 166px;
        line-height: 24px;
        // height: 24px;
        color: #333333;
        word-break: break-all;
      }

      .user-change-password {
        line-height: 24px;
        color: #477DE9;
        cursor: pointer;
      }
    }
    .user-group {
      padding: 0 25px;

      .user-group-title {
        font-size: 16px;
        color: #333333;
      }

      .group-item {
        @apply flex;
        margin-top: 16px;

      
        .ej-icon {
          width: 30px;
          height: 30px;
        }

        .group-item-title {
          margin-left: 9px;
          line-height: 30px;
          color: #333333;
        }
      }
    }

    .dialogVisible {
      .el-dialog__header {
        border-bottom: 1px solid #E8E8E8;
      }

      .el-button {
        padding: 0;
        width: 64px;
        height: 32px;
      }

      .el-dialog__body {

        .el-input__inner {
          width: 400px;
          height: 32px;
          border-radius: 4px;
        }
      }

      .el-dialog__footer {
        padding: 8px 20px;
        border-top: 1px solid #E8E8E8;
      }
    }
    .avatar-uploader {
      @apply text-center;

      .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .el-upload:hover {
        border-color: #409EFF;
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 80px;
        height: 80px;
        line-height: 80px;
        text-align: center;
      }

      .avatar {
        width: 80px;
        height: 80px;
        opacity: 1 !important;
        display: block;
      }

      &.avatar-static {
        .el-upload, img {
          cursor: default;
        }
      }
    }
  }  
</style>
