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
            <img alt="logo" class="logo" src="../assets/oj-logo.jpg" />
            <div class="title">HOJ</div>
          </div>
        </a-menu-item>
        <a-menu-item v-for="route in visibleRoutes" :key="route.path">
          {{ route.name }}
        </a-menu-item>
      </a-menu>
    </a-col>
    <a-col flex="100px">
      <a-dropdown trigger="hover">
        <a-avatar shape="circle">
          <template
            v-if="loginUser
            && loginUser.userRole as string !== ACCESS_ENUM.NOT_LOGIN"
          >
            <template v-if="loginUser.userAvatar">
              <img
                alt="avatar"
                :src="loginUser.userAvatar"
                class="userAvatar"
              />
            </template>
            <template v-else>
              <img
                alt="avatar"
                src="../assets/default_avatar.svg"
                class="userAvatar"
              />
            </template>
          </template>
          <template v-else>
            <img
              alt="avatar"
              src="../assets/not_login.svg"
              class="userAvatar"
            />
          </template>
        </a-avatar>
        <template #content>
          <template
            v-if="loginUser
            && loginUser.userRole as string !== ACCESS_ENUM.NOT_LOGIN"
          >
            <a-doption>
              <template #icon>
                <icon-user />
              </template>
              <template #default>
                <a-anchor-link href="/user/info">个人信息</a-anchor-link>
              </template>
            </a-doption>
            <a-doption>
              <template #icon>
                <icon-user />
              </template>
              <template #default>
                <a-anchor-link @click="doLogout">退出登录</a-anchor-link>
              </template>
            </a-doption>
          </template>
          <template v-else>
            <a-doption>
              <template #icon>
                <icon-user />
              </template>
              <template #default>
                <a-anchor-link href="/user/login">登录</a-anchor-link>
              </template>
            </a-doption>
          </template>
        </template>
      </a-dropdown>
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
import { UserControllerService } from "../../generated";

const router = useRouter();
const store = useStore();
//FIXME 每次浏览器刷新，就会把store中的数据清除，后续要改成持久化存储
let loginUser = JSON.parse(localStorage.getItem("loginUser") as string);
// let loginUser = ref(store.state.user.loginUser);
console.log("User111 " + JSON.stringify(loginUser));
// 默认主页
const selectedKeys = ref(["/"]);

const doMenuClick = (key: string) => {
  router.push({
    path: key,
  });
};

const doLogout = () => {
  UserControllerService.userLogoutUsingPost();
  localStorage.removeItem("loginUser");
  location.reload();
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

// 路由跳转后，更新选中的菜单项
router.afterEach((to, from, failure) => {
  selectedKeys.value = [to.path];
});
</script>

<style scoped>
#globalHeader {
  height: 10vh;
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
