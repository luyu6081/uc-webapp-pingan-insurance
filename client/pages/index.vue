<template>
  <div class="user-view-page flex mx-auto">
    <aside class="aside-view flex-none">
      <ej-user-aside></ej-user-aside>
    </aside>
    <div class="main-view flex-auto">
      <ej-user-content></ej-user-content>
    </div>
  </div>
</template>
<script>
  import EjUserAside from '../components/user-aside/user-aside.vue'
  import EjUserContent from '../components/user-content/user-content.vue'
  export default {
    name: 'message-view',
    components: {
      EjUserAside,
      EjUserContent,
    },
    data () {
      return {
      }
    },

    computed: {
    },

    methods: {},
  }
</script>  
<style lang="scss">
  .user-view-page {
    padding-top: 20px;
    width: 1100px;
    min-height: 100vh;
  }

  .aside-view {
    @apply bg-white;

    width: 240px;
    padding: 13px 0 20px 0;
  }

  .main-view {
    @apply bg-white;

    margin-left: 12px;
    flex: 1 1 auto;
  }
</style>
