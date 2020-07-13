<template>
  <div class="default-layout">
    <app-header title="个人中心" logo="/logo.svg" class="app-header">
      <template #tray>
        <div v-if='0'>
          <ej-app-notification/>
        </div>
        <ej-app-usermenu :user="userData" :endpoint="endpoint"/>
      </template>
    </app-header>

    <div v-ej-loading.fullScreen="!loading" class="app-main">
      <nuxt/>
    </div>
  </div>
</template>

<script>
  import {
    AppHeader,
    AppNotification as EjAppNotification,
    AppUsermenu as EjAppUsermenu,
    // Loading as EjLoading,
  } from '@ej/ui'
  import runtimeArgs from '@/runtime-args'
  export default {
    name: 'DefaultLayout',

    components: {
      AppHeader,
      EjAppNotification,
      EjAppUsermenu,
      // EjLoading,
    },
    data () {
      return {
        endpoint: {
          avatarUrl: runtimeArgs.NUXT_ENV_AUTH_FRONTIER_HTTP + 'fileDownload', /* 头像获取环境变量 */
          loginUrl: runtimeArgs.NUXT_ENV_LOGIN_URL, /* 登录系统地址环境变量 */
          client: 'ucClient', /* 调用auth-frontier中的退出接口：client名称 */
        },
      }
    },
    computed: {
      userData () {
        return this.$nuxt.$store.$app.state.me
      },
      loading () {
        return Object.keys(this.userData).length
      },
    },

  }
</script>

<style lang="scss">
  .default-layout {
    background-color: #F4F4F4;

    .app-header {
      @apply flex-none;
    }

    .app-main {
      position: relative;
    }
  }
</style>
