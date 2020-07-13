<template>
  <div class="user-content">
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="收藏" name="Collection">
        <ej-collection-order-list v-ej-loading="loading" :coParams="coParams" :data="collectionList" @search="search"></ej-collection-order-list>
      </el-tab-pane>
      <el-tab-pane label="订阅" name="Subscribe">
        <ej-collection-order-list v-ej-loading="loading" :coParams="coParams" :data="collectionList" @search="search"></ej-collection-order-list>
      </el-tab-pane>
      <el-tab-pane label="通知" name="Notification">
        <ej-message-list v-ej-loading="loading" :data="noticeList" :showCheck="true" :ucType="activeName" @search="search"/>
      </el-tab-pane>
      <el-tab-pane label="消息" name="Message">
        <ej-message-list v-ej-loading="loading" :data="privateMessageList" :total="totalVal" :ucType="activeName" :showCheck="true" @search="search"/>
      </el-tab-pane>
      <el-tab-pane label="待办" name="Todo">
        <ej-message-list v-ej-loading="loading" :data="toDoList" :showCheck="false" :ucType="activeName" @search="search"/>
      </el-tab-pane>
    </el-tabs>
  </div>
  
</template>

<script>
  import Vue from 'vue'
  import {
    Tabs,
    TabPane,
    Message as ElMessage,
  } from 'element-ui'
  import {
    Icon,
    Loading,
  } from '@ej/ui'
  import EjCollectionOrderList from '../collection-order-list/collection-order-list.vue'
  import EjMessageList from '../message-list/message-list.vue'
  import COLLECTION_ORDER_LIST from './graphql/collection-list.gql'
  import NOTICE_LIST from './graphql/notice-list.gql'
  import PRIVATE_MESSAGE_LIST from './graphql/private-message-list.gql'
  import runtimeArgs from '@/runtime-args'
  import {formatDate} from '../../utils/date'
  Vue.use(Tabs)
  Vue.use(TabPane)
  Vue.use(Icon)
  Vue.use(Loading)
  /** 下载地址 */
  const downloadUrl  = runtimeArgs.NUXT_ENV_AUTH_FRONTIER_HTTP
  // const downloadUrl = process.env.NUXT_ENV_DOWNLOAD
  export default {
    name: 'EjUserContent',
    components: {
      EjCollectionOrderList,
      EjMessageList,
      // ElMessage,
    },
    data () {
      return {
        loading: false,
        activeName: 'Collection',
        // 收藏/订阅数据
        coParams: {
          collectTypeEnum: 'COLLECT', // SUBSCRIBE 订阅
          appKeyEnum: 'MDS',
          // keyword: '',
          // isCondition: false,
          // objectType: '',
          // limit: 20,
          // offset: 1,
        },
        noticeParams: {
          collectTypeEnum: 'SUBSCRIBE',
          limit: 1,
          offset: 1,
        },
        pmParams: {
          keyword: '',
          offset: 1,
          limit: 10,
        },
        // dataList: [],
        subscribeList: [],
        collectionList: [],
        privateMessageList: [], // 私信值
        toDoList: [],
        totalVal: 0,
        noticeList: [],
      }
    },

    created () {
      let curNotificationType = this.$route.query.NotificationType
      if (curNotificationType) {
        this.activeName = curNotificationType
      }
      this.getCollectionList()
    },

    mounted () {
    },

    methods: {
      getCollectionList () {
        this.collectionList = []
        this.loading = true
        this.$apollo.query({
          query: COLLECTION_ORDER_LIST,
          fetchPolicy: 'network-only',
          client: 'mds',
          variables: {
            input: Object.assign({}, this.coParams),
          },
        }).then(respData => {
          let data = respData.data.data
          const _avatarUrl = `${downloadUrl}fileDownload?ambryId=`
          data.forEach(item => {
            if (this.coParams.appKeyEnum === 'MDS') {
              item.id = item.mdsObjectVo.id
              item.name = item.mdsObjectVo.chineseName ? item.mdsObjectVo.name + '(' + item.mdsObjectVo.chineseName + ')' : item.mdsObjectVo.name
              item.description = item.mdsObjectVo.description
              item.belongSystem = item.mdsObjectVo.belongSystem
              item.assetsLevel = item.mdsObjectVo.assetsLevel
              item.d4aSafetyRank = item.mdsObjectVo.d4aSafetyRank
              item.dateTm = formatDate(new Date(item.mdsObjectVo.createTm), 'YYYY-MM-DD')
              item.tags = item.mdsObjectVo.tags
              let curBusiLinkman = item.mdsObjectVo.busiLinkman
              if (curBusiLinkman) {
                item.busiLinkmanCardData = {
                  userId: curBusiLinkman.id,
                  name: curBusiLinkman.name,
                  position: curBusiLinkman.position,
                  userAvatar: curBusiLinkman.avatar ? _avatarUrl + curBusiLinkman.avatar : '',
                  jobNumber: curBusiLinkman.jobNumber,
                  phone: curBusiLinkman.phone,
                  telephone: curBusiLinkman.telephone,
                  email: curBusiLinkman.email,
                  department: curBusiLinkman.depts,
                  userAddress: curBusiLinkman.address,
                }
              }
              let curTechLinkman = item.mdsObjectVo.techLinkman
              if (curTechLinkman) {
                item.techLinkmanCardData = {
                  userId: curTechLinkman.id,
                  name: curTechLinkman.name,
                  position: curTechLinkman.position,
                  userAvatar: curTechLinkman.avatar ? _avatarUrl + curTechLinkman.avatar : '',
                  jobNumber: curTechLinkman.jobNumber,
                  phone: curTechLinkman.phone,
                  telephone: curTechLinkman.telephone,
                  email: curTechLinkman.email,
                  department: curTechLinkman.depts,
                  userAddress: curTechLinkman.address,
                }
              }
            } else if (this.coParams.appKeyEnum === 'DQS') {
              item.id = item.dqsSchedules.id
              item.name = item.dqsSchedules.name
              if (item.dqsSchedules.target) {
                item.description = `检查对象：${item.dqsSchedules.target.applyName}-${item.dqsSchedules.target.systemName}-${item.dqsSchedules.target.databaseName}-${item.dqsSchedules.target.tableName}`
              } else {
                item.description = ''
              }
              item.dateTm = formatDate(new Date(item.dqsSchedules.modifyTm), 'YYYY-MM-DD')
              item.tags = item.dqsSchedules.tags
              let curBusiLinkman = item.dqsSchedules.busiLinkman
              if (curBusiLinkman) {
                item.busiLinkmanCardData = {
                  userId: curBusiLinkman.id,
                  name: curBusiLinkman.name,
                  position: curBusiLinkman.position,
                  userAvatar: curBusiLinkman.avatar ? _avatarUrl + curBusiLinkman.avatar : '',
                  jobNumber: curBusiLinkman.jobNumber,
                  phone: curBusiLinkman.phone,
                  telephone: curBusiLinkman.telephone,
                  email: curBusiLinkman.email,
                  department: curBusiLinkman.depts,
                  userAddress: curBusiLinkman.address,
                }
              }
              let curTechLinkman = item.dqsSchedules.techLinkman
              if (curTechLinkman) {
                item.techLinkmanCardData = {
                  userId: curTechLinkman.id,
                  name: curTechLinkman.name,
                  position: curTechLinkman.position,
                  userAvatar: curTechLinkman.avatar ? _avatarUrl + curTechLinkman.avatar : '',
                  jobNumber: curTechLinkman.jobNumber,
                  phone: curTechLinkman.phone,
                  telephone: curTechLinkman.telephone,
                  email: curTechLinkman.email,
                  department: curTechLinkman.depts,
                  userAddress: curTechLinkman.address,
                }
              }
            }
          })
          this.collectionList = data          
          this.loading = false
        }).catch(err => {
          this.loading = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      getNoticeList () {
        this.noticeList = []
        this.loading = true
        // this.noticeList = [
        //   {
        //     content: '元数据中有通知项notice_record(通知记录表)',
        //     checked: false,
        //     isReader: false,
        //     createTime: '2019-09-26T11:20:13.045',
        //   },
        //   {
        //     content: '数据质量中有通知项db_value(库容量信息)',
        //     checked: true,
        //     isReader: true,
        //     createTime: '2019-10-17T09:56:06.045',
        //   },
        // ]
        // this.loading = false
        // return
        this.$apollo.query({
          query: NOTICE_LIST,
          fetchPolicy: 'network-only',
          client: 'mds',
          variables: {
            input: Object.assign({}, this.noticeParams),
          },
        }).then(respData => {
          this.loading = false
          let data = respData.data.data
          this.noticeList = data
        }).catch(err => {
          this.loading = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      getTodoList () {
        this.toDoList = []
        this.loading = true
        // this.toDoList = [
        //   {
        //     content: '数据安全中有待办项field',
        //     checked: true,
        //     isReader: true,
        //     createTime: '2019-09-25T18:56:06.045',
        //   },
        //   {
        //     content: '数据质量中有待办项table',
        //     checked: false,
        //     isReader: false,
        //     createTime: '2019-10-16T16:26:05.045',
        //   },
        // ]
        // this.loading = false
        // return
        this.$apollo.query({
          query: NOTICE_LIST,
          fetchPolicy: 'network-only',
          client: 'mds',
          variables: {
            input: Object.assign({}, this.noticeParams),
          },
        }).then(respData => {
          this.loading = false
          let data = respData.data.data
          this.toDoList = data
        }).catch(err => {
          this.loading = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      getMessageList () {
        this.privateMessageList = []
        this.loading = true
        // this.privateMessageList = [
        //   {
        //     content: '数据标准中有消息项table_name',
        //     checked: true,
        //     isReader: true,
        //     createTime: '2019-09-24T11:32:15.045',
        //   },
        //   {
        //     content: '数据质量中有消息项check_info',
        //     checked: true,
        //     isReader: true,
        //     createTime: '2019-10-17T14:16:25.045',
        //   },
        // ]
        // this.loading = false
        // return
        this.$apollo.query({
          query: PRIVATE_MESSAGE_LIST,
          fetchPolicy: 'network-only',
          client: 'mds',
          variables: {
            input: Object.assign({}, this.pmParams),
          },
        }).then(respData => {
          this.loading = false
          this.privateMessageList = respData.data.data.data
          this.totalVal = respData.data.data.total
        }).catch(err => {
          this.loading = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      handleTabClick (tab) {
        if (tab.name === 'Collection') {
          this.coParams.collectTypeEnum = 'COLLECT'
          this.getCollectionList()
        } else if (tab.name === 'Subscribe') {
          this.coParams.collectTypeEnum = 'SUBSCRIBE'
          this.getCollectionList()
        } else if (tab.name === 'Notification') {
          this.noticeParams.collectTypeEnum = 'SUBSCRIBE'
          this.getNoticeList()
        } else if (tab.name === 'Message') {
          this.getMessageList()
        } else if (tab.name === 'Todo') {
          this.noticeParams.collectTypeEnum = 'WORKTODO'
          this.getTodoList()
        }
      },
      search (val) {
        switch (this.activeName) {
          case 'Collection':
            // 收藏
            this.coParams = {
              collectTypeEnum: 'COLLECT',
              appKeyEnum: val.appKeyEnum,
            },
            this.getCollectionList()
            break
          case 'Subscribe':
            // 订阅
            this.coParams = {
              collectTypeEnum: 'SUBSCRIBE',
              appKeyEnum: val.appKeyEnum,
            },
            this.getCollectionList()
            break
          case 'Notification':
            // 通知
            break
          case 'Message':
            // 消息
            this.pmParams = {
              keyword: val.keyword,
              offset: val.offset,
              limit: val.limit,
            },
            this.getMessageList()
            break
          case 'Todo':
            // 待办
            this.getTodoList()
            break
          default:
            console.log('')
        }
      },
    },
  }
</script>
<style lang="scss">
  .user-content {
    .el-tabs {
      margin: 16px 0;
      width: 860px;

      .el-tabs__header {
        margin: 0 24px;
      }

      .el-tabs__nav-wrap::after {
        height: 1px;
        background-color: #EDEDED;
      }

      .el-tabs__active-bar {
        height: 3px;
        background-color: #477DE9;
      }

      .el-tabs__item {
        padding: 0 40px;
        font-size: 16px;
        color: #333333;
      }

      .el-tabs__item.is-active {
        color: #477DE9;
      }
    }
  }
</style>
