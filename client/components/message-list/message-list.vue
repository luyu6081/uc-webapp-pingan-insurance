<template>
  <div class="message-list">
    <div class="filter flex">
      <div class="flex-1">
        <el-checkbox v-model="allChecked" class="select-all-ck mr17" v-show="showCheck"/>
        <el-button type="text" v-show="showCheck" @click="handleOperation(1, '')">设为已读</el-button>
        <el-button type="text" v-show="showCheck" @click="handleOperation(2, '')">删除</el-button>
      </div>
      <ej-search-input v-model="pmParams.keyword" :width="300" :height="32" placeholder="请输入检索信息" @search="handleSearch"/>
    </div>
    <div class="empty-wrap" v-if="noticeList.length === 0">暂无数据</div>
    <div class="list-wrap" v-else>
      <div v-for="(item, index) in noticeList" :key="index" class="list-item-box flex">
        <el-checkbox v-model="item.checked" class="select-all-ck mr20" v-show="showCheck"/>
        <a class="message-content" target="_blank" :href="redirectUrl(item)">
          <div class="flex justify-between">
            <div class="message-text">
              <span class="text-title">{{item.title}}{{item.appKey ? '：' : ''}}</span>
              <span class="text-system">{{getSystemNameOrAppKey(item.appKey)}}</span>
              <i class="message-tip" v-if="item.isReader"></i>
            </div>            
            <div class="message-date">{{item.createTime}}</div>
          </div>
          <div class="message-desc">
            {{item.objectDesc}}
          </div>
        </a>
      </div>
      <common-pagination
        :total="pmParams.total"
        :page-size="pmParams.limit"
        :current-page="pmParams.offset"
        @current-change="currentChange"
        v-if="ucType === 'Message'"/>
    </div>
  </div>
  
</template>

<script>
  import Vue from 'vue'
  import {
    Checkbox,
    Button,
    Message as ElMessage,
    MessageBox,
  } from 'element-ui'
  import {
    SearchInput,
    Loading,
  } from '@ej/ui'
  import Pagination from '@/components/pagination'
  import runtimeArgs from '@/runtime-args'
  import {formatDate} from '../../utils/date'
  import DELETE_MESSAGE_LIST from './graphql/private-delete.gql'
  import SET_READ_MESSAGE_LIST from './graphql/private-set-read.gql'
  Vue.use(Checkbox)
  Vue.use(Button)
  Vue.use(Pagination)
  Vue.use(SearchInput)
  Vue.use(Loading)
  export default {
    name: 'EjMessageList',
    props: {
      data: Array,
      total: Number,
      showCheck: Boolean,
      ucType: String,
    },
    data () {
      return {
        pmParams: {
          keyword: '',
          offset: 1,
          limit: 10,
          total: 0,
        },
        resultChecked: [],
        noticeList: [],
        originList: [],
      }
    },
    computed: {
      // 全选
      allChecked: {
        get () {
          return this.noticeList.length && this.noticeList.every(item => {
            return item.checked === true
          })
        },
        set (val) {
          this.noticeList.forEach(item => {
            this.setChecked(item, val)
          })
        },
      },
      // 选中的item
      checkedList () {
        return this.noticeList.filter(item => {
          return item.checked
        })
      },
      // 选中数
      checkedLen () {
        return this.checkedList.length
      },
    },
    watch: {
      checkedList: {
        deep: true,
        handler (newVal) {
          this.resultChecked = newVal
        },
      },
      data (val) {
        val.forEach(item => {
          // console.log(item)
          // let curMessage = item.message
          if (item.title === undefined) {
            item.title = item.content // item.title
          }
          item.createTime = formatDate(new Date(item.createTime), 'YYYY-MM-DD HH:mm')
          this.$set(item, 'checked', false)
        })
        this.noticeList = this.originList = val
      },
      total (val) {
        this.pmParams.total = val
      },
    },
    created () {
    },
    methods: {
      getSystemNameOrAppKey (key) {
        let curSName = ''
        switch (key) {
          case 'MDS':
            curSName = '元数据'
            break
          case 'DQS':
            curSName = '数据质量'
            break
          case 'DS':
            curSName = '数据标准'
            break
          case 'DRD': // sams
            curSName = '数据资源目录'
            break
          case 'D4A':
            curSName = '数据安全'
            break
          case '元数据':
            curSName = 'MDS'
            break
          case '数据质量':
            curSName = 'DQS'
            break
          case '数据标准':
            curSName = 'DS'
            break
          case '数据资源目录': // sams
            curSName = 'DRD'
            break
          case '数据安全':
            curSName = 'D4A'
            break
        }
        return curSName
      },
      redirectUrl (item) {
        let curUrl = '', messageField = item.message && item.message.indexOf('TaskId') >= 0 ? JSON.parse(item.message) : ''
        let curTaskId = messageField ? messageField.TaskId : ''
        // console.log(222, this.showCheck, curTaskId)
        switch (item.appKey) {
          case 'MDS':
            curUrl = `${runtimeArgs.NUXT_ENV_MDS_URL}#/detail/${item.objectId}`
            break
          case 'DQS':
            if (this.showCheck) {
              curUrl = `${runtimeArgs.NUXT_ENV_DQS_URL}rule/${item.objectId}`
            } else {
              if (curTaskId) {
                curUrl = `${runtimeArgs.NUXT_ENV_DQS_URL}issue/${curTaskId}`
              } else {
                // curUrl = `${process.env.NUXT_ENV_DQS_URL}rule/${item.objectId}`
              }
            }
            break
          case 'DS':
            curUrl = `${runtimeArgs.NUXT_ENV_DS_URL}`
            break
          case 'DRD': // sams
            curUrl = `${runtimeArgs.NUXT_ENV_SAMS_URL}`
            break
          case 'D4A':
            curUrl = `${runtimeArgs.NUXT_ENV_D4A_URL}#/public/authorizations`
            break
        }
        return curUrl
      },
      setReaderMessage (setParam) {
        this.$apollo.mutate({
          mutation: SET_READ_MESSAGE_LIST,
          client: 'mds',
          variables: {
            input: setParam,
          },
        }).then((data) => {
          if (data.data.data) {
            this.$emit('search', this.pmParams)
          } else {
            ElMessage.warning({message: '该消息项中包含“已读”项，请选择未读的消息项！'})
          }                    
        }).catch((error) => {
          ElMessage.error({message: error.message})
        })
      },
      deletePrivateMessage (delParam) {
        this.$apollo.mutate({
          mutation: DELETE_MESSAGE_LIST,
          client: 'mds',
          variables: {
            input: delParam,
          },
        }).then((data) => {
          if (data.data.data) {
            this.$emit('search', this.pmParams)
          } else {
            ElMessage.error({message: '操作失败'})
          }
        }).catch((error) => {
          ElMessage.error({message: error.message})
        })
      },
      setChecked (item, value) {
        this.$set(item, 'checked', value)
      },
      getlistKeys (list = [], key = 'id') {
        return list.map(item => {
          return item[key]
        })
      },

      getCheckedId () {
        return this.getlistKeys(this.checkedList, 'id')
      },
      handleSearch () {
        if (this.ucType !== 'Message') {
          let searchList = []
          let ss = this.getSystemNameOrAppKey(this.pmParams.keyword.toLowerCase())
          this.originList.forEach(item => {
            if (item.title.toLowerCase().indexOf(this.pmParams.keyword.toLowerCase()) >= 0) {
              searchList.push(item)
            } else if (item.appKey.toLowerCase().indexOf(this.pmParams.keyword.toLowerCase()) >= 0) {
              searchList.push(item)
            } else if (ss && item.appKey.toLowerCase().indexOf(ss) >= 0) {
              searchList.push(item)
            }
          })
          this.noticeList = searchList
        } else {
          this.$emit('search', this.pmParams)
        }
      },
      currentChange (val) {
        this.pmParams.offset = val
        this.$emit('search', this.pmParams)
      },
      handleOperation (oper, data) {
        let curGetChecks = this.checkedList.map(it => it.id)
        switch (oper) {
          case 1:
            // 已读
            if (!curGetChecks.length) {
              ElMessage.warning({message: '请选择要设为已读的消息项项！'})
              return
            } else {
              if (this.checkedList.some(item => item.isReader === false)) {
                ElMessage.warning({message: '该消息项中包含“已读”项，请选择未读的消息项！'})
              } else {
                MessageBox.confirm('是否把所选项设为已读？', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                }).then(() => {
                  this.setReaderMessage(curGetChecks)
                })
              }
            }            
            break
          case 2:
            // 删除
            if (!curGetChecks.length) {
              ElMessage.warning({message: '请选择要删除的消息项！'})
              return
            }
            MessageBox.confirm('是否删除所选项？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }).then(() => {
              this.deletePrivateMessage(curGetChecks)
            })
            break
        }
      },
    },
  }
</script>
<style lang="scss">
  .message-list {
    .mr20 {
      margin-right: 20px;
    }

    .mr17 {
      margin-right: 17px;
    }

    .dot {
      width: 6px;
      height: 6px;
      background-color: #477DE9;
    }

    .list-item-box {
      margin: 8px 24px;
      padding: 8px 15px;

      .message-content {
        color: #999999;
        font-size: 12px;
        flex: 1;
        // width: 450px;
        // overflow: hidden;
        // text-overflow: ellipsis;
        // white-space: nowrap;

        .message-text {
          .text-title {
            font-size: 14px;
            color: #333333;
          }
        }
      }

      .message-tip {
        display: inline-block;
        vertical-align: text-top;
        margin: 3px 0 0 6px;
        width: 6px;
        height: 6px;
        border-radius: 6px;
        background-color: #E6A23C;
      }

      .message-desc {
        font-size: 14px;
        color: #666666;
      }

      &:hover {
        background-color: #ECF2FC;

        .text-title {
          color: #477DE9 !important;
        }
      }
    }

    .el-pagination {
      @apply text-center;

      padding: 12px 5px;
    }
  }
</style>
