<template>
  <div id="userLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header"> 用户布局</a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://haciii1022.github.io/">知识星球 By Mirror</a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
#userLayout {
}

#userLayout .header {
  box-shadow: #bcfff8 1px 1px 10px;
}

#userLayout .content {
  background: linear-gradient(to right, #aaa, #fff);
  padding: 20px;
  margin-bottom: 16px;
}

#userLayout .footer {
  background: #baafff;
  padding: 16px;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
</style>
