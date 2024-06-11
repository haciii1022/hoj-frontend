<template>
  <a-row id="globalHeader" align="center">
    <a-col flex="auto">
      <a-menu
        mode="horizontal"
        :selected-keys="selectedKeys"
        @menu-item-click="doMenuClick"
      >
        <a-menu-item
          key="0"
          :style="{ padding: 0, marginRight: '38px' }"
          disabled
        >
          <div class="title-bar">
            <img class="logo" src="../assets/oj-logo.jpg" />
            <div class="title">HOJ</div>
          </div>
        </a-menu-item>
        <a-menu-item v-for="route in visibleRoutes" :key="route.path">
          {{ route.name }}
        </a-menu-item>
      </a-menu>
    </a-col>
    <a-col flex="100px">
      {{ store.state.user?.loginUser?.userName ?? "未登录" }}
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
import { routes } from "@/router/routes";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import checkAccess from "@/access/checkAccess";
import ACCESS_ENUM from "@/access/accessEnum";

const router = useRouter();
const store = useStore();

console.log("store", store.state.user.loginUser.userName);
// 默认主页
const selectedKeys = ref(["/"]);
const doMenuClick = (key: string) => {
  router.push({
    path: key,
  });
};

//用于展示的路由
const visibleRoutes = computed(() => {
  return routes.filter((item) => {
    if (item.meta?.hideInMenu) {
      return false;
    }
    //根据权限校验
    return checkAccess(
      store.state.user.loginUser,
      item?.meta?.access as string
    );
  });
});

setTimeout(() => {
  store.dispatch("user/getLoginUser", {
    userName: "haciii1022",
    userRole: ACCESS_ENUM.ADMIN,
  });
  console.log("store", store.state.user.loginUser.userName);
}, 5000);

// 路由跳转后，更新选中的菜单项
router.afterEach((to, from, failure) => {
  selectedKeys.value = [to.path];
});
</script>

<style scoped>
#globalHeader {
}

.title-bar {
  display: flex;
  align-items: center;
}

.logo {
  height: 48px;
}

.title {
  color: #2137ff;
  margin-left: 16px;
}
</style>
