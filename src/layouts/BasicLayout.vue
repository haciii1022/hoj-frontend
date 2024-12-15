<template>
  <div id="basicLayout">
    <a-layout>
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <!--      <a-layout-footer class="footer">-->
      <!--        <a href="https://haciii1022.github.io/">知识星球 By Mirror</a>-->
      <!--      </a-layout-footer>-->
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from "@/components/GlobalHeader.vue";
</script>

<style scoped>
#basicLayout {
}

#basicLayout .header {
  position: fixed; /* 固定顶部 */
  top: 0;
  left: 0;
  right: 0;
  height: 9.5vh; /* 固定高度 */
  background: white;
  z-index: 1000; /* 确保在页面内容上方 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 增加阴影效果 */
}

#basicLayout .content {
  margin-top: 10vh; /* 与 Header 高度一致 */
  background: #ededed;
  height: 90vh;
  padding: 10px;
  margin-bottom: 8px;
}

#basicLayout .footer {
  padding: 16px;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
</style>
