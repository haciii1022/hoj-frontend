<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<style>
#app {
}
</style>

<script setup lang="ts">
import BasicLayout from "@/layouts/BasicLayout.vue";
import { useRouter } from "vue-router";
import store from "@/store";
import ACCESS_ENUM from "@/access";

const router = useRouter();

router.beforeEach((to, from, next) => {
  if (to.meta?.access === "canAdmin") {
    if (store.state.user.loginUser?.role !== ACCESS_ENUM.ADMIN) {
      next("/noAuth");
      return;
    }
  }
  next();
});
</script>
