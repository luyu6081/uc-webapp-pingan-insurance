<template>
  <div class="collection-order-view">
    <div class="ej-search-list">
      <div class="input-box flex justify-between items-center mb-4">
        <div class="flex flex-wrap items-end">
          <ej-search-input width="552" v-model="params.keyword" placeholder="请输入资料名称" @search="handleSearch"/>
        </div>
      </div>
      <div class="ej-search-options ej-search-conditions relative pb-5">
        <div v-show="isExpandList">
          <div class="ej-conditions-item">
            <span class="title">系统名称</span>
            <div ref="listWrapper" class="ej-conditions-item__content" :class="{'max-height-300': isMore}">
              <div class="flex flex-wrap max-w-full" ref="listContent">
                <div class="ej-conditions-list" :class="item.appName === curAppKeyEnum ? 'active' : ''" v-for="(item, index) in systemList" :key="index" @click="handleSystem(item)">{{item.systemName}}</div>
              </div>
              <span class="ej-conditions-more" v-show="isMoreBtn" @click="isMore = !isMore">
                {{showMoreText}}
                <i :class="isMore ? 'up-active' : ''" class="el-icon-arrow-down"></i>
              </span>
            </div>
          </div>
        </div>
        <div class="more-line cursor-pointer" @click="isExpandList = !isExpandList">
          <el-tooltip :open-delay="150" :content="moreText" placement="bottom" popper-class="ej-search-options__tooltip">
            <i class="el-icon-arrow-down text-blue" :class="{'active': isExpandList}"/>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="collection-order-list">
      <div class="empty-wrap" v-if="coList.length === 0">暂无数据</div>
      <div class="co-list" v-for="(item, index) in coList" :key="index" v-else>
        <div class="flex justify-between plr">
          <!-- <div class="flex co-title-wrap" @click="handleHrefSystem(item.name)">          
            <ej-icon icon="idcard" class="co-icon" />
            <div class="co-title">
              {{item.name}}
              <span><i></i>{{curAppName}}</span>
            </div>
          </div> -->
          <!-- <a class="flex co-title-wrap" target="_blank" :href="curAppKeyEnum === 'MDS' ? `${NUXT_ENV_MDS_URL}#/detail/${item.id}` : (curAppKeyEnum === 'DQS' ? `${NUXT_ENV_DQS_URL}rule/${item.id}` : (curAppKeyEnum === 'DS' ? `${NUXT_ENV_DS_URL}` : `${NUXT_ENV_SAMS_URL}`))"> -->
          <a class="flex co-title-wrap" target="_blank" :href="redirectUrl(item)">
            <ej-icon icon="idcard" class="co-icon" />
            <div class="co-title">
              {{item.name}}
              <span><i></i>{{curAppName}}</span>
            </div>
          </a>
          <div class="co-date" v-show="curAppKeyEnum === 'MDS'">{{item.dateTm}}</div>
        </div>
        <div class="co-content plr">        
          <div class="co-text" v-html="item.description"></div>
          <div class="flex co-type">
            <div class="co-type-item" v-show="curAppKeyEnum === 'MDS'">所属系统:<span class="type-item-span">{{item.belongSystem}}</span></div>
            <div class="co-type-item" v-show="curAppKeyEnum === 'MDS'">资产等级:<span class="type-item-span">{{item.assetsLevel}}</span></div>
            <div class="co-type-item" v-show="curAppKeyEnum === 'MDS'">安全等级:<span class="type-item-span">{{item.d4aSafetyRank}}</span></div>
            <div class="co-type-item">
              业务负责人:
              <ej-user-card :data="item.busiLinkmanCardData" :class="curAppKeyEnum === 'MDS' ? 'position-left' : ''">
                <template slot="img">
                  <span class="ml-2 text-blue">{{item.busiLinkmanCardData.name}}</span>
                </template>
              </ej-user-card>
            </div>
            <div class="co-type-item">技术负责人:
              <ej-user-card :data="item.techLinkmanCardData" :class="curAppKeyEnum === 'MDS' ? 'position-left' : ''">
                <template slot="img">
                  <span class="ml-2 text-blue">{{item.techLinkmanCardData.name}}</span>
                </template>
              </ej-user-card>
            </div>
            <div class="co-type-item" v-show="curAppKeyEnum === 'DQS'">最近执行日期:<span class="type-item-span">{{item.dateTm}}</span></div>
          </div>
          <div class="flex justify-between">
            <div class="co-tag">
              <span :class="cIndex === 0 ? 'purple' : (cIndex === 1 ? 'orange' : (cIndex === 2 ? 'green' : 'purple'))" v-for="(cItem, cIndex) in item.tags" :key="cIndex">{{cItem.tagName}}</span>
            </div>
            <div class="co-function flex justify-between">
              <div><i class="el-icon-star-off"></i>{{item.collectCount}}</div>
              <div><i class="el-icon-view"></i>{{item.browseCount}}</div>
              <div><ej-icon icon="pin-o" key="pin-o" class="ej-icon-pin-o"/>{{item.subscribeCount}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="my-pagination mt-sm">
      <common-pagination
        :total="params.total"
        :page-size="params.limit"
        :current-page="currentPage"
        @current-change="currentChange"/>
    </div> -->
  </div>
  
</template>

<script>
  import Vue from 'vue'
  import {
    Tooltip as ElTooltip,
  } from 'element-ui'
  import {
    Icon,
    Loading,
    UserCard,
  } from '@ej/ui'
  import runtimeArgs from '@/runtime-args'
  // import Pagination from '@/components/pagination'
  import SYSTEM_LIST from './graphql/system_list.gql'
  Vue.use(Icon)
  Vue.use(Loading)
  Vue.use(UserCard)
  // Vue.use(Pagination)
  export default {
    name: 'EjCollectionOrderList',
    components: {
      ElTooltip,
    },
    props: {
      data: Array,
      coParams: Object,
    },
    data () {
      return {
        loadingCS: false,
        curAppKeyEnum: 'MDS',
        curAppName: '元数据',
        params: {
          collectTypeEnum: '',
          keyword: '',
          appKeyEnum: '',
        },
        isMoreBtn: false,
        isMore: false,
        isExpandList: true,
        originList: [], // 从接口取出的数据
        coList: [], // 查询数据
        systemList: [
          {
            appName: 'MDS',
            systemName: '元数据',
            systemDesc: '用于元数据处理，提供元数据信息',
          },
          {
            appName: 'DQS',
            systemName: '数据质量',
            systemDesc: '用于数据质量规则处理，与元数据信息对接',
          },
        ],
      }
    },
    computed: {
      showMoreText () {
        return this.isMore ? '收起' : '更多'
      },
      moreText () {
        return this.isExpandList ? '收起' : '展开过滤选项'
      },
      currentPage () {
        return this.params.offset
      },
    },
    watch: {
      coParams (val) {
        this.params = {
          collectTypeEnum: val.collectTypeEnum,
          appKeyEnum: val.appKeyEnum,
        }
        this.curAppKeyEnum = val.appKeyEnum
      },
      data (val) {
        this.coList = this.originList = val
      },
      // total (val) {
      //   this.params.total = val
      // },
    },
    created () {
      // this.getSystemList()
    },
    methods: {
      handleHtmlFilter (flagment) {
        return xss(flagment, {
          onIgnoreTag: function (tag, html, options) {
            if (tag.substr(0, 2) === 'x-') {
              return html
            }
          },
        })
      },
      redirectUrl (item) {
        let curUrl = ''
        switch (this.curAppKeyEnum) {
          case 'MDS':
            curUrl = `${runtimeArgs.NUXT_ENV_MDS_URL}#/detail/${item.id}`
            break
          case 'DQS':
            curUrl = `${runtimeArgs.NUXT_ENV_DQS_URL}rule/${item.id}`
            break
          case 'DS':
            curUrl = `${runtimeArgs.NUXT_ENV_DS_URL}`
            break
          case 'DRD': // sams
            curUrl = `${runtimeArgs.NUXT_ENV_SAMS_URL}`
            break
          case 'D4A':
            curUrl = `${runtimeArgs.NUXT_ENV_D4A_URL}`
            break
        }
        return curUrl
      },
      handleHrefSystem (name) {
        switch (this.curAppKeyEnum) {
          case 'MDS':
            // 元数据
            // location.href = process.env.NUXT_ENV_MDS_URL
            window.open(`${runtimeArgs.NUXT_ENV_MDS_URL}#/search?s=${name}`, '_target')
            break
          case 'DQS':
            // 数据质量
            // location.href = process.env.NUXT_ENV_DQS_URL
            window.open(`${runtimeArgs.NUXT_ENV_DQS_URL}rules`, '_target')
            break
          case 'DS':
            // 数据标准
            // location.href = process.env.NUXT_ENV_DS_URL
            window.open(runtimeArgs.NUXT_ENV_DS_URL, '_target')
            break
          case 'SAMS':
            // 数据资源目录 NUXT_ENV_SAMS_URL
            window.open(runtimeArgs.NUXT_ENV_SAMS_URL, '_target')
            // location.href = process.env.NUXT_ENV_SAMS_URL
            break
        }
      },
      // 获取系统条件
      getSystemList () {
        let systemParams = {
          appName: null,
        }
        this.$apollo.query({
          query: SYSTEM_LIST,
          client: 'auth',
          fetchPolicy: 'network-only',
          variables: {
            input: Object.assign({}, systemParams),
          },
        }).then((data) => {
          let curData = data.data.data
          curData.forEach(item => {
            if (item.appName === 'UC' || item.appName === 'DLC' || item.appName === 'PMC')
            {} else {
              this.systemList.push(item)
            }
          });
          // this.systemList = data.data.data
          this.$nextTick(() => {
            // 减掉80的右内边距
            const listWrapper = this.$refs.listWrapper.offsetWidth - 80
            const listContent = this.$refs.listContent.offsetWidth

            // 判断长度超过父级
            this.isMoreBtn = listContent >= listWrapper
          })
        })
      },

      handleSystem (item) {
        this.curAppName = item.systemName
        this.curAppKeyEnum = item.appName
        this.params.appKeyEnum = item.appName
        this.$emit('search', this.params)
      },

      handleSearch () {
        // this.loadingCS = true
        let searchList = []
        this.originList.forEach(item => {
          if (item.name.toLowerCase().indexOf(this.params.keyword.toLowerCase()) >= 0) {
            searchList.push(item)
          }
        })
        this.coList = searchList
        // setTimeout(() => {
        //   let searchList = []
        //   this.originList.forEach(item => {
        //     if (item.name.toLowerCase().indexOf(this.params.keyword.toLowerCase()) >= 0) {
        //       searchList.push(item)
        //     }
        //   })
        //   this.coList = searchList
        //   // this.loadingCS = false
        // }, 800)        
      },

      // currentChange () {
      //   this.params.offset = val
      //   this.$emit('search', this.params)
      // },
    },
  }
</script>
<style lang="scss">
  .collection-order-view {
    margin: 20px 24px 0px 24px;
    padding-bottom: 20px;
    min-height: 450px;

    .ej-search-input > .el-input__inner {
      border-radius: 4px;
    }

    .ej-conditions-list {
      color: #666666;

      &:hover {
        color: #477DE9;
      }

      &.active {
        color: #477DE9;
      }
    }

    .collection-order-list {
      // border-top: 1px solid #F4F4F4;

      .plr {
        padding: 0 24px;
      }

      .co-list {
        border-bottom: 1px solid #F4F4F4;
        padding: 18px 0;
      }

      .co-icon {
        margin-top: 4px;
        width: 19px;
        height: 19px;
        color: #477DE9;
      }

      .co-title-wrap {
        color: #333333;
        line-height: 28px;
        cursor: pointer;

        .co-title {
          margin-left: 9px;
          font-size: 16px;
        }

        span {
          font-size: 12px;
          color: #477DE9;
          vertical-align: top;

          i {
            margin: 0 8px 3px 12px;
            display: inline-block;
            width: 4px;
            height: 4px;
            background-color: #477DE9;
          }
        }
      }

      .co-date {
        font-size: 12px;
        color: #999999;
      }

      .co-content {
        margin-left: 23px;
      }

      .co-text {
        margin: 2px 0 12px 0;
        color: #666666;
        line-height: 24px;
      }

      .co-type {
        margin-bottom: 12px;
        font-size: 12px;
        color: #999999;

        .co-type-item {
          // width: 180px;
          flex: 1;

          .type-item-span {
            display: inline-block;
            vertical-align: middle;
            margin-left: 0.5rem;
            width: 73px;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
          }

          .position-left {
            .box-postcard {
              left: -200px !important;
            }
          }          
        }
      }

      .co-tag {
        span {
          display: inline-block;
          font-size: 12px;
          padding: 2px 8px;
          margin-right: 20px;

          &.purple {
            color: #8F4CFF;
            background-color: rgba(235,223,255,0.3);
            border: 1px solid #EBDFFF;
            border-radius: 4px;
          }

          &.green {
            color: #52C41A;
            background-color:  rgba(183,235,143,0.3);
            border: 1px solid #B7EB8F;
            border-radius: 4px;
          }

          &.orange {
            color: #FA7800;
            background-color:  rgba(255,227,203,0.3);
            border: 1px solid #FFE3CB;
            border-radius: 4px;
          }
        }
      }

      .co-function {
        width: 151px;
        font-size: 12px;
        color: #999999;
        line-height: 24px;

        i {
          display: inline-block;
          margin-right: 5px;
          // width: 14px;
          // height: 14px;
          font-size: 14px;
        }
        .ej-icon-pin-o {
          display: inline-block;
          vertical-align: text-top;
          margin-right: 5px;
          width: 13px;
          height: 13px;
        }
      }
    }

    .el-pagination {
      margin-top: 32px;

      .btn-prev, .btn-next {
        background-color: transparent;
      }

      .el-pager {
        li {
          background-color: transparent;

          &.active {
            background-color: #477DE9 !important;
            width: 24px;
            height: 24px;
            line-height: 24px;
            border-radius: 4px;
          }

          &.active:hover {
            color: #ffffff !important;
          }

          &:hover {
            color: #477DE9 !important;
          }
        }
      }
    }
  }
</style>
