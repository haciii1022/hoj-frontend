<template>
  <div id="app">
    <template v-if="route.path.startsWith('/user')">
      <router-view />
    </template>
    <template v-else>
      <BasicLayout />
    </template>
  </div>
</template>
<style>
#app {
}
</style>

<script setup lang="ts">
import BasicLayout from "@/layouts/BasicLayout.vue";
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { debounce } from "lodash";
import store from "@/store";

const route = useRoute();

const doInit = () => {
  console.log("init");
};

onMounted(() => {
  doInit();
});

/**
 * 防抖动
 */
const _ = (window as any).ResizeObserver;
(window as any).ResizeObserver = class ResizeObserver extends _ {
  constructor(callback: (...args: any[]) => void) {
    callback = debounce(callback, 100);
    super(callback);
  }
};
</script>
<style>
#app {
  background: #ededed;
  height: 100vh;
  overflow-x: hidden;
}
body {
  user-select: none; /* 禁止文字选中 */
}
.arco-btn-text:hover {
  background-color: transparent !important; /* 禁止悬停背景色 */
}
</style>
